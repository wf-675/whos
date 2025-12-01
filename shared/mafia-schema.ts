import { z } from "zod";

// Mafia game phases
export type MafiaGamePhase = 'lobby' | 'night' | 'day' | 'voting' | 'reveal' | 'game_over';

// Mafia roles
export type MafiaRole = 
  | 'mafia'           // مافيا
  | 'mafia_boss'      // زعيم مافيا
  | 'civilian'        // مدني
  | 'detective'       // محقق
  | 'doctor'          // طبيب
  | 'spy'             // جاسوس
  | 'watcher'         // مراقب
  | 'bodyguard'       // حارس
  | 'serial_killer'   // قاتل مستقل
  | 'jester';         // جستر

// Teams
export type MafiaTeam = 'mafia' | 'town' | 'independent';

// Role information
export const mafiaRoleInfo: Record<MafiaRole, { team: MafiaTeam; name: string; description: string }> = {
  mafia: { team: 'mafia', name: 'مافيا', description: 'فريق المافيا - يقتلون ليلاً' },
  mafia_boss: { team: 'mafia', name: 'زعيم مافيا', description: 'قائد المافيا - صوت مرجح' },
  civilian: { team: 'town', name: 'مدني', description: 'مدني بلا قدرات' },
  detective: { team: 'town', name: 'محقق', description: 'يفحص لاعباً كل ليلة' },
  doctor: { team: 'town', name: 'طبيب', description: 'يحمي لاعباً من القتل' },
  spy: { team: 'town', name: 'جاسوس', description: 'يعرف من زار لاعباً' },
  watcher: { team: 'town', name: 'مراقب', description: 'يراقب تحركات اللاعبين' },
  bodyguard: { team: 'town', name: 'حارس', description: 'يموت بدلاً عن المحمي' },
  serial_killer: { team: 'independent', name: 'قاتل مستقل', description: 'يقتل كل ليلة - فريق منفصل' },
  jester: { team: 'independent', name: 'جستر', description: 'يفوز إذا طُرد بالتصويت' },
};

// Mafia player schema
export const mafiaPlayerSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(20),
  isHost: z.boolean(),
  isConnected: z.boolean(),
  role: z.enum(['mafia', 'mafia_boss', 'civilian', 'detective', 'doctor', 'spy', 'watcher', 'bodyguard', 'serial_killer', 'jester']),
  team: z.enum(['mafia', 'town', 'independent']),
  isAlive: z.boolean().default(true),
  votedFor: z.string().optional(),
  nightAction: z.object({
    type: z.enum(['kill', 'protect', 'investigate', 'watch', 'guard']).optional(),
    targetId: z.string().optional(),
  }).optional(),
  investigationResult: z.string().optional(), // "mafia" | "not_mafia"
  watchResult: z.array(z.string()).optional(), // List of player IDs who visited
});

export type MafiaPlayer = z.infer<typeof mafiaPlayerSchema>;

// Night actions
export interface NightAction {
  playerId: string;
  actionType: 'kill' | 'protect' | 'investigate' | 'watch' | 'guard';
  targetId: string;
}

// Mafia room schema
export const mafiaRoomSchema = z.object({
  code: z.string().length(6),
  hostId: z.string(),
  phase: z.enum(['lobby', 'night', 'day', 'voting', 'reveal', 'game_over']),
  players: z.array(mafiaPlayerSchema),
  messages: z.array(z.object({
    id: z.string(),
    playerId: z.string(),
    playerName: z.string(),
    text: z.string().min(1).max(500),
    timestamp: z.number(),
  })),
  roundNumber: z.number(),
  nightActions: z.array(z.object({
    playerId: z.string(),
    actionType: z.enum(['kill', 'protect', 'investigate', 'watch', 'guard']),
    targetId: z.string(),
  })).default([]),
  deaths: z.array(z.string()).default([]), // Player IDs who died this round
  votes: z.record(z.string(), z.string()).optional(), // playerId -> targetPlayerId
  timerEndsAt: z.number().optional(),
  isPublic: z.boolean().default(false),
  roomName: z.string().optional(),
  maxPlayers: z.number().default(10).min(6).max(30),
  gameType: z.string().default("mafia"),
  pendingRequests: z.array(z.string()).default([]),
  pendingPlayerNames: z.record(z.string(), z.string()).default({}),
  winner: z.enum(['mafia', 'town', 'independent']).optional(),
});

export type MafiaRoom = z.infer<typeof mafiaRoomSchema>;

// Role distribution based on player count (simplified: civilian, mafia, doctor, detective only)
export function getRoleDistribution(playerCount: number): MafiaRole[] {
  const roles: MafiaRole[] = [];
  
  if (playerCount < 4) {
    // Minimum 4 players
    return [];
  }
  
  // Calculate mafia count based on player count
  let mafiaCount = 1;
  if (playerCount >= 6) mafiaCount = 2;
  if (playerCount >= 9) mafiaCount = 3;
  if (playerCount >= 12) mafiaCount = 4;
  if (playerCount >= 15) mafiaCount = 5;
  
  // Add mafia
  for (let i = 0; i < mafiaCount; i++) {
    roles.push('mafia');
  }
  
  // Always add doctor (1)
  roles.push('doctor');
  
  // Always add detective (1) - this is "الشايب"
  roles.push('detective');
  
  // Fill the rest with civilians
  const remaining = playerCount - roles.length;
  for (let i = 0; i < remaining; i++) {
    roles.push('civilian');
  }
  
  return roles;
}



