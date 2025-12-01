import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChatBox } from "@/components/ChatBox";
import { Sun, Vote, Clock, MessageSquare } from "lucide-react";
import { soundManager } from "@/lib/sounds";
import type { Room, WSMessage } from "@shared/schema";

interface DayPhaseProps {
  room: Room;
  playerId: string;
  onSendMessage: (message: WSMessage) => void;
}

export function DayPhase({ room, playerId, onSendMessage }: DayPhaseProps) {
  const currentPlayer = room.players.find(p => p.id === playerId);
  const isAlive = currentPlayer && !(currentPlayer as any).isAlive === false;
  const hasVotedReady = (room as any).votesReadyPlayers?.includes(playerId) || false;
  const votesReadyCount = (room as any).votesReadyCount || 0;
  const aliveCount = room.players.filter(p => (p as any).isAlive !== false).length;
  const majorityNeeded = Math.ceil(aliveCount / 2);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes

  // Calculate time left from timer
  useEffect(() => {
    if (room.timerEndsAt) {
      const updateTime = () => {
        const remaining = Math.max(0, Math.ceil((room.timerEndsAt! - Date.now()) / 1000));
        setTimeLeft(remaining);
      };
      updateTime();
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [room.timerEndsAt]);

  const handleStartVoting = () => {
    if (!hasVotedReady && isAlive) {
      soundManager.playVote();
      onSendMessage({ type: 'start_voting' } as any);
    }
  };

  return (
    <div className="space-y-6">
      {/* Night Results */}
      {(room as any).nightResult && (
        <Card className="mb-6 bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-amber-700/50 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-amber-200 flex items-center justify-center gap-2">
              <MessageSquare className="w-5 h-5" />
              نتائج الليل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-amber-100 text-lg font-semibold">
              {(room as any).nightResult}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Main Day Card */}
      <Card className="mb-6 bg-gradient-to-br from-amber-50/95 to-orange-50/95 border-amber-200/50 backdrop-blur-sm shadow-2xl">
        <CardHeader className="border-b border-amber-200/30">
          <CardTitle className="text-center text-amber-900 flex items-center justify-center gap-3">
            <Sun className="w-7 h-7 text-amber-500 animate-pulse" />
            النهار - النقاش
          </CardTitle>
          {room.timerEndsAt && (
            <div className="text-center mt-4">
              <Badge variant="outline" className="text-lg px-4 py-2 bg-amber-100 border-amber-300 text-amber-900 flex items-center gap-2 mx-auto w-fit">
                <Clock className="w-4 h-4" />
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-center text-amber-800 mb-6 text-lg font-medium">
            💬 ناقش وابحث عن المافيا...
          </p>

          {/* Start Voting Section */}
          <div className="mb-6 p-5 bg-gradient-to-r from-amber-100/50 to-orange-100/50 rounded-lg border border-amber-200/50">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                <Vote className="w-4 h-4" />
                بدء التصويت
              </p>
              <Badge variant="default" className="bg-amber-600 text-white">
                {votesReadyCount} / {majorityNeeded}
              </Badge>
            </div>
            <Button
              onClick={handleStartVoting}
              disabled={hasVotedReady || !isAlive}
              className={`w-full ${
                hasVotedReady 
                  ? 'bg-amber-200 text-amber-800 border-amber-300' 
                  : 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg'
              }`}
              size="lg"
            >
              {hasVotedReady ? (
                <>
                  ✓ طلبت بدء التصويت
                </>
              ) : (
                <>
                  <Vote className="w-5 h-5 ml-2" />
                  بدء التصويت
                </>
              )}
            </Button>
            <p className="text-xs text-amber-700 mt-3 text-center">
              يحتاج أكثر من نصف اللاعبين ({majorityNeeded}) لبدء التصويت
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Chat Section */}
      <Card className="bg-gradient-to-br from-amber-50/95 to-orange-50/95 border-amber-200/50 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-amber-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            النقاش العام
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
