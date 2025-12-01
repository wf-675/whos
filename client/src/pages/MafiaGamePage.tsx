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
import { Home } from "lucide-react";
import { Header } from "@/components/Header";
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
  
  // Get mafia chat messages (only for mafia players)
  const mafiaChatMessages = (room as any).mafiaChat || [];

  const handleLeave = () => {
    onSendMessage({ type: 'leave_room' });
    localStorage.removeItem('playerId');
    localStorage.removeItem('roomCode');
    setTimeout(() => {
      window.location.href = '/mafia';
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">المافيا</h1>
              <Badge variant="outline" className="text-sm">
                الجولة {room.roundNumber}
              </Badge>
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

        {room.phase === 'night' && (
          <>
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
                  onClick={() => onSendMessage({ type: 'next_night_role' } as any)}
                  size="lg"
                  variant="default"
                >
                  الدور التالي
                </Button>
              </div>
            )}

            {role === 'detective' && (currentPlayer as any)?.investigationResult && (
              <Card className="mb-6 bg-primary/10 border-primary">
                <CardHeader>
                  <CardTitle className="text-center">نتيجة الفحص (الشايب)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center font-semibold text-lg">
                    {(currentPlayer as any).investigationResult}
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {room.phase === 'day' && (
          <>
            <DayPhase
              room={room}
              playerId={playerId}
              onSendMessage={onSendMessage}
            />
            
            {currentPlayer?.isHost && (
              <div className="mb-6 text-center">
                <Button
                  onClick={() => onSendMessage({ type: 'end_day' } as any)}
                  size="lg"
                  variant="default"
                >
                  طرد وإكمال
                </Button>
              </div>
            )}
          </>
        )}

        {room.phase === 'voting' && (
          <VotingPhase
            room={room}
            playerId={playerId}
            onSendMessage={onSendMessage}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">اللاعبين</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {room.players.map((player) => {
                const isDead = (player as any).isAlive === false;
                return (
                  <div key={player.id} className={isDead ? "opacity-50" : ""}>
                    <PlayerCard player={player} />
                    {isDead && (
                      <Badge variant="destructive" className="mt-2 w-full text-center">
                        ميت
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <ChatBox 
              messages={room.messages || []}
              onSendMessage={(text) => {
                if (isAlive) {
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

