import { randomUUID } from "crypto";
import type { Room, Player, Message, WordPair } from "@shared/schema";
import { readFileSync } from "fs";
import { join } from "path";

export interface IStorage {
  createRoom(hostId: string, hostName: string): Room;
  getRoom(code: string): Room | undefined;
  addPlayerToRoom(roomCode: string, playerId: string, playerName: string): Room | undefined;
  updatePlayerConnection(roomCode: string, playerId: string, isConnected: boolean): void;
  startGame(roomCode: string): Room | undefined;
  addMessage(roomCode: string, playerId: string, playerName: string, text: string): Room | undefined;
  moveToVotingPhase(roomCode: string, playerId: string): Room | undefined;
  submitVote(roomCode: string, playerId: string, targetPlayerId: string): { room: Room; allVoted: boolean } | undefined;
  startNextRound(roomCode: string): Room | undefined;
  kickPlayer(roomCode: string, targetPlayerId: string): Room | undefined;
  reconnectPlayer(roomCode: string, playerId: string): Room | undefined;
  deleteRoom(code: string): void;
  updateSettings(roomCode: string, settings: { allowOddOneOutReveal?: boolean; enableTimer?: boolean; category?: string }): Room | undefined;
}

export class MemStorage implements IStorage {
  private rooms: Map<string, Room>;
  private wordPacks: WordPair[][];

  constructor() {
    this.rooms = new Map();
    this.wordPacks = this.loadWordPacks();
  }

  private loadWordPacks(): WordPair[][] {
    const packFiles = ['animals', 'food', 'countries', 'sports', 'professions', 'players'];
    const packs: WordPair[][] = [];

    for (const file of packFiles) {
      try {
        const path = join(process.cwd(), 'public', 'wordpacks', `${file}.json`);
        const content = readFileSync(path, 'utf-8');
        const pack = JSON.parse(content);
        packs.push(pack.pairs);
      } catch (error) {
        console.error(`Failed to load word pack ${file}:`, error);
      }
    }

    return packs;
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code: string;
    
    do {
      code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    } while (this.rooms.has(code));
    
    return code;
  }

  private getRandomWordPair(usedWords: string[] = [], excludedCategories: string[] = []): WordPair {
    let wordPair: WordPair;
    let attempts = 0;
    const packFiles = ['animals', 'food', 'countries', 'sports', 'professions', 'players'];
    
    do {
      let availablePacks = this.wordPacks;
      if (excludedCategories.length > 0) {
        // Filter out excluded categories
        availablePacks = this.wordPacks.filter((_, index) => {
          const categoryName = packFiles[index];
          return !excludedCategories.includes(categoryName);
        });
      }
      
      if (availablePacks.length === 0) {
        // If all categories are excluded, use all packs
        availablePacks = this.wordPacks;
      }
      
      const packIndex = Math.floor(Math.random() * availablePacks.length);
      const pack = availablePacks[packIndex];
      const pairIndex = Math.floor(Math.random() * pack.length);
      wordPair = pack[pairIndex];
      attempts++;
    } while (usedWords.includes(wordPair.normal) && attempts < 100);
    
    return wordPair;
  }

  private getRandomWordPairFromCategory(category: string, usedWords: string[] = []): WordPair {
    const packFiles = ['animals', 'food', 'countries', 'sports', 'professions', 'players'];
    const categoryIndex = packFiles.indexOf(category);
    
    if (categoryIndex === -1 || !this.wordPacks[categoryIndex]) {
      console.warn(`Category '${category}' not found. Falling back to random.`);
      return this.getRandomWordPair(usedWords);
    }

    const categoryPack = this.wordPacks[categoryIndex];
    let wordPair: WordPair;
    let attempts = 0;
    
    do {
      const pairIndex = Math.floor(Math.random() * categoryPack.length);
      wordPair = categoryPack[pairIndex];
      attempts++;
    } while (usedWords.includes(wordPair.normal) && attempts < 100);
    
    return wordPair;
  }

  private getRandomOddOneOut(roomCode: string, players: Player[]): string {
    // Completely random selection - no patterns
    const randomIndex = Math.floor(Math.random() * players.length);
    return players[randomIndex].id;
  }

  createRoom(hostId: string, hostName: string): Room {
    const code = this.generateRoomCode();
    const host: Player = {
      id: hostId,
      name: hostName,
      isHost: true,
      isConnected: true,
      points: 0,
    };

    const room: Room = {
      code,
      hostId,
      phase: 'lobby',
      players: [host],
      messages: [],
      roundNumber: 1,
      votesReadyCount: 0,
      usedWords: [],
      settings: {
        allowOddOneOutReveal: false,
        enableTimer: true,
        discussionTimeMinutes: 3,
        excludedCategories: [],
      },
    };

    this.rooms.set(code, room);
    return room;
  }

  getRoom(code: string): Room | undefined {
    return this.rooms.get(code);
  }

  addPlayerToRoom(roomCode: string, playerId: string, playerName: string): Room | undefined {
    const room = this.rooms.get(roomCode);
    if (!room || room.phase !== 'lobby') return undefined;

    // Check if player already exists (reconnection)
    const existingPlayer = room.players.find(p => p.id === playerId);
    if (existingPlayer) {
      existingPlayer.isConnected = true;
      return room;
    }

    // Add new player
    const player: Player = {
      id: playerId,
      name: playerName,
      isHost: false,
      isConnected: true,
      points: 0,
    };

    room.players.push(player);
    return room;
  }

  updatePlayerConnection(roomCode: string, playerId: string, isConnected: boolean): void {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.isConnected = isConnected;
    }
  }

  startGame(roomCode: string): Room | undefined {
    const room = this.rooms.get(roomCode);
    if (!room || room.phase !== 'lobby' || room.players.length < 3) return undefined;

    // Use category from settings if specified
    const category = room.settings?.category;
    const excludedCategories = room.settings?.excludedCategories || [];
    const wordPair = category && category !== "random" 
      ? this.getRandomWordPairFromCategory(category, room.usedWords || [])
      : this.getRandomWordPair(room.usedWords || [], excludedCategories);
    room.currentWord = wordPair;
    
    // Add to used words
    if (!room.usedWords) room.usedWords = [];
    room.usedWords.push(wordPair.normal);

    // Select random odd one out (prevent repeats)
    room.oddOneOutId = this.getRandomOddOneOut(roomCode, room.players);

    // Reset players (don't mark isOddOneOut - hide from players)
    room.players.forEach((player) => {
      player.votedFor = undefined;
    });

            // Start discussion phase with timer (if enabled)
            room.phase = 'discussion';
            if (room.settings?.enableTimer !== false) {
              const minutes = room.settings?.discussionTimeMinutes || 3;
              room.timerEndsAt = Date.now() + (minutes * 60000);
            } else {
              room.timerEndsAt = undefined;
            }
            room.messages = [];
            room.votesReadyCount = 0;
            room.votesReadyPlayers = [];

    return room;
  }

  moveToVotingPhase(roomCode: string, playerId: string): Room | undefined {
    const room = this.rooms.get(roomCode);
    if (!room || room.phase !== 'discussion') return undefined;

    // Initialize arrays if needed
    if (!room.votesReadyPlayers) room.votesReadyPlayers = [];
    
    // Check if player already voted
    if (room.votesReadyPlayers.includes(playerId)) {
      return room; // Already voted, no change
    }

    // Add player to ready list
    room.votesReadyPlayers.push(playerId);
    room.votesReadyCount = room.votesReadyPlayers.length;
    
    // Check if majority is ready (more than half)
    const majorityNeeded = Math.ceil(room.players.length / 2);
    if (room.votesReadyCount < majorityNeeded) {
      // Not enough votes yet - stay in discussion
      return room;
    }

    // Majority reached - start voting phase
    room.phase = 'voting';
    room.timerEndsAt = Date.now() + 60000; // 1 minute for voting
    room.players.forEach(p => p.votedFor = undefined); // Reset votes
    room.votesReadyCount = 0; // Reset for next round
    room.votesReadyPlayers = []; // Reset ready players

    return room;
  }

  addMessage(roomCode: string, playerId: string, playerName: string, text: string): Room | undefined {
    const room = this.rooms.get(roomCode);
    if (!room || room.phase !== 'discussion') return undefined;

    const message: Message = {
      id: randomUUID(),
      playerId,
      playerName,
      text,
      timestamp: Date.now(),
    };

    room.messages.push(message);
    return room;
  }

  submitVote(roomCode: string, playerId: string, targetPlayerId: string): { room: Room; allVoted: boolean } | undefined {
    const room = this.rooms.get(roomCode);
    if (!room || room.phase !== 'voting') return undefined;

    const player = room.players.find(p => p.id === playerId);
    if (!player || player.votedFor) return undefined;

    // Allow odd one out to vote for themselves (they can guess correctly and get points)
    player.votedFor = targetPlayerId;

    // Calculate points
    const oddPlayer = room.players.find(p => p.id === room.oddOneOutId);
    if (targetPlayerId === room.oddOneOutId && oddPlayer) {
      // Correct guess - give points to whoever voted for odd-one-out
      player.points = (player.points || 0) + 10;
    } else if (targetPlayerId === playerId && playerId === room.oddOneOutId) {
      // Odd-one-out guesses themselves correctly
      player.points = (player.points || 0) + 15;
    }

    // Check if all players have voted
    const allVoted = room.players.every(p => p.votedFor !== undefined);
    if (allVoted) {
      // Award odd-one-out extra points if they guessed correctly
      if (oddPlayer && oddPlayer.votedFor === room.oddOneOutId) {
        oddPlayer.points = (oddPlayer.points || 0) + 5; // Bonus for self-identification
      }
      // Move to reveal phase
      room.phase = 'reveal';
      room.timerEndsAt = undefined;
    }

    return { room, allVoted };
  }

  startNextRound(roomCode: string): Room | undefined {
    const room = this.rooms.get(roomCode);
    if (!room || room.phase !== 'reveal') return undefined;

    // Use category from settings if specified
    const category = room.settings?.category;
    const excludedCategories = room.settings?.excludedCategories || [];
    const wordPair = category && category !== "random" 
      ? this.getRandomWordPairFromCategory(category, room.usedWords || [])
      : this.getRandomWordPair(room.usedWords || [], excludedCategories);
    room.currentWord = wordPair;

    // Add to used words
    if (!room.usedWords) room.usedWords = [];
    room.usedWords.push(wordPair.normal);

    // Select new random odd one out
    room.oddOneOutId = this.getRandomOddOneOut(roomCode, room.players);

    // Reset players (don't mark isOddOneOut)
    room.players.forEach((player) => {
      player.votedFor = undefined;
    });

    // Start discussion phase with timer (if enabled)
    room.phase = 'discussion';
    if (room.settings?.enableTimer !== false) {
      const minutes = room.settings?.discussionTimeMinutes || 3;
      room.timerEndsAt = Date.now() + (minutes * 60000);
    } else {
      room.timerEndsAt = undefined;
    }
    room.messages = [];
    room.roundNumber++;
    room.votesReadyCount = 0;
    room.votesReadyPlayers = [];

    return room;
  }

  kickPlayer(roomCode: string, targetPlayerId: string): Room | undefined {
    const room = this.rooms.get(roomCode);
    if (!room) return undefined;

    // Remove player from room
    room.players = room.players.filter(p => p.id !== targetPlayerId);

    // If kicked during game, reset to lobby
    if (room.phase !== 'lobby') {
      room.phase = 'lobby';
      room.currentWord = undefined;
      room.oddOneOutId = undefined;
      room.timerEndsAt = undefined;
            room.messages = [];
            room.votesReadyCount = 0;
            room.votesReadyPlayers = [];
            room.roundNumber = 1;

      // Reset all players' votes
      room.players.forEach((player) => {
        player.votedFor = undefined;
      });
    }

    return room;
  }

  reconnectPlayer(roomCode: string, playerId: string): Room | undefined {
    const room = this.rooms.get(roomCode);
    if (!room) return undefined;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return undefined;

    // Reconnect player
    player.isConnected = true;
    return room;
  }

  deleteRoom(code: string): void {
    this.rooms.delete(code);
  }

  updateSettings(roomCode: string, settings: { allowOddOneOutReveal?: boolean; enableTimer?: boolean; discussionTimeMinutes?: number; category?: string; excludedCategories?: string[] }): Room | undefined {
    const room = this.rooms.get(roomCode);
    if (!room) return undefined;

    if (!room.settings) {
      room.settings = {
        allowOddOneOutReveal: false,
        enableTimer: true,
        discussionTimeMinutes: 3,
        excludedCategories: [],
      };
    }

    if (settings.allowOddOneOutReveal !== undefined) {
      room.settings.allowOddOneOutReveal = settings.allowOddOneOutReveal;
    }
    if (settings.enableTimer !== undefined) {
      room.settings.enableTimer = settings.enableTimer;
    }
    if (settings.category !== undefined) {
      room.settings.category = settings.category || undefined;
    }
    if (settings.excludedCategories !== undefined) {
      if (!room.settings.excludedCategories) {
        room.settings.excludedCategories = [];
      }
      room.settings.excludedCategories = settings.excludedCategories;
    }

    return room;
  }
}

export const storage = new MemStorage();
