import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Target, Flame, LogOut, Home, Crown } from "lucide-react";
import { Link } from "wouter";

interface LeaderboardUser {
  id: string;
  username: string;
  displayName: string;
  totalPoints: number;
  gamesPlayed: number;
  gamesWon: number;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        setLeaderboard(data);
        const rank = data.findIndex((u: LeaderboardUser) => u.id === user?.id);
        setUserRank(rank !== -1 ? rank + 1 : null);
      })
      .catch(console.error);
  }, [user?.id]);

  if (!user) return null;

  const winRate = user.gamesPlayed ? 
    Math.round((user.gamesWon! / user.gamesPlayed!) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold text-xl">الملف الشخصي</h1>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 ml-2" />
                الرئيسية
              </Button>
            </Link>
            <Button variant="destructive" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 ml-2" />
              خروج
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 py-8">
        {/* User Profile Card */}
        <Card className="mb-8 overflow-hidden border-2">
          <div className="h-32 bg-gradient-to-r from-primary to-accent" />
          <CardContent className="pt-0">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16">
              <div className="w-32 h-32 rounded-full bg-card border-4 border-background flex items-center justify-center shadow-xl">
                <span className="text-5xl">🎮</span>
              </div>
              <div className="text-center md:text-right flex-1 pb-2">
                <h2 className="text-3xl font-bold mb-1">{user.displayName}</h2>
                <p className="text-muted-foreground mb-3">@{user.username}</p>
                {userRank && (
                  <Badge className="text-lg px-4 py-1">
                    <Crown className="w-4 h-4 ml-2" />
                    المرتبة #{userRank}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Trophy className="w-4 h-4" />
                إجمالي النقاط
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{user.totalPoints || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Target className="w-4 h-4" />
                الألعاب المكتملة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{user.gamesPlayed || 0}</p>
              <p className="text-sm text-muted-foreground mt-1">
                فزت في {user.gamesWon || 0} لعبة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Flame className="w-4 h-4" />
                نسبة الفوز
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-accent">{winRate}%</p>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-accent h-full rounded-full transition-all"
                  style={{ width: `${winRate}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              لوحة الصدارة - أفضل 50 لاعب
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                لا توجد بيانات حالياً
              </p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                      player.id === user.id 
                        ? 'bg-primary/10 border-2 border-primary' 
                        : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white text-lg">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `#${index + 1}`}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{player.displayName}</p>
                      <p className="text-sm text-muted-foreground">@{player.username}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg text-primary">{player.totalPoints}</p>
                      <p className="text-xs text-muted-foreground">نقطة</p>
                    </div>
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-medium">{player.gamesWon}/{player.gamesPlayed}</p>
                      <p className="text-xs text-muted-foreground">فوز/لعبة</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

