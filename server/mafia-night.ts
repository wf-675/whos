import type { Room, Player } from "@shared/schema";
import { checkMafiaWinConditions } from "./mafia-logic";

export interface NightAction {
  playerId: string;
  actionType: 'kill' | 'protect' | 'investigate' | 'watch' | 'guard';
  targetId: string;
}

export function processNightActions(room: Room): { deaths: string[]; nightResult: string } {
  const nightActions: NightAction[] = (room as any).nightActions || [];
  const deaths: string[] = [];
  let nightResult = "";

  // Group actions by type
  const kills: string[] = [];
  const protections: string[] = [];
  const investigations: Array<{ playerId: string; targetId: string }> = [];
  const watches: Array<{ playerId: string; targetId: string }> = [];

  nightActions.forEach(action => {
    if (action.actionType === 'kill') {
      kills.push(action.targetId);
    } else if (action.actionType === 'protect' || action.actionType === 'guard') {
      protections.push(action.targetId);
    } else if (action.actionType === 'investigate') {
      investigations.push({ playerId: action.playerId, targetId: action.targetId });
    } else if (action.actionType === 'watch') {
      watches.push({ playerId: action.playerId, targetId: action.targetId });
    }
  });

  // Process kills (check protections)
  kills.forEach(targetId => {
    if (!protections.includes(targetId)) {
      // Not protected, dies
      const target = room.players.find(p => p.id === targetId);
      if (target && (target as any).isAlive !== false) {
        (target as any).isAlive = false;
        deaths.push(targetId);
      }
    }
  });

  // Process bodyguard (dies instead of protected target)
  const bodyguardActions = nightActions.filter(a => a.actionType === 'guard');
  bodyguardActions.forEach(action => {
    if (kills.includes(action.targetId) && protections.includes(action.targetId)) {
      // Bodyguard dies instead
      const bodyguard = room.players.find(p => p.id === action.playerId);
      if (bodyguard && (bodyguard as any).isAlive !== false) {
        (bodyguard as any).isAlive = false;
        deaths.push(action.playerId);
      }
    }
  });

  // Generate night result message
  if (deaths.length > 0) {
    const deathNames = deaths.map(id => {
      const player = room.players.find(p => p.id === id);
      return player?.name || 'لاعب';
    });
    nightResult = `تم قتل: ${deathNames.join(', ')}`;
  } else if (kills.length > 0 && protections.length > 0) {
    // Someone was protected
    const protectedTargets = kills.filter(id => protections.includes(id));
    if (protectedTargets.length > 0) {
      const protectedNames = protectedTargets.map(id => {
        const player = room.players.find(p => p.id === id);
        return player?.name || 'لاعب';
      });
      nightResult = `المافيا حاولت قتل ${protectedNames.join(', ')} لكنهم كانوا محميين!`;
    } else {
      nightResult = "الليلة كانت هادئة، لم يمت أحد.";
    }
  } else {
    nightResult = "الليلة كانت هادئة، لم يمت أحد.";
  }

  // Process investigations (store results for detective)
  investigations.forEach(inv => {
    const target = room.players.find(p => p.id === inv.targetId);
    if (target) {
      const targetRole = (target as any).role;
      const targetName = target.name;
      const detective = room.players.find(p => p.id === inv.playerId);
      if (detective) {
        // Set investigation result
        if (targetRole === 'mafia' || targetRole === 'mafia_boss') {
          (detective as any).investigationResult = `${targetName} هو مافيا`;
        } else {
          (detective as any).investigationResult = `${targetName} ليس مافيا`;
        }
      }
    }
  });

  // Process watches (store who visited target)
  watches.forEach(watch => {
    const target = room.players.find(p => p.id === watch.targetId);
    const watcher = room.players.find(p => p.id === watch.playerId);
    if (target && watcher) {
      // Find who visited this target (who targeted them)
      const visitors = nightActions
        .filter(a => a.targetId === watch.targetId && a.playerId !== watch.playerId)
        .map(a => {
          const visitor = room.players.find(p => p.id === a.playerId);
          return visitor?.name || 'لاعب';
        });
      (watcher as any).watchResult = visitors;
    }
  });

  return { deaths, nightResult };
}

export function checkGameOver(room: Room): 'mafia' | 'town' | 'independent' | null {
  return checkMafiaWinConditions(room);
}

