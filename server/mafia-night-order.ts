import type { Room } from "@shared/schema";

// Order of roles waking up at night
export const NIGHT_ROLE_ORDER: Array<{ role: string; name: string; action: string }> = [
  { role: 'mafia', name: 'المافيا', action: 'kill' },
  { role: 'mafia_boss', name: 'زعيم المافيا', action: 'kill' },
  { role: 'serial_killer', name: 'القاتل المستقل', action: 'kill' },
  { role: 'doctor', name: 'الطبيب', action: 'protect' },
  { role: 'bodyguard', name: 'الحارس', action: 'guard' },
  { role: 'detective', name: 'المحقق', action: 'investigate' },
  { role: 'spy', name: 'الجاسوس', action: 'watch' },
  { role: 'watcher', name: 'المراقب', action: 'watch' },
];

export function getNextNightRole(room: Room): { role: string; name: string; action: string } | null {
  const currentRole = (room as any).currentNightRole;
  const currentIndex = currentRole 
    ? NIGHT_ROLE_ORDER.findIndex(r => r.role === currentRole)
    : -1;

  // Find next role that exists in the room
  for (let i = currentIndex + 1; i < NIGHT_ROLE_ORDER.length; i++) {
    const roleInfo = NIGHT_ROLE_ORDER[i];
    const hasRole = room.players.some(p => {
      const playerRole = (p as any).role;
      const isAlive = (p as any).isAlive !== false;
      return playerRole === roleInfo.role && isAlive;
    });
    
    if (hasRole) {
      return roleInfo;
    }
  }

  return null; // All roles done
}

export function startNightPhase(room: Room): void {
  (room as any).currentNightRole = null;
  (room as any).nightActions = [];
  (room as any).nightRoleStartTime = Date.now();
}

export function moveToNextNightRole(room: Room): boolean {
  const nextRole = getNextNightRole(room);
  if (nextRole) {
    (room as any).currentNightRole = nextRole.role;
    (room as any).nightRoleStartTime = Date.now();
    return true; // Still has roles
  }
  return false; // All roles done
}

