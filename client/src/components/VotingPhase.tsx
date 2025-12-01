import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayerCard } from "@/components/PlayerCard";
import { Vote, CheckCircle, XCircle, Clock } from "lucide-react";
import { soundManager } from "@/lib/sounds";
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

    soundManager.playVote();
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
      <Card className="mb-6 bg-gradient-to-br from-amber-50/95 to-orange-50/95 border-amber-200/50 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-amber-900 flex items-center justify-center gap-2">
            <Vote className="w-6 h-6 text-amber-600" />
            التصويت
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-amber-700 text-lg">
            ⏳ {currentVoter ? `دور ${currentVoter.name} في التصويت...` : 'انتظر دورك...'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 bg-gradient-to-br from-amber-50/95 to-orange-50/95 border-amber-200/50 backdrop-blur-sm shadow-2xl">
      <CardHeader className="border-b border-amber-200/30">
        <CardTitle className="text-center text-amber-900 flex items-center justify-center gap-3">
          <Vote className="w-7 h-7 text-amber-600" />
          التصويت
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {isMyTurn && !hasVoted && (
          <p className="text-center text-amber-800 mb-6 text-lg font-medium">
            🗳️ دورك في التصويت - اختر لاعباً للطرد أو Skip
          </p>
        )}

        {hasVoted && (
          <div className="text-center mb-6 p-4 bg-green-100/50 rounded-lg border border-green-300/50">
            <p className="text-green-700 font-semibold text-lg flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              ✓ تم التصويت بنجاح
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
          {alivePlayers.map((player) => {
            const voteCount = voteCounts[player.id] || 0;
            const isSelected = selectedTarget === player.id;
            return (
              <div
                key={player.id}
                onClick={() => isMyTurn && !hasVoted && isAlive && setSelectedTarget(player.id)}
                className={`cursor-pointer transition-all transform ${
                  isSelected
                    ? 'ring-2 ring-amber-500 scale-105 shadow-lg shadow-amber-500/50'
                    : 'hover:scale-102 hover:shadow-md hover:shadow-amber-500/20'
                } ${hasVoted || !isAlive || !isMyTurn ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <PlayerCard player={player} />
                {voteCount > 0 && (
                  <Badge variant="destructive" className="mt-2 w-full text-center bg-red-600">
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
              className="min-w-[180px] bg-amber-600 hover:bg-amber-700 text-white shadow-lg"
            >
              <CheckCircle className="w-5 h-5 ml-2" />
              تأكيد التصويت
            </Button>
            <Button
              onClick={() => handleVote(null)}
              size="lg"
              variant="outline"
              className="min-w-[180px] border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <XCircle className="w-5 h-5 ml-2" />
              Skip
            </Button>
          </div>
        )}

        {!isAlive && (
          <div className="text-center p-4 bg-slate-100/50 rounded-lg">
            <p className="text-slate-600">
              💀 أنت ميت، لا يمكنك التصويت
            </p>
          </div>
        )}

        {/* Voting Results Summary */}
        {Object.keys(voteCounts).length > 0 && (
          <div className="mt-6 p-4 bg-amber-100/50 rounded-lg border border-amber-200/50">
            <p className="text-sm font-semibold text-amber-900 mb-2">ملخص الأصوات:</p>
            <div className="space-y-1">
              {Object.entries(voteCounts).map(([targetId, count]) => {
                const target = targetId === 'skip' ? 'Skip' : 
                              room.players.find(p => p.id === targetId)?.name || 'غير معروف';
                return (
                  <div key={targetId} className="flex justify-between text-sm text-amber-800">
                    <span>{target}</span>
                    <Badge variant="outline" className="bg-white">{count}</Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
