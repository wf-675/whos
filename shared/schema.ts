import { z } from "zod";

// Game phases
export type GamePhase = 'lobby' | 'discussion' | 'voting' | 'reveal';

// Player schema
export const playerSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(20),
  isHost: z.boolean(),
  isConnected: z.boolean(),
  votedFor: z.string().optional(),
  isOddOneOut: z.boolean().optional(),
  points: z.number().default(0),
});

export type Player = z.infer<typeof playerSchema>;

export const insertPlayerSchema = playerSchema.pick({
  name: true,
});

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

// Chat message schema
export const messageSchema = z.object({
  id: z.string(),
  playerId: z.string(),
  playerName: z.string(),
  text: z.string().min(1).max(500),
  timestamp: z.number(),
});

export type Message = z.infer<typeof messageSchema>;

export const insertMessageSchema = messageSchema.pick({
  text: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;

// Word pack schema
export interface WordPair {
  normal: string;
  odd: string;
}

export interface WordPack {
  name: string;
  pairs: WordPair[];
}

// Room schema
export const roomSchema = z.object({
  code: z.string().length(6),
  hostId: z.string(),
  phase: z.enum(['lobby', 'discussion', 'voting', 'reveal', 'night', 'day', 'game_over']),
  players: z.array(playerSchema),
  messages: z.array(messageSchema),
  currentWord: z.object({
    normal: z.string(),
    odd: z.string(),
  }).optional(),
  oddOneOutId: z.string().optional(),
  timerEndsAt: z.number().optional(),
  roundNumber: z.number(),
  votes: z.record(z.string(), z.string()).optional(),
  votesReadyCount: z.number().default(0),
  votesReadyPlayers: z.array(z.string()).default([]),
  usedWords: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false),
  roomName: z.string().optional(),
  maxPlayers: z.number().default(10).min(3).max(20),
  gameType: z.string().default("whos-out"),
  pendingRequests: z.array(z.string()).default([]), // Player IDs requesting to join
  pendingPlayerNames: z.record(z.string(), z.string()).default({}), // Player ID -> Player Name for pending requests
  settings: z.object({
    allowOddOneOutReveal: z.boolean().default(false),
    enableTimer: z.boolean().default(false),
    discussionTimeMinutes: z.number().default(3).min(1).max(10),
    category: z.string().optional(),
    excludedCategories: z.array(z.string()).default([]),
  }).optional(),
});

export type Room = z.infer<typeof roomSchema>;

// WebSocket event schemas
export const joinRoomSchema = z.object({
  roomCode: z.string().length(6),
  playerName: z.string().min(1).max(20),
});

export const createRoomSchema = z.object({
  playerName: z.string().min(1).max(20),
  isPublic: z.boolean().optional(),
  roomName: z.string().max(30).optional(),
  maxPlayers: z.number().min(3).max(20).optional(),
  gameType: z.string().default("whos-out"),
});

export const sendMessageSchema = z.object({
  text: z.string().min(1).max(500),
});

export const voteSchema = z.object({
  targetPlayerId: z.string(),
});

export const kickPlayerSchema = z.object({
  targetPlayerId: z.string(),
});

export const reconnectSchema = z.object({
  roomCode: z.string().length(6),
  playerId: z.string(),
});

// WebSocket message types
export const updateSettingsSchema = z.object({
  allowOddOneOutReveal: z.boolean().optional(),
  enableTimer: z.boolean().optional(),
  discussionTimeMinutes: z.number().min(1).max(10).optional(),
  category: z.string().optional(),
  excludedCategories: z.array(z.string()).optional(),
});

export type WSMessage =
  | { type: 'create_room'; data: z.infer<typeof createRoomSchema> }
  | { type: 'join_room'; data: z.infer<typeof joinRoomSchema> }
  | { type: 'request_join_room'; data: z.infer<typeof joinRoomSchema> }
  | { type: 'approve_join_request'; data: { targetPlayerId: string; playerName: string } }
  | { type: 'reject_join_request'; data: { targetPlayerId: string } }
  | { type: 'get_public_rooms' }
  | { type: 'reconnect'; data: z.infer<typeof reconnectSchema> }
  | { type: 'start_game' }
  | { type: 'send_message'; data: z.infer<typeof sendMessageSchema> }
  | { type: 'start_voting' }
  | { type: 'vote'; data: z.infer<typeof voteSchema> }
  | { type: 'next_round' }
  | { type: 'kick_player'; data: z.infer<typeof kickPlayerSchema> }
  | { type: 'leave_room' }
  | { type: 'end_game' }
  | { type: 'return_to_lobby' }
  | { type: 'update_settings'; data: z.infer<typeof updateSettingsSchema> }
  | { type: 'mafia_night_action'; data: { actionType: string; targetId: string } }
  | { type: 'mafia_chat'; data: { text: string } }
  | { type: 'end_night' };

export type WSResponse =
  | { type: 'room_created'; roomCode: string; playerId: string }
  | { type: 'room_joined'; playerId: string; roomCode?: string }
  | { type: 'room_state'; room: Room; playerId: string; playerWord: string | null }
  | { type: 'public_rooms'; rooms: Room[] }
  | { type: 'join_request_sent' }
  | { type: 'error'; message: string };
