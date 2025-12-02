import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayerCard } from "@/components/PlayerCard";
import { Timer } from "@/components/Timer";
import { ChatBox } from "@/components/ChatBox";
import { NightPhase } from "@/components/NightPhase";
import { MafiaChat } from "@/components/MafiaChat";
import { DayPhase } from "@/components/DayPhase";
import { VotingPhase } from "@/components/VotingPhase";
import { Home, Moon, Sun, Users, MessageSquare } from "lucide-react";
import { Header } from "@/components/Header";
import { soundManager } from "@/lib/sounds";
import type { Room } from "@shared/schema";
import type { WSMessage } from "@shared/schema";

interface MafiaGamePageProps {
  room: Room;
  playerId: string;
  onSendMessage: (message: WSMessage) => void;
}

export default function MafiaGamePage({ room, playerId, onSendMessage }: MafiaGamePageProps) {
  const currentPlayer = room.players.find(p => p.id === playerId);
  const isAlive = currentPlayer && !(currentPlayer as any).isAlive === false;
  const role = (currentPlayer as any)?.role;
  const isMafia = role === 'mafia' || role === 'mafia_boss';
  const playerName = currentPlayer?.name || '';
  const [previousPhase, setPreviousPhase] = useState(room.phase);
  
  // Get mafia chat messages (only for mafia players)
  const mafiaChatMessages = (room as any).mafiaChat || [];

  // Play sounds on phase change
  useEffect(() => {
    if (previousPhase !== room.phase) {
      if (room.phase === 'night') {
        soundManager.playNight();
      } else if (room.phase === 'day') {
        soundManager.playDay();
      }
      setPreviousPhase(room.phase);
    }
  }, [room.phase, previousPhase]);

  const handleLeave = () => {
    onSendMessage({ type: 'leave_room' });
    localStorage.removeItem('playerId');
    localStorage.removeItem('roomCode');
    setTimeout(() => {
      window.location.href = '/mafia';
    }, 500);
  };

  const isNight = room.phase === 'night';
  const isDay = room.phase === 'day';

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isNight 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : isDay
        ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50'
        : 'bg-background'
    }`}>
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Phase Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {isNight ? (
                <Moon className="w-8 h-8 text-blue-400 animate-pulse" />
              ) : isDay ? (
                <Sun className="w-8 h-8 text-amber-500 animate-pulse" />
              ) : (
                <Users className="w-8 h-8 text-primary" />
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">
                  {isNight ? '🌙 الليل' : isDay ? '☀️ النهار' : 'المافيا'}
                </h1>
                <Badge variant="outline" className="text-sm">
                  الجولة {room.roundNumber}
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLeave}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              خروج
            </Button>
          </div>

          {room.timerEndsAt && (
            <div className="mb-4">
              <Timer endsAt={room.timerEndsAt} />
            </div>
          )}
        </div>

        {/* Night Phase */}
        {room.phase === 'night' && (
          <div className="space-y-6">
            {/* Show player's role clearly */}
            {role && (
              <Card className="mb-4 bg-slate-800/70 border-slate-600 shadow-lg">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <p className="text-slate-200 text-xl font-bold mb-2">
                      {role === 'mafia' || role === 'mafia_boss' ? '🔴 أنت مافيا' :
                       role === 'doctor' ? '🛡️ أنت طبيب' :
                       role === 'detective' ? '🔍 أنت شايب (محقق)' :
                       '👤 أنت مواطن'}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {role === 'mafia' || role === 'mafia_boss' ? 'دورك: قتل لاعب كل ليلة' :
                       role === 'doctor' ? 'دورك: حماية لاعب من القتل' :
                       role === 'detective' ? 'دورك: فحص لاعب لمعرفة دوره' :
                       'دورك: لا تملك قدرات خاصة - استخدم المنطق والتحليل'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <NightPhase
              room={room}
              playerId={playerId}
              onSendMessage={onSendMessage}
              onActionComplete={() => {}}
            />

            {isMafia && isAlive && (
              <div className="mb-6">
                <MafiaChat
                  messages={mafiaChatMessages}
                  playerId={playerId}
                  playerName={playerName}
                  onSendMessage={(text) => {
                    if (isAlive) {
                      soundManager.playClick();
                      onSendMessage({
                        type: 'mafia_chat',
                        data: { text }
                      } as any);
                    }
                  }}
                />
              </div>
            )}

            {currentPlayer?.isHost && (
              <div className="mb-6 text-center">
                <Button
                  onClick={() => {
                    soundManager.playClick();
                    onSendMessage({ type: 'next_night_role' } as any);
                  }}
                  size="lg"
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                >
                  <Moon className="w-5 h-5 ml-2" />
                  الدور التالي
                </Button>
              </div>
            )}

            {role === 'detective' && (currentPlayer as any)?.investigationResult && (
              <Card className="mb-6 bg-blue-950/50 border-blue-500/30 shadow-xl backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-center text-blue-300 flex items-center justify-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    نتيجة الفحص (الشايب)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center font-semibold text-lg text-blue-200">
                    {(currentPlayer as any).investigationResult}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Day Phase */}
        {room.phase === 'day' && (
          <DayPhase
            room={room}
            playerId={playerId}
            onSendMessage={onSendMessage}
          />
        )}

        {/* Voting Phase */}
        {room.phase === 'voting' && (
          <VotingPhase
            room={room}
            playerId={playerId}
            onSendMessage={onSendMessage}
          />
        )}

        {/* Players Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              اللاعبين
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {room.players.map((player) => {
                const isDead = (player as any).isAlive === false;
                return (
                  <div 
                    key={player.id} 
                    className={`transition-all ${
                      isDead 
                        ? "opacity-50 grayscale" 
                        : isNight 
                        ? "hover:shadow-lg hover:shadow-blue-500/20" 
                        : "hover:shadow-lg hover:shadow-amber-500/20"
                    }`}
                  >
                    <PlayerCard player={player} />
                    {isDead && (
                      <Badge variant="destructive" className="mt-2 w-full text-center">
                        💀 ميت
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat */}
          <div>
            <ChatBox 
              messages={room.messages || []}
              onSendMessage={(text) => {
                if (isAlive) {
                  soundManager.playClick();
                  onSendMessage({
                    type: 'send_message',
                    data: { text }
                  });
                }
              }}
              currentPlayerId={playerId}
              disabled={!isAlive}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
