import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayerCard } from "@/components/PlayerCard";
import { Copy, Play, Home, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import type { Room } from "@shared/schema";
import type { WSMessage } from "@shared/schema";

interface MafiaLobbyPageProps {
  room: Room;
  playerId: string;
  onSendMessage: (message: WSMessage) => void;
}

export default function MafiaLobbyPage({ room, playerId, onSendMessage }: MafiaLobbyPageProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const currentPlayer = room.players.find(p => p.id === playerId);
  const isHost = currentPlayer?.isHost || false;
  const canStart = room.players.length >= 6 && room.players.length <= (room.maxPlayers || 30);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.code);
      toast({
        title: "تم النسخ!",
        description: "تم نسخ كود الغرفة للحافظة",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل نسخ الكود",
        variant: "destructive",
      });
    }
  };

  const handleStartGame = () => {
    onSendMessage({ type: 'start_game' });
  };

  const handleKickPlayer = (targetPlayerId: string) => {
    onSendMessage({ 
      type: 'kick_player', 
      data: { targetPlayerId } 
    });
  };

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
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="text-center sm:text-right">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">المافيا</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {room.roomName || `لوبي ${room.code}`}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLeave}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Home className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">خروج</span>
            </Button>
          </div>
          
          <Card className="max-w-md mx-auto hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <p className="text-sm text-muted-foreground">كود الغرفة</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-2 sm:gap-4">
                <span 
                  className="text-4xl sm:text-5xl md:text-6xl tracking-widest font-mono font-bold text-primary"
                  data-testid="text-room-code"
                >
                  {room.code}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyCode}
                  className="transition-transform hover:scale-110 active:scale-95 h-8 w-8 sm:h-10 sm:w-10"
                  data-testid="button-copy-code"
                >
                  <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                شارك الكود مع الشلة عشان ينضمون
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">اللاعبين الحاليين</h2>
            <Badge variant="default" className="text-sm sm:text-lg px-3 sm:px-4 py-1">
              {room.players.length} / {room.maxPlayers || 30} لاعب
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {room.players.map((player) => (
              <div key={player.id} className="relative">
                <PlayerCard player={player} />
                {isHost && !player.isHost && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -left-2 w-6 h-6 rounded-full"
                    onClick={() => handleKickPlayer(player.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {isHost && room.pendingRequests && room.pendingRequests.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">طلبات الانضمام</h3>
            <div className="space-y-2">
              {room.pendingRequests.map((requestPlayerId) => {
                const playerName = room.pendingPlayerNames?.[requestPlayerId] || 'لاعب جديد';
                return (
                  <Card key={requestPlayerId} className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">طلب انضمام من {playerName}</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            onSendMessage({
                              type: 'approve_join_request',
                              data: {
                                targetPlayerId: requestPlayerId,
                                playerName: playerName
                              }
                            });
                          }}
                        >
                          قبول
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            onSendMessage({
                              type: 'reject_join_request',
                              data: {
                                targetPlayerId: requestPlayerId
                              }
                            });
                          }}
                        >
                          رفض
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {isHost && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-3">
            </div>
              {!canStart && (
              <p className="text-muted-foreground mb-4 text-lg">
                {room.players.length < 6 
                  ? "محتاج 6 لاعبين على الأقل عشان نبدأ"
                  : `الغرفة ممتلئة (${room.maxPlayers || 30} لاعب كحد أقصى)`
                }
              </p>
            )}
            <Button
              size="lg"
              onClick={handleStartGame}
              disabled={!canStart}
              className="min-w-[200px] transition-transform hover:scale-105 active:scale-95"
              data-testid="button-start-game"
            >
              <Play className="w-5 h-5 ml-2" />
              ابدأ اللعبة
            </Button>
          </div>
        )}

        {!isHost && (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              في انتظار المضيف لبدء اللعبة...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}



