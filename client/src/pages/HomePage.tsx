import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus } from "lucide-react";
import { Link } from "wouter";
import type { WSMessage } from "@shared/schema";

interface HomePageProps {
  onSendMessage: (message: WSMessage) => void;
  gameType?: string;
}

export default function HomePage({ onSendMessage, gameType = "whos-out" }: HomePageProps) {
  const [joinCode, setJoinCode] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(10);
  const playerName = localStorage.getItem('playerName') || "";

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName) {
      onSendMessage({
        type: 'create_room',
        data: { 
          playerName,
          isPublic,
          roomName: roomName.trim() || undefined,
          maxPlayers: Math.max(3, Math.min(20, maxPlayers)),
          gameType: gameType
        }
      });
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName && joinCode.trim()) {
      onSendMessage({
        type: 'join_room',
        data: {
          playerName,
          roomCode: joinCode.trim().toUpperCase()
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-3 sm:p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8 sm:mb-12">
          <div className="mb-4 sm:mb-6">
            <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-3xl sm:text-5xl font-bold text-primary">م</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            {gameType === "whos-out" ? "مين برا السالفة؟" : "المافيا"}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-2">
            {gameType === "whos-out" 
              ? "لعبة جماعية ممتعة وفيها ضحك"
              : "لعبة استراتيجية اجتماعية تعتمد على الخداع والتحليل"}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {gameType === "whos-out" 
              ? "اكتشفوا من الي برا السالفة!"
              : "فريقان متعارضان: المافيا والمدينة"}
          </p>
        </div>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
            <TabsTrigger value="create" data-testid="tab-create" className="text-xs sm:text-sm">
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
              <span className="hidden sm:inline">إنشاء غرفة</span>
              <span className="sm:hidden">إنشاء</span>
            </TabsTrigger>
            <TabsTrigger value="join" data-testid="tab-join" className="text-xs sm:text-sm">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
              <span className="hidden sm:inline">الانضمام لغرفة</span>
              <span className="sm:hidden">انضم</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card className="border-2">
              <CardHeader className="text-center pb-3 sm:pb-4">
                <CardTitle className="text-xl sm:text-2xl">إنشاء غرفة جديدة</CardTitle>
                <CardDescription className="text-sm sm:text-base mt-2">
                  ابدأ لعبة جديدة وشارك الكود مع أصدقائك
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="space-y-6">
                  {playerName && (
                    <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <p className="text-xs text-muted-foreground mb-1">اللعب باسم:</p>
                      <p className="font-bold text-xl text-primary">{playerName}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        <Link href="/profile" className="text-primary hover:underline font-medium">تغيير الاسم</Link>
                      </p>
                    </div>
                  )}
                  {!playerName && (
                    <div className="text-center p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                      <p className="text-sm text-destructive font-medium">الرجاء إدخال اسمك أولاً</p>
                      <Link href="/profile" className="text-sm text-destructive hover:underline font-semibold mt-2 inline-block">من الملف الشخصي</Link>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="room-name">اسم الغرفة (اختياري)</Label>
                      <Input
                        id="room-name"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        placeholder="مثلاً: لوبي الأصدقاء"
                        maxLength={30}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="room-type">نوع الغرفة</Label>
                      <div className="flex gap-4">
                        <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                          <input
                            type="radio"
                            name="room-type"
                            checked={!isPublic}
                            onChange={() => setIsPublic(false)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">خاص (يحتاج موافقة)</span>
                        </label>
                        <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                          <input
                            type="radio"
                            name="room-type"
                            checked={isPublic}
                            onChange={() => setIsPublic(true)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">عام (الكل يقدر ينضم)</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max-players">عدد اللاعبين الأقصى</Label>
                      <Input
                        id="max-players"
                        type="number"
                        min={gameType === "mafia" ? "4" : "3"}
                        max={gameType === "mafia" ? "30" : "20"}
                        value={maxPlayers}
                        onChange={(e) => {
                          const min = gameType === "mafia" ? 4 : 3;
                          const max = gameType === "mafia" ? 30 : 20;
                          setMaxPlayers(Math.max(min, Math.min(max, parseInt(e.target.value) || (gameType === "mafia" ? 10 : 10))));
                        }}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        الحد الأدنى للبدء: {gameType === "mafia" ? "4" : "3"} لاعبين
                      </p>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg"
                    disabled={!playerName}
                    data-testid="button-create-room"
                  >
                    <Plus className="w-5 h-5 ml-2" />
                    إنشاء الغرفة
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="join">
            <Card className="border-2">
              <CardHeader className="text-center pb-3 sm:pb-4">
                <CardTitle className="text-xl sm:text-2xl">انضم لغرفة</CardTitle>
                <CardDescription className="text-sm sm:text-base mt-2">
                  ادخل كود الغرفة للانضمام
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoin} className="space-y-6">
                  {playerName && (
                    <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <p className="text-xs text-muted-foreground mb-1">اللعب باسم:</p>
                      <p className="font-bold text-xl text-primary">{playerName}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        <Link href="/profile" className="text-primary hover:underline font-medium">تغيير الاسم</Link>
                      </p>
                    </div>
                  )}
                  {!playerName && (
                    <div className="text-center p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                      <p className="text-sm text-destructive font-medium">الرجاء إدخال اسمك أولاً</p>
                      <Link href="/profile" className="text-sm text-destructive hover:underline font-semibold mt-2 inline-block">من الملف الشخصي</Link>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="join-code" className="text-base">كود الغرفة</Label>
                    <Input
                      id="join-code"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="ABC123"
                      maxLength={6}
                      className="text-center text-2xl sm:text-3xl tracking-widest font-mono h-14 sm:h-16 text-base sm:text-lg"
                      data-testid="input-join-code"
                    />
                    <p className="text-xs text-muted-foreground text-center">6 أحرف أو أرقام</p>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg"
                    disabled={!playerName || joinCode.length !== 6}
                    data-testid="button-join-room"
                  >
                    <Users className="w-5 h-5 ml-2" />
                    الانضمام للغرفة
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </div>
  );
}
