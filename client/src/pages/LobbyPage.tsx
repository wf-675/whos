import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayerCard } from "@/components/PlayerCard";
import { Copy, Play, Home, X, Settings } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import type { Room } from "@shared/schema";
import type { WSMessage } from "@shared/schema";

interface LobbyPageProps {
  room: Room;
  playerId: string;
  onSendMessage: (message: WSMessage) => void;
}

export default function LobbyPage({ room, playerId, onSendMessage }: LobbyPageProps) {
  const { toast } = useToast();
  const currentPlayer = room.players.find(p => p.id === playerId);
  const isHost = currentPlayer?.isHost || false;
  const canStart = room.players.length >= 3;

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
    toast({
      title: "تم الطرد",
      description: "تم طرد اللاعب من الغرفة",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <div className="p-4">
        <div className="max-w-4xl mx-auto py-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">اجمع الشلة</h2>
            
            <Card className="max-w-md mx-auto hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <p className="text-sm text-muted-foreground">كود الغرفة</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-4">
                  <span 
                    className="text-6xl tracking-widest font-mono font-bold text-primary"
                    data-testid="text-room-code"
                  >
                    {room.code}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyCode}
                    className="transition-transform hover:scale-110 active:scale-95"
                    data-testid="button-copy-code"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  شارك الكود مع الشلة عشان ينضمون
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">اللاعبين الحاليين</h2>
              <Badge variant="default" className="text-lg px-4 py-1">
                {room.players.length} لاعب
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {room.players.map((player) => (
                <div key={player.id} className="relative">
                  <PlayerCard player={player} />
                  {isHost && !player.isHost && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-7 w-7 rounded-full"
                      onClick={() => handleKickPlayer(player.id)}
                      data-testid={`button-kick-player-${player.id}`}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isHost && (
            <div className="text-center">
              {!canStart && (
                <p className="text-muted-foreground mb-4 text-lg">
                  محتاج 3 لاعبين على الأقل عشان نبدأ
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
            <p className="text-center text-muted-foreground text-lg">
              استنى المضيف يبدأ اللعبة...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
