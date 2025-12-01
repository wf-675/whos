import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayerCard } from "@/components/PlayerCard";
import { Moon, Skull, Shield, Search, Clock } from "lucide-react";
import { soundManager } from "@/lib/sounds";
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
  const currentNightRole = (room as any).currentNightRole;
  const isMyTurn = currentNightRole === role || 
                   (currentNightRole === 'mafia' && (role === 'mafia' || role === 'mafia_boss'));
  
  // Get time left based on role (mafia gets 30 seconds, others 20)
  const roleTime = currentNightRole === 'mafia' ? 30 : 20;
  const [timeLeft, setTimeLeft] = useState(roleTime);
  
  // Update time when role changes
  useEffect(() => {
    if (isMyTurn && currentNightRole) {
      const newTime = currentNightRole === 'mafia' ? 30 : 20;
      setTimeLeft(newTime);
      setActionSubmitted(false);
      setSelectedTarget(null);
    }
  }, [currentNightRole, isMyTurn]);

  // Get alive players (excluding self)
  const alivePlayers = room.players.filter(p => {
    const playerAlive = (p as any)?.isAlive !== false;
    return playerAlive && p.id !== playerId;
  });

  useEffect(() => {
    if (timeLeft > 0 && !actionSubmitted && isMyTurn) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !actionSubmitted && isMyTurn) {
      // Auto-submit if time runs out
      handleSubmit();
    }
  }, [timeLeft, actionSubmitted, isMyTurn]);

  const handleSubmit = () => {
    if (!selectedTarget || actionSubmitted) return;

    const actionType = role === 'mafia' || role === 'mafia_boss' ? 'kill' : 
                       role === 'doctor' ? 'protect' : 
                       role === 'detective' ? 'investigate' : 'watch';

    // Play appropriate sound
    if (actionType === 'kill') {
      soundManager.playKill();
    } else if (actionType === 'protect') {
      soundManager.playProtect();
    } else if (actionType === 'investigate') {
      soundManager.playInvestigate();
    }

    onSendMessage({
      type: 'mafia_night_action',
      data: {
        actionType,
        targetId: selectedTarget
      }
    } as any);

    setActionSubmitted(true);
    onActionComplete();
  };

  if (!isAlive) {
    return (
      <Card className="mb-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-slate-300 flex items-center justify-center gap-2">
            <Moon className="w-6 h-6 text-blue-400" />
            الليل
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-slate-400">
            💀 أنت ميت، لا يمكنك التصرف
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show waiting message if not this role's turn
  if (!isMyTurn && (role !== 'civilian' && role)) {
    const currentRoleName = currentNightRole === 'mafia' ? 'المافيا' :
                           currentNightRole === 'mafia_boss' ? 'زعيم المافيا' :
                           currentNightRole === 'doctor' ? 'الطبيب' :
                           currentNightRole === 'detective' ? 'المحقق' :
                           currentNightRole === 'spy' ? 'الجاسوس' :
                           currentNightRole === 'watcher' ? 'المراقب' :
                           currentNightRole === 'bodyguard' ? 'الحارس' :
                           currentNightRole === 'serial_killer' ? 'القاتل المستقل' : '...';
    
    return (
      <Card className="mb-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-slate-300 flex items-center justify-center gap-2">
            <Moon className="w-6 h-6 text-blue-400 animate-pulse" />
            الليل
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-slate-400 text-lg">
            {currentNightRole ? `⏳ دور ${currentRoleName} الآن... انتظر دورك` : '🌙 تنام المدينة...'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (role === 'civilian' || !role) {
    return (
      <Card className="mb-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-slate-300 flex items-center justify-center gap-2">
            <Moon className="w-6 h-6 text-blue-400 animate-pulse" />
            الليل
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-slate-400 text-lg">
            🌙 تنام المدينة... انتظر حتى يستيقظ الآخرون
          </p>
        </CardContent>
      </Card>
    );
  }

  const roleName = role === 'mafia' || role === 'mafia_boss' ? 'مافيا' :
                   role === 'doctor' ? 'طبيب' :
                   role === 'detective' ? 'شايب' : '';

  const actionName = role === 'mafia' || role === 'mafia_boss' ? 'قتل' :
                     role === 'doctor' ? 'حماية' :
                     role === 'detective' ? 'فحص' : '';
  
  const actionMessage = role === 'mafia' || role === 'mafia_boss' ? 'حدد اللاعب الذي تريد قتله' :
                        role === 'doctor' ? 'اختر لاعباً لحمايته (يمكنك حماية نفسك)' :
                        role === 'detective' ? 'اختر لاعباً لتعرف دوره' : '';

  const roleIcon = role === 'mafia' || role === 'mafia_boss' ? <Skull className="w-6 h-6" /> :
                   role === 'doctor' ? <Shield className="w-6 h-6" /> :
                   role === 'detective' ? <Search className="w-6 h-6" /> : null;

  const roleColor = role === 'mafia' || role === 'mafia_boss' ? 'text-red-400' :
                    role === 'doctor' ? 'text-green-400' :
                    role === 'detective' ? 'text-blue-400' : 'text-slate-300';

  return (
    <Card className="mb-6 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50 backdrop-blur-sm shadow-2xl">
      <CardHeader className="border-b border-slate-700/50">
        <CardTitle className="text-center text-slate-200 flex items-center justify-center gap-3">
          <Moon className="w-7 h-7 text-blue-400 animate-pulse" />
          <span>الليل - {roleName}</span>
          <span className={roleColor}>{roleIcon}</span>
        </CardTitle>
        <div className="text-center mt-4">
          <Badge variant="destructive" className="text-lg px-4 py-2 bg-red-900/50 border-red-700 text-red-200 flex items-center gap-2 mx-auto w-fit">
            <Clock className="w-4 h-4" />
            {timeLeft} ثانية
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-center text-slate-300 mb-6 text-lg">
          {actionMessage || `اختر لاعباً لـ${actionName}`}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
          {alivePlayers.map((player) => (
            <div
              key={player.id}
              onClick={() => !actionSubmitted && setSelectedTarget(player.id)}
              className={`cursor-pointer transition-all transform ${
                selectedTarget === player.id
                  ? 'ring-2 ring-blue-400 scale-105 shadow-lg shadow-blue-500/50'
                  : 'hover:scale-102 hover:shadow-md hover:shadow-blue-500/20'
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
            className={`min-w-[180px] ${
              role === 'mafia' || role === 'mafia_boss'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : role === 'doctor'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } shadow-lg`}
          >
            {actionSubmitted ? (
              <>
                ✓ تم الإرسال
              </>
            ) : (
              <>
                {role === 'mafia' || role === 'mafia_boss' ? <Skull className="w-4 h-4 ml-2" /> :
                 role === 'doctor' ? <Shield className="w-4 h-4 ml-2" /> :
                 <Search className="w-4 h-4 ml-2" />}
                تأكيد {actionName}
              </>
            )}
          </Button>
        </div>

        {actionSubmitted && (
          <p className="text-center text-green-400 mt-4 font-semibold text-lg animate-pulse">
            ✓ تم إرسال إجراءك بنجاح
          </p>
        )}
      </CardContent>
    </Card>
  );
}
