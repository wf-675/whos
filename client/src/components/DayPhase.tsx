import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayerCard } from "@/components/PlayerCard";
import type { Room, WSMessage } from "@shared/schema";

interface DayPhaseProps {
  room: Room;
  playerId: string;
  onSendMessage: (message: WSMessage) => void;
}

export function DayPhase({ room, playerId, onSendMessage }: DayPhaseProps) {
  const currentPlayer = room.players.find(p => p.id === playerId);
  const isAlive = currentPlayer && !(currentPlayer as any).isAlive === false;
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const hasVotedReady = (room as any).votesReadyPlayers?.includes(playerId) || false;
  const votesReadyCount = (room as any).votesReadyCount || 0;
  const aliveCount = room.players.filter(p => (p as any).isAlive !== false).length;
  const majorityNeeded = Math.ceil(aliveCount / 2);

  // Get alive players (excluding self)
  const alivePlayers = room.players.filter(p => {
    const playerAlive = (p as any)?.isAlive !== false;
    return playerAlive && p.id !== playerId;
  });

  const handleVote = () => {
    if (!selectedTarget || hasVoted || !isAlive) return;

    onSendMessage({
      type: 'mafia_vote',
      data: { targetPlayerId: selectedTarget }
    } as any);
  };

  // Count votes
  const voteCounts: Record<string, number> = {};
  room.players.forEach(player => {
    if (player.votedFor && (player as any).isAlive !== false) {
      voteCounts[player.votedFor] = (voteCounts[player.votedFor] || 0) + 1;
    }
  });

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-center">☀️ النهار - التصويت</CardTitle>
      </CardHeader>
      <CardContent>
        {(room as any).nightResult && (
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <p className="text-center font-semibold mb-2">نتائج الليل:</p>
            <p className="text-center text-sm">
              {(room as any).nightResult}
            </p>
          </div>
        )}

        <p className="text-center text-muted-foreground mb-6">
          ناقش وابحث عن المافيا...
        </p>

        <div className="mb-6 p-4 bg-primary/10 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold">بدء التصويت</p>
            <Badge variant="default">
              {votesReadyCount} / {majorityNeeded}
            </Badge>
          </div>
          <Button
            onClick={() => {
              if (!hasVotedReady && isAlive) {
                onSendMessage({ type: 'start_voting' } as any);
              }
            }}
            disabled={hasVotedReady || !isAlive}
            className="w-full"
            variant={hasVotedReady ? "outline" : "default"}
          >
            {hasVotedReady ? "✓ طلبت بدء التصويت" : "بدء التصويت"}
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            يحتاج أكثر من نصف اللاعبين لبدء التصويت
          </p>
        </div>
      </CardContent>
    </Card>
  );
}



