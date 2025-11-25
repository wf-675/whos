import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayerCard } from "@/components/PlayerCard";
import { Timer } from "@/components/Timer";
import { Eye, EyeOff, Trophy, RefreshCw } from "lucide-react";
import type { Room } from "@shared/schema";
import type { WSMessage } from "@shared/schema";

interface GamePageProps {
  room: Room;
  playerId: string;
  playerWord: string | null;
  onSendMessage: (message: WSMessage) => void;
}

export default function GamePage({ room, playerId, playerWord, onSendMessage }: GamePageProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [showWord, setShowWord] = useState(false);
  
  const currentPlayer = room.players.find(p => p.id === playerId);
  const hasVoted = currentPlayer?.votedFor !== undefined;

  const handleVote = () => {
    if (selectedPlayerId && selectedPlayerId !== playerId) {
      onSendMessage({
        type: 'vote',
        data: { targetPlayerId: selectedPlayerId }
      });
    }
  };

  const handleStartVoting = () => {
    onSendMessage({
      type: 'start_voting'
    });
  };


  const handleNextRound = () => {
    onSendMessage({ type: 'next_round' });
  };


  const renderDiscussionPhase = () => (
    <>
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2">النقاش</h2>
        <p className="text-muted-foreground">
          تحدثوا واكتشفوا من هو الغريب
        </p>
      </div>

      <div className="max-w-md mx-auto mb-8 text-center">
        <Button
          size="lg"
          onClick={handleStartVoting}
          className="min-w-[200px]"
          data-testid="button-start-voting"
        >
          نبي نصوت
        </Button>
      </div>

      <Card className="max-w-md mx-auto mb-8">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">كلمتك</h3>
            {playerWord && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWord(!showWord)}
                data-testid="button-toggle-word"
              >
                {showWord ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {playerWord ? (
            <>
              {showWord ? (
                <p className="text-4xl font-bold text-center" data-testid="text-player-word">
                  {playerWord}
                </p>
              ) : (
                <p className="text-4xl font-bold text-center blur-sm select-none">
                  ••••••
                </p>
              )}
              <p className="text-sm text-muted-foreground text-center mt-4">
                اكتشف من هو الغريب
              </p>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">جاري تحميل الكلمة...</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-semibold mb-4">اللاعبون</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {room.players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      </div>
    </>
  );

  const renderVotingPhase = () => (
    <>
      <div className="mb-8">
        {room.timerEndsAt && (
          <Timer endsAt={room.timerEndsAt} />
        )}
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">وقت التصويت!</h2>
        <p className="text-muted-foreground">
          اختر من تعتقد أنه الغريب
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {room.players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              isSelected={selectedPlayerId === player.id}
              onClick={() => !hasVoted && player.id !== playerId && setSelectedPlayerId(player.id)}
            />
          ))}
        </div>

        {hasVoted ? (
          <div className="text-center">
            <Badge variant="secondary" className="text-lg px-6 py-2">
              تم التصويت ✓
            </Badge>
            <p className="text-muted-foreground mt-4">
              في انتظار باقي اللاعبين...
            </p>
          </div>
        ) : (
          <div className="text-center">
            <Button
              size="lg"
              onClick={handleVote}
              disabled={!selectedPlayerId || selectedPlayerId === playerId}
              className="min-w-[200px]"
              data-testid="button-submit-vote"
            >
              تأكيد التصويت
            </Button>
          </div>
        )}
      </div>
    </>
  );

  const renderRevealPhase = () => {
    const oddPlayer = room.players.find(p => p.id === room.oddOneOutId);
    const normalPlayers = room.players.filter(p => p.id !== room.oddOneOutId);
    
    const voteCounts = room.players.reduce((acc, player) => {
      if (player.votedFor) {
        acc[player.votedFor] = (acc[player.votedFor] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const maxVotes = Math.max(...Object.values(voteCounts));
    const mostVotedId = Object.entries(voteCounts).find(([_, count]) => count === maxVotes)?.[0];
    const playersWon = mostVotedId === room.oddOneOutId;

    return (
      <>
        <div className="text-center mb-8">
          <Trophy className="w-24 h-24 mx-auto mb-4 text-primary" />
          <h2 className="text-4xl font-bold mb-4">
            {playersWon ? "نجحتم! 🎉" : "فشلتم! 😅"}
          </h2>
          
          <Card className="max-w-md mx-auto mb-6">
            <CardContent className="pt-6">
              <p className="text-lg mb-2">الغريب كان...</p>
              <p className="text-5xl font-bold text-destructive mb-4" data-testid="text-odd-player">
                {oddPlayer?.name}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">الكلمة العادية</p>
                  <p className="font-semibold text-lg">{room.currentWord?.normal}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">كلمة الغريب</p>
                  <p className="font-semibold text-lg">{room.currentWord?.odd}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-center text-destructive">برا السالفة</h3>
              <div className="flex justify-center">
                {oddPlayer && (
                  <PlayerCard
                    key={oddPlayer.id}
                    player={oddPlayer}
                    playerRole="odd"
                  />
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-center text-primary">بالسالفة</h3>
              <div className="grid grid-cols-2 gap-4">
                {normalPlayers.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    playerRole="normal"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <h3 className="text-xl font-semibold mb-4 text-center">نتائج التصويت</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {room.players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                showVote
              />
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button
            size="lg"
            onClick={handleNextRound}
            className="min-w-[200px]"
            data-testid="button-next-round"
          >
            <RefreshCw className="w-5 h-5 ml-2" />
            جولة جديدة
          </Button>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">مين برا السالفة؟</h1>
            <Badge variant="secondary" className="mt-2">
              الجولة {room.roundNumber}
            </Badge>
          </div>
          <Badge className="text-lg px-4 py-2">
            {room.phase === 'discussion' && 'مرحلة النقاش'}
            {room.phase === 'voting' && 'مرحلة التصويت'}
            {room.phase === 'reveal' && 'النتائج'}
          </Badge>
        </div>

        {room.phase === 'discussion' && renderDiscussionPhase()}
        {room.phase === 'voting' && renderVotingPhase()}
        {room.phase === 'reveal' && renderRevealPhase()}
      </div>
    </div>
  );
}
