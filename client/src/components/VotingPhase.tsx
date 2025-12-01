import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayerCard } from "@/components/PlayerCard";
import type { Room, WSMessage } from "@shared/schema";

interface VotingPhaseProps {
  room: Room;
  playerId: string;
  onSendMessage: (message: WSMessage) => void;
}

export function VotingPhase({ room, playerId, onSendMessage }: VotingPhaseProps) {
  const currentPlayer = room.players.find(p => p.id === playerId);
  const isAlive = currentPlayer && !(currentPlayer as any).isAlive !== false;
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const hasVoted = currentPlayer?.votedFor !== undefined;
  const currentVoterIndex = (room as any).currentVoterIndex || 0;
  const isMyTurn = currentVoterIndex < room.players.length && 
                   room.players[currentVoterIndex]?.id === playerId;

  // Get alive players
  const alivePlayers = room.players.filter(p => {
    const playerAlive = (p as any)?.isAlive !== false;
    return playerAlive;
  });

  const handleVote = (targetId: string | null) => {
    if (hasVoted || !isAlive || !isMyTurn) return;

    onSendMessage({
      type: 'mafia_vote',
      data: { targetPlayerId: targetId || 'skip' }
    } as any);
  };

  // Count votes
  const voteCounts: Record<string, number> = {};
  room.players.forEach(player => {
    if (player.votedFor && (player as any).isAlive !== false) {
      const target = player.votedFor === 'skip' ? 'skip' : player.votedFor;
      voteCounts[target] = (voteCounts[target] || 0) + 1;
    }
  });

  if (!isMyTurn && !hasVoted) {
    const currentVoter = room.players[currentVoterIndex];
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-center">🗳️ التصويت</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            {currentVoter ? `دور ${currentVoter.name} في التصويت...` : 'انتظر دورك...'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-center">🗳️ التصويت</CardTitle>
      </CardHeader>
      <CardContent>
        {isMyTurn && !hasVoted && (
          <p className="text-center text-muted-foreground mb-6">
            دورك في التصويت - اختر لاعباً للطرد أو Skip
          </p>
        )}

        {hasVoted && (
          <p className="text-center text-green-500 mb-6 font-semibold">
            ✓ تم التصويت
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {alivePlayers.map((player) => {
            const voteCount = voteCounts[player.id] || 0;
            return (
              <div
                key={player.id}
                onClick={() => isMyTurn && !hasVoted && isAlive && setSelectedTarget(player.id)}
                className={`cursor-pointer transition-all ${
                  selectedTarget === player.id
                    ? 'ring-2 ring-primary scale-105'
                    : 'hover:opacity-80'
                } ${hasVoted || !isAlive || !isMyTurn ? 'opacity-50 cursor-not-allowed' : ''}`}
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

        {isMyTurn && !hasVoted && isAlive && (
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => handleVote(selectedTarget)}
              disabled={!selectedTarget}
              size="lg"
              variant="default"
              className="min-w-[150px]"
            >
              تأكيد التصويت
            </Button>
            <Button
              onClick={() => handleVote(null)}
              size="lg"
              variant="outline"
              className="min-w-[150px]"
            >
              Skip
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

