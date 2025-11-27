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
}

export default function HomePage({ onSendMessage }: HomePageProps) {
  const [joinCode, setJoinCode] = useState("");
  const playerName = localStorage.getItem('playerName') || "";

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName) {
      onSendMessage({
        type: 'create_room',
        data: { playerName }
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
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-5xl font-bold text-primary">م</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4">مين برا السالفة؟</h1>
          <p className="text-lg text-muted-foreground mb-2">
            لعبة جماعية ممتعة وفيها ضحك
          </p>
          <p className="text-sm text-muted-foreground">
            اكتشفوا من الي برا السالفة!
          </p>
        </div>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="create" data-testid="tab-create">
              <Plus className="w-4 h-4 ml-2" />
              إنشاء غرفة
            </TabsTrigger>
            <TabsTrigger value="join" data-testid="tab-join">
              <Users className="w-4 h-4 ml-2" />
              الانضمام لغرفة
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card className="border-2">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">إنشاء غرفة جديدة</CardTitle>
                <CardDescription className="text-base mt-2">
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
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">انضم لغرفة</CardTitle>
                <CardDescription className="text-base mt-2">
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
                      className="text-center text-3xl tracking-widest font-mono h-16 text-lg"
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
