import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Save, User, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";

export default function ProfilePage() {
  const [playerName, setPlayerName] = useState("");
  const [totalPoints, setTotalPoints] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('playerName');
    if (saved) setPlayerName(saved);
    
    // Load stats from localStorage
    const stats = localStorage.getItem('playerStats');
    if (stats) {
      try {
        const parsed = JSON.parse(stats);
        setTotalPoints(parsed.totalPoints || 0);
        setGamesPlayed(parsed.gamesPlayed || 0);
      } catch (e) {
        // Ignore
      }
    }
  }, []);

  const handleSave = () => {
    if (!playerName.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم صحيح",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('playerName', playerName.trim());
    toast({
      title: "تم الحفظ!",
      description: "تم تحديث اسمك بنجاح",
    });
  };

  const initials = playerName.slice(0, 2).toUpperCase() || "??";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">الملف الشخصي</h1>
          <p className="text-muted-foreground">إدارة حسابك وإعدادات اللعبة</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                المعلومات الشخصية
              </CardTitle>
              <CardDescription>تعديل اسمك ومعلوماتك</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{playerName || "ضيف"}</p>
                  <p className="text-sm text-muted-foreground">لاعب</p>
                </div>
              </div>

              <div>
                <Label htmlFor="player-name">اسمك</Label>
                <Input
                  id="player-name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="أدخل اسمك"
                  maxLength={20}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  هذا الاسم سيظهر للاعبين الآخرين
                </p>
              </div>

              <Button onClick={handleSave} className="w-full">
                <Save className="w-4 h-4 ml-2" />
                حفظ التغييرات
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                الإحصائيات
              </CardTitle>
              <CardDescription>إحصائياتك في اللعبة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">إجمالي النقاط</p>
                    <p className="text-2xl font-bold">{totalPoints}</p>
                  </div>
                  <Trophy className="w-8 h-8 text-primary" />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">عدد الألعاب</p>
                    <p className="text-2xl font-bold">{gamesPlayed}</p>
                  </div>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {gamesPlayed > 0 ? Math.round(totalPoints / gamesPlayed) : 0} نقطة/لعبة
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
