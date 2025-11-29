import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayerCard } from "@/components/PlayerCard";
import { Timer } from "@/components/Timer";
import { ChatBox } from "@/components/ChatBox";
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
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center">🌙 الليل</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                {isAlive ? "استخدم قدرتك الليلية..." : "أنت ميت، لا يمكنك التصرف"}
              </p>
            </CardContent>
          </Card>
        )}

        {room.phase === 'day' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center">☀️ النهار</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                ناقش وابحث عن المافيا...
              </p>
            </CardContent>
          </Card>
        )}

        {room.phase === 'voting' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center">🗳️ التصويت</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                صوّت على من تريد طرده...
              </p>
            </CardContent>
          </Card>
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
              onSendMessage={(text) => onSendMessage({
                type: 'send_message',
                data: { text }
              })}
              playerId={playerId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

