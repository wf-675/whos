import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Users, Lock, Globe, RefreshCw } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import type { Room } from "@shared/schema";
import type { WSMessage, WSResponse } from "@shared/schema";

export default function RoomsPage() {
  const { sendMessage, room, playerId } = useWebSocket();
  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Request public rooms on mount
    requestPublicRooms();
    
    // Set up interval to refresh rooms every 5 seconds
    const interval = setInterval(() => {
      requestPublicRooms();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const requestPublicRooms = () => {
    setLoading(true);
    sendMessage({ type: 'get_public_rooms' });
  };

  // Listen for public rooms response via useWebSocket hook
  useEffect(() => {
    // We'll use a custom event listener approach
    const handleMessage = (event: CustomEvent) => {
      const response: WSResponse = event.detail;
      if (response.type === 'public_rooms') {
        setPublicRooms(response.rooms);
        setLoading(false);
      }
    };

    window.addEventListener('ws-message' as any, handleMessage as EventListener);
    return () => {
      window.removeEventListener('ws-message' as any, handleMessage as EventListener);
    };
  }, []);

  const handleJoinRoom = (roomCode: string) => {
    const playerName = localStorage.getItem('playerName') || "";
    if (!playerName) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسمك من الملف الشخصي",
        variant: "destructive",
      });
      return;
    }

    const targetRoom = publicRooms.find(r => r.code === roomCode);
    if (targetRoom && targetRoom.isPublic) {
      // Public room - join directly
      sendMessage({
        type: 'join_room',
        data: {
          roomCode,
          playerName,
        }
      });
    } else {
      // Private room - request to join
      sendMessage({
        type: 'request_join_room',
        data: {
          roomCode,
          playerName,
        }
      });

      toast({
        title: "تم إرسال الطلب",
        description: "في انتظار موافقة المضيف...",
      });
    }
  };

  const filteredRooms = publicRooms.filter(room => {
    // Only show rooms in lobby phase (hide rooms in game)
    if (room.phase !== 'lobby') return false;
    
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      room.code.toLowerCase().includes(query) ||
      room.roomName?.toLowerCase().includes(query) ||
      room.players[0]?.name.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">اللوبيات العامة</h1>
          <p className="text-muted-foreground">تصفح وانضم للوبيات العامة المتاحة</p>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="ابحث عن لوبي بالاسم أو الكود..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          <Button onClick={requestPublicRooms} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>

        {loading && publicRooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">جاري تحميل اللوبيات...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">لا توجد لوبيات عامة متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map((room) => (
              <Card key={room.code} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">
                        {room.roomName || `لوبي ${room.code}`}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        {room.isPublic ? (
                          <Badge variant="secondary" className="gap-1">
                            <Globe className="w-3 h-3" />
                            عام
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <Lock className="w-3 h-3" />
                            خاص
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">الكود:</span>
                      <span className="font-mono font-bold text-lg">{room.code}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">المضيف:</span>
                      <span className="font-semibold">{room.players[0]?.name || "غير معروف"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">اللاعبين:</span>
                      <Badge variant="default">
                        <Users className="w-3 h-3 ml-1" />
                        {room.players.length}
                      </Badge>
                    </div>
                    <Button
                      onClick={() => handleJoinRoom(room.code)}
                      className="w-full"
                      disabled={room.players.length >= room.maxPlayers || (room && playerId && room.players.some(p => p.id === playerId))}
                    >
                      {room && playerId && room.players.some(p => p.id === playerId) ? "أنت في هذا اللوبي" : room.isPublic ? "انضم" : "طلب انضمام"}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-1">
                      {room.players.length} / {room.maxPlayers} لاعب
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

