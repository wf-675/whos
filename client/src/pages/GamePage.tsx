import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayerCard } from "@/components/PlayerCard";
import { Timer } from "@/components/Timer";
import { Eye, EyeOff, Trophy, RefreshCw, Send, Vote, ChevronRight, Home, MoreVertical, X, RotateCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";
import { soundManager } from "@/lib/sounds";
import { Header } from "@/components/Header";
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
  const [previousPhase, setPreviousPhase] = useState(room.phase);
  const currentPlayer = room.players.find(p => p.id === playerId);
  const isHost = currentPlayer?.isHost || false;
  const hasVotedReady = room.votesReadyPlayers?.includes(playerId) || false;

  // Play sounds when phase changes
  useEffect(() => {
    if (previousPhase !== room.phase) {
      if (room.phase === 'voting') {
        soundManager.playGameStart();
      } else if (room.phase === 'reveal') {
        soundManager.playReveal();
      }
      setPreviousPhase(room.phase);
    }
  }, [room.phase, previousPhase]);
  
  const hasVoted = currentPlayer?.votedFor !== undefined;
  const majorityNeeded = Math.ceil(room.players.length / 2);
  const votesReadyCount = room.votesReadyCount || 0;
  const votesReadyPercentage = Math.round((votesReadyCount / majorityNeeded) * 100);
  const isOddOneOut = playerId === room.oddOneOutId;

  const handleVote = () => {
    if (selectedPlayerId) {
      soundManager.playSuccess();
      onSendMessage({
        type: 'vote',
        data: { targetPlayerId: selectedPlayerId }
      });
    }
  };

  const handleStartVoting = () => {
    if (hasVotedReady) return; // Already voted
    soundManager.playClick();
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
        <div className="flex items-center justify-center gap-2 mb-2">
          <h2 className="text-3xl font-bold">النقاش والحوار</h2>
        </div>
        <p className="text-muted-foreground">
          تحدثوا وافتكروا من الي برا السالفة
        </p>
      </div>

      <div className="max-w-md mx-auto mb-8 text-center">
        <Button
          size="lg"
          onClick={handleStartVoting}
          disabled={hasVotedReady}
          className="min-w-[200px] transition-transform hover:scale-105 active:scale-95"
          data-testid="button-start-voting"
        >
          <Vote className="w-5 h-5 ml-2" />
          {hasVotedReady ? '✓ جاهز للتصويت' : 'نبي نصوت'}
        </Button>
      </div>

      <div className="max-w-md mx-auto mb-6 text-center">
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm font-semibold mb-2">
            {votesReadyCount} من {majorityNeeded} متأهبين للتصويت
          </p>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${votesReadyPercentage}%` }}
            ></div>
          </div>
          {votesReadyCount >= majorityNeeded && room.phase === 'discussion' && (
            <p className="text-xs text-primary mt-2 font-semibold">
              الأغلبية متجهزة للتصويت!
            </p>
          )}
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground mb-6">
        <p>اضغط "نبي نصوت" لما تحس إنك جاهز</p>
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
              {room.settings?.allowOddOneOutReveal && isOddOneOut ? (
                <p className="text-sm text-destructive text-center mt-4 font-semibold">
                  أنت برا السالفة!
                </p>
              ) : !room.settings?.allowOddOneOutReveal && isOddOneOut ? (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  الي برا السالفة معك في الجدول
                </p>
              ) : (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  أنت بالسالفة
                </p>
              )}
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
            <div key={player.id} className="relative">
              <PlayerCard player={player} />
              {isHost && !player.isHost && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 left-2 h-6 w-6 rounded-full"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => onSendMessage({ 
                        type: 'kick_player', 
                        data: { targetPlayerId: player.id } 
                      })}
                      className="text-destructive"
                    >
                      <X className="w-4 h-4 ml-2" />
                      طرد اللاعب
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
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
          اختر الي برا السالفة عندك
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {room.players.map((player) => {
            // Calculate vote count for this player
            const voteCount = room.players.filter(p => p.votedFor === player.id).length;
            
            // If odd one out knows their role, prevent them from voting for themselves
            const canVoteForThisPlayer = !hasVoted && 
              !(room.settings?.allowOddOneOutReveal && isOddOneOut && player.id === playerId);
            
            return (
              <div key={player.id} className="relative">
                <PlayerCard
                  player={player}
                  isSelected={selectedPlayerId === player.id}
                  onClick={() => canVoteForThisPlayer && setSelectedPlayerId(player.id)}
                  voteCount={voteCount}
                  showPoints={false}
                />
                {isHost && !player.isHost && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 left-2 h-6 w-6 rounded-full z-10"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => onSendMessage({ 
                          type: 'kick_player', 
                          data: { targetPlayerId: player.id } 
                        })}
                        className="text-destructive"
                      >
                        <X className="w-4 h-4 ml-2" />
                        طرد اللاعب
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}
        </div>

        {hasVoted ? (
          <div className="text-center">
            <Badge variant="secondary" className="text-lg px-6 py-2 animate-bounce">
              ✓ صوتك مسجل
            </Badge>
            <p className="text-muted-foreground mt-4">
              استنى باقي اللاعبين...
            </p>
          </div>
        ) : (
          <div className="text-center">
            <Button
              size="lg"
              onClick={handleVote}
              disabled={!selectedPlayerId}
              className="min-w-[200px] transition-transform hover:scale-105 active:scale-95"
              data-testid="button-submit-vote"
            >
              <Send className="w-5 h-5 ml-2" />
              أؤكد اختياري
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
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-2">
          <Trophy className="w-24 h-24 mx-auto mb-4 text-primary animate-bounce" />
          <h2 className="text-4xl font-bold mb-4">
            {playersWon ? "اللعبة لكم!" : "فاتتكم هذي!"}
          </h2>
          
          <Card className="max-w-md mx-auto mb-6">
            <CardContent className="pt-6">
              <p className="text-lg mb-2">الي برا السالفة كان...</p>
              <p className="text-5xl font-bold text-destructive mb-4 animate-pulse" data-testid="text-odd-player">
                {oddPlayer?.name}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">الكلمة الطبيعية</p>
                  <p className="font-semibold text-lg">{room.currentWord?.normal}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">كلمة الي برا السالفة</p>
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
                    showPoints={true}
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
                    showPoints={true}
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
                votedFor={room.players.find(p => p.id === player.votedFor)?.name || 'لم يصوت'}
                showPoints={true}
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
    <div className="min-h-screen bg-background">
      <Header />
      {/* Game Header */}
      <div className="border-b border-border bg-card/30">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-lg">الجولة {room.roundNumber}</h1>
            <Badge className="text-sm">
              {room.phase === 'discussion' && 'النقاش'}
              {room.phase === 'voting' && 'التصويت'}
              {room.phase === 'reveal' && 'النتائج'}
            </Badge>
          </div>
          <div className="flex gap-2">
            {isHost && room.phase !== 'lobby' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="w-4 h-4 ml-2" />
                    خيارات المضيف
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onSendMessage({ type: 'return_to_lobby' })}>
                    <RotateCcw className="w-4 h-4 ml-2" />
                    الرجوع للوبي
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSendMessage({ type: 'end_game' })}>
                    <X className="w-4 h-4 ml-2" />
                    إنهاء الجولة
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          <Button 
            variant="destructive"
            size="sm"
            onClick={() => {
              onSendMessage({ type: 'leave_room' });
              localStorage.removeItem('playerId');
              localStorage.removeItem('roomCode');
            }}
            data-testid="button-leave-game"
          >
            <Home className="w-4 h-4 ml-2" />
            خروج
          </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <div className="max-w-6xl mx-auto py-8">
          {room.phase === 'discussion' && renderDiscussionPhase()}
          {room.phase === 'voting' && renderVotingPhase()}
          {room.phase === 'reveal' && renderRevealPhase()}
        </div>
      </div>
    </div>
  );
}
