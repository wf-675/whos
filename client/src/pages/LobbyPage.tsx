import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayerCard } from "@/components/PlayerCard";
import { Copy, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">غرفة الانتظار</h1>
          
          <Card className="max-w-md mx-auto">
            <CardHeader className="pb-3">
              <p className="text-sm text-muted-foreground">كود الغرفة</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-4">
                <span 
                  className="text-6xl tracking-widest font-mono font-bold"
                  data-testid="text-room-code"
                >
                  {room.code}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyCode}
                  data-testid="button-copy-code"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                شارك هذا الكود مع أصدقائك للانضمام
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">اللاعبون</h2>
            <Badge variant="secondary">
              {room.players.length} لاعب
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {room.players.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </div>

        {isHost && (
          <div className="text-center">
            {!canStart && (
              <p className="text-muted-foreground mb-4">
                يجب أن يكون هناك 3 لاعبين على الأقل لبدء اللعبة
              </p>
            )}
            <Button
              size="lg"
              onClick={handleStartGame}
              disabled={!canStart}
              className="min-w-[200px]"
              data-testid="button-start-game"
            >
              <Play className="w-5 h-5 ml-2" />
              ابدأ اللعبة
            </Button>
          </div>
        )}

        {!isHost && (
          <p className="text-center text-muted-foreground">
            في انتظار أن يبدأ المضيف اللعبة...
          </p>
        )}
      </div>
    </div>
  );
}
