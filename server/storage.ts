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
  moveToVotingPhase(roomCode: string): Room | undefined;
  submitVote(roomCode: string, playerId: string, targetPlayerId: string): { room: Room; allVoted: boolean } | undefined;
  startNextRound(roomCode: string): Room | undefined;
}

export class MemStorage implements IStorage {
  private rooms: Map<string, Room>;
  private wordPacks: WordPair[][];

  constructor() {
    this.rooms = new Map();
    this.wordPacks = this.loadWordPacks();
  }

  private loadWordPacks(): WordPair[][] {
    const packFiles = ['animals', 'food', 'countries', 'sports', 'professions'];
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

  private getRandomWordPair(): WordPair {
    const packIndex = Math.floor(Math.random() * this.wordPacks.length);
    const pack = this.wordPacks[packIndex];
    const pairIndex = Math.floor(Math.random() * pack.length);
    return pack[pairIndex];
  }

  private getRandomOddOneOut(roomCode: string, players: Player[]): string {
    let oddIndex: number;
    const room = this.rooms.get(roomCode);
    const lastOddId = room?.oddOneOutId;
    
    // Prevent same player from being odd one out twice in a row
    do {
      oddIndex = Math.floor(Math.random() * players.length);
    } while (players[oddIndex].id === lastOddId && players.length > 1);

    return players[oddIndex].id;
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

    // Select random word pair
    const wordPair = this.getRandomWordPair();
    room.currentWord = wordPair;

    // Select random odd one out (prevent repeats)
    room.oddOneOutId = this.getRandomOddOneOut(roomCode, room.players);

    // Reset players (don't mark isOddOneOut - hide from players)
    room.players.forEach((player) => {
      player.votedFor = undefined;
    });

    // Start discussion phase with timer (3 minutes)
    room.phase = 'discussion';
    room.timerEndsAt = Date.now() + 180000; // 3 minutes
    room.messages = [];
    room.votesReadyCount = 0;

    return room;
  }

  moveToVotingPhase(roomCode: string): Room | undefined {
    const room = this.rooms.get(roomCode);
    if (!room || room.phase !== 'discussion') return undefined;

    // Increment vote count for current player
    room.votesReadyCount = (room.votesReadyCount || 0) + 1;
    
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

    // Select new word pair
    const wordPair = this.getRandomWordPair();
    room.currentWord = wordPair;

    // Select new random odd one out (prevent repeats)
    room.oddOneOutId = this.getRandomOddOneOut(roomCode, room.players);

    // Reset players (don't mark isOddOneOut)
    room.players.forEach((player) => {
      player.votedFor = undefined;
    });

    // Start discussion phase with 3 minutes
    room.phase = 'discussion';
    room.timerEndsAt = Date.now() + 180000; // 3 minutes
    room.messages = [];
    room.roundNumber++;
    room.votesReadyCount = 0;

    return room;
  }
}

export const storage = new MemStorage();
