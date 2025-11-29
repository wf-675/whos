import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayerCard } from "@/components/PlayerCard";
import { Timer } from "@/components/Timer";
import type { Room, Player, WSMessage } from "@shared/schema";

interface NightPhaseProps {
  room: Room;
  playerId: string;
  onSendMessage: (message: WSMessage) => void;
  onActionComplete: () => void;
}

export function NightPhase({ room, playerId, onSendMessage, onActionComplete }: NightPhaseProps) {
  const currentPlayer = room.players.find(p => p.id === playerId);
  const role = (currentPlayer as any)?.role;
  const isAlive = (currentPlayer as any)?.isAlive !== false;
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [actionSubmitted, setActionSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);

  // Get alive players (excluding self)
  const alivePlayers = room.players.filter(p => {
    const playerAlive = (p as any)?.isAlive !== false;
    return playerAlive && p.id !== playerId;
  });

  useEffect(() => {
    if (timeLeft > 0 && !actionSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !actionSubmitted) {
      // Auto-submit if time runs out
      handleSubmit();
    }
  }, [timeLeft, actionSubmitted]);

  const handleSubmit = () => {
    if (!selectedTarget || actionSubmitted) return;

    onSendMessage({
      type: 'mafia_night_action',
      data: {
        actionType: role === 'mafia' || role === 'mafia_boss' ? 'kill' : 
                   role === 'doctor' ? 'protect' : 
                   role === 'detective' ? 'investigate' : 'watch',
        targetId: selectedTarget
      }
    } as any);

    setActionSubmitted(true);
    onActionComplete();
  };

  if (!isAlive) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-center">🌙 الليل</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            أنت ميت، لا يمكنك التصرف
          </p>
        </CardContent>
      </Card>
    );
  }

  if (role === 'civilian' || !role) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-center">🌙 الليل</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            تنام المدينة... انتظر حتى يستيقظ الآخرون
          </p>
        </CardContent>
      </Card>
    );
  }

  const roleName = role === 'mafia' || role === 'mafia_boss' ? 'مافيا' :
                   role === 'doctor' ? 'طبيب' :
                   role === 'detective' ? 'محقق' :
                   role === 'spy' ? 'جاسوس' :
                   role === 'watcher' ? 'مراقب' :
                   role === 'bodyguard' ? 'حارس' :
                   role === 'serial_killer' ? 'قاتل مستقل' : '';

  const actionName = role === 'mafia' || role === 'mafia_boss' ? 'قتل' :
                     role === 'doctor' ? 'حماية' :
                     role === 'detective' ? 'فحص' :
                     role === 'spy' ? 'مراقبة' :
                     role === 'watcher' ? 'مراقبة' :
                     role === 'bodyguard' ? 'حماية' :
                     role === 'serial_killer' ? 'قتل' : '';

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-center">🌙 الليل - {roleName}</CardTitle>
        <div className="text-center mt-2">
          <Badge variant="destructive" className="text-lg px-4 py-1">
            {timeLeft} ثانية
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground mb-6">
          اختر لاعباً لـ{actionName}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {alivePlayers.map((player) => (
            <div
              key={player.id}
              onClick={() => !actionSubmitted && setSelectedTarget(player.id)}
              className={`cursor-pointer transition-all ${
                selectedTarget === player.id
                  ? 'ring-2 ring-primary scale-105'
                  : 'hover:opacity-80'
              } ${actionSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <PlayerCard player={player} />
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <Button
            onClick={handleSubmit}
            disabled={!selectedTarget || actionSubmitted}
            size="lg"
            className="min-w-[150px]"
          >
            {actionSubmitted ? 'تم الإرسال' : `تأكيد ${actionName}`}
          </Button>
        </div>

        {actionSubmitted && (
          <p className="text-center text-green-500 mt-4 font-semibold">
            ✓ تم إرسال إجراءك
          </p>
        )}
      </CardContent>
    </Card>
  );
}

