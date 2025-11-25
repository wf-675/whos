import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus } from "lucide-react";
import type { WSMessage } from "@shared/schema";

interface HomePageProps {
  onSendMessage: (message: WSMessage) => void;
}

export default function HomePage({ onSendMessage }: HomePageProps) {
  const [createName, setCreateName] = useState("");
  const [joinName, setJoinName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (createName.trim()) {
      onSendMessage({
        type: 'create_room',
        data: { playerName: createName.trim() }
      });
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinName.trim() && joinCode.trim()) {
      onSendMessage({
        type: 'join_room',
        data: {
          playerName: joinName.trim(),
          roomCode: joinCode.trim().toUpperCase()
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">مين برا السالفة؟</h1>
          <p className="text-muted-foreground">
            لعبة جماعية ممتعة - اكتشف الغريب بينكم!
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
                <CardTitle>إنشاء غرفة جديدة</CardTitle>
                <CardDescription>
                  أنشئ غرفة جديدة وشارك الكود مع أصدقائك
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">
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
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={!createName.trim()}
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
                <CardTitle>الانضمام لغرفة</CardTitle>
                <CardDescription>
                  أدخل الكود المكون من 6 أحرف للانضمام
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoin} className="space-y-4">
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
                    disabled={!joinName.trim() || joinCode.length !== 6}
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
