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
  const hasVoted = currentPlayer?.votedFor !== undefined;

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
          {hasVoted ? "تم التصويت ✓" : "صوّت على من تريد طرده"}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {alivePlayers.map((player) => {
            const voteCount = voteCounts[player.id] || 0;
            return (
              <div
                key={player.id}
                onClick={() => !hasVoted && isAlive && setSelectedTarget(player.id)}
                className={`cursor-pointer transition-all ${
                  selectedTarget === player.id
                    ? 'ring-2 ring-primary scale-105'
                    : 'hover:opacity-80'
                } ${hasVoted || !isAlive ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <PlayerCard player={player} />
                {voteCount > 0 && (
                  <Badge variant="destructive" className="mt-2 w-full text-center">
                    {voteCount} صوت
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        {!hasVoted && isAlive && (
          <div className="flex justify-center gap-4">
            <Button
              onClick={handleVote}
              disabled={!selectedTarget}
              size="lg"
              className="min-w-[150px]"
            >
              تأكيد التصويت
            </Button>
          </div>
        )}

        {!isAlive && (
          <p className="text-center text-muted-foreground">
            أنت ميت، لا يمكنك التصويت
          </p>
        )}
      </CardContent>
    </Card>
  );
}

