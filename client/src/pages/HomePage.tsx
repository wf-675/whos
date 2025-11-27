import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { WSMessage } from "@shared/schema";

interface HomePageProps {
  onSendMessage: (message: WSMessage) => void;
}

export default function HomePage({ onSendMessage }: HomePageProps) {
  const { user, logout, login } = useAuth();
  const [createName, setCreateName] = useState(() => {
    const saved = localStorage.getItem('playerName');
    return saved || user?.displayName || "";
  });
  const [joinName, setJoinName] = useState(() => {
    const saved = localStorage.getItem('playerName');
    return saved || user?.displayName || "";
  });
  const [joinCode, setJoinCode] = useState("");
  const [showNamePrompt, setShowNamePrompt] = useState(!user && !localStorage.getItem('playerName'));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createName.trim()) {
      // Save name and login
      localStorage.setItem('playerName', createName.trim());
      if (!user) {
        await login(createName.trim().toLowerCase().replace(/\s/g, '_'), createName.trim());
      }
      onSendMessage({
        type: 'create_room',
        data: { playerName: createName.trim() }
      });
      setShowNamePrompt(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameToUse = joinName.trim() || createName.trim();
    if (nameToUse && joinCode.trim()) {
      // Save name and login
      localStorage.setItem('playerName', nameToUse);
      if (!user) {
        await login(nameToUse.toLowerCase().replace(/\s/g, '_'), nameToUse);
      }
      onSendMessage({
        type: 'join_room',
        data: {
          playerName: nameToUse,
          roomCode: joinCode.trim().toUpperCase()
        }
      });
      setShowNamePrompt(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2">مين برا السالفة؟</h1>
          <p className="text-lg text-muted-foreground">
            لعبة جماعية ممتعة وفيها ضحك - اكتشفوا من الي برا السالفة!
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
            <Card>
              <CardHeader>
                <CardTitle>إنشاء غرفة</CardTitle>
                <CardDescription>
                  روح أول واعرض الكود لأصدقائك
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">
                  {showNamePrompt && (
                    <div>
                      <Label htmlFor="create-name">اسمك</Label>
                      <Input
                        id="create-name"
                        value={createName}
                        onChange={(e) => setCreateName(e.target.value)}
                        placeholder="أدخل اسمك"
                        maxLength={20}
                        className="mt-2"
                        data-testid="input-create-name"
                      />
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={showNamePrompt && !createName.trim()}
                    data-testid="button-create-room"
                  >
                    إنشاء الغرفة
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="join">
            <Card>
              <CardHeader>
                <CardTitle>انضم لغرفة</CardTitle>
                <CardDescription>
                  اطلب الكود من الي بدأ غرفة وادخله هنا
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoin} className="space-y-4">
                  {showNamePrompt && (
                    <div>
                      <Label htmlFor="join-name">اسمك</Label>
                      <Input
                        id="join-name"
                        value={joinName}
                        onChange={(e) => setJoinName(e.target.value)}
                        placeholder="أدخل اسمك"
                        maxLength={20}
                        className="mt-2"
                        data-testid="input-join-name"
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="join-code">كود الغرفة</Label>
                    <Input
                      id="join-code"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="مثال: ABC123"
                      maxLength={6}
                      className="mt-2 text-center text-2xl tracking-widest font-mono"
                      data-testid="input-join-code"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={joinCode.length !== 6}
                    data-testid="button-join-room"
                  >
                    الانضمام للغرفة
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
