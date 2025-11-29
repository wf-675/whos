import { getRoleDistribution, type MafiaRole, type MafiaTeam } from "@shared/mafia-schema";
import type { Room, Player } from "@shared/schema";

// Assign roles to players
export function assignMafiaRoles(room: Room): void {
  const playerCount = room.players.length;
  if (playerCount < 6) return;

  const roles = getRoleDistribution(playerCount);
  const shuffledRoles = [...roles].sort(() => Math.random() - 0.5);
  const shuffledPlayers = [...room.players].sort(() => Math.random() - 0.5);

  shuffledPlayers.forEach((player, index) => {
    if (index < shuffledRoles.length) {
      const role = shuffledRoles[index];
      (player as any).role = role;
      (player as any).team = getTeamForRole(role);
      (player as any).isAlive = true;
      (player as any).nightAction = undefined;
      (player as any).investigationResult = undefined;
      (player as any).watchResult = undefined;
    }
  });
}

function getTeamForRole(role: MafiaRole): MafiaTeam {
  if (role === 'mafia' || role === 'mafia_boss') return 'mafia';
  if (role === 'serial_killer' || role === 'jester') return 'independent';
  return 'town';
}

// Check win conditions
export function checkMafiaWinConditions(room: Room): 'mafia' | 'town' | 'independent' | null {
  const alivePlayers = room.players.filter(p => (p as any).isAlive !== false);
  const aliveMafia = alivePlayers.filter(p => {
    const role = (p as any).role;
    return role === 'mafia' || role === 'mafia_boss';
  });
  const aliveTown = alivePlayers.filter(p => {
    const role = (p as any).role;
    const team = (p as any).team;
    return team === 'town';
  });
  const aliveIndependent = alivePlayers.filter(p => {
    const team = (p as any).team;
    return team === 'independent';
  });

  // Mafia wins if mafia count >= town count
  if (aliveMafia.length >= aliveTown.length && aliveMafia.length > 0) {
    return 'mafia';
  }

  // Town wins if all mafia are dead
  if (aliveMafia.length === 0 && aliveTown.length > 0) {
    return 'town';
  }

  // Serial killer wins if only they remain
  const serialKiller = alivePlayers.find(p => (p as any).role === 'serial_killer');
  if (serialKiller && alivePlayers.length === 1) {
    return 'independent';
  }

  return null;
}

// Get alive players count by team
export function getAliveCountByTeam(room: Room): { mafia: number; town: number; independent: number } {
  const alivePlayers = room.players.filter(p => (p as any).isAlive !== false);
  
  return {
    mafia: alivePlayers.filter(p => {
      const role = (p as any).role;
      return role === 'mafia' || role === 'mafia_boss';
    }).length,
    town: alivePlayers.filter(p => (p as any).team === 'town').length,
    independent: alivePlayers.filter(p => (p as any).team === 'independent').length,
  };
}

