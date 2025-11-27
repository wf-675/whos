import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, UserCircle, LogOut } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import type { WSMessage } from "@shared/schema";

interface HomePageProps {
  onSendMessage: (message: WSMessage) => void;
}

export default function HomePage({ onSendMessage }: HomePageProps) {
  const { user, logout } = useAuth();
  const [createName, setCreateName] = useState(user?.displayName || "");
  const [joinName, setJoinName] = useState(user?.displayName || "");
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* User Info Header */}
        <div className="flex items-center justify-between mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
              {user?.displayName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">{user?.displayName}</p>
              <p className="text-sm text-muted-foreground">@{user?.username}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/profile">
              <Button variant="outline" size="sm" className="transition-transform hover:scale-105">
                <UserCircle className="w-4 h-4 ml-2" />
                الملف الشخصي
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-6xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
            مين برا السالفة؟
          </h1>
          <p className="text-lg text-muted-foreground">
            لعبة جماعية ممتعة وفيها ضحك - اكتشفوا من الي برا السالفة! 🎭
          </p>
        </div>

        <Tabs defaultValue="create" className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
          <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
            <TabsTrigger value="create" data-testid="tab-create" className="text-base">
              <Plus className="w-5 h-5 ml-2" />
              إنشاء غرفة
            </TabsTrigger>
            <TabsTrigger value="join" data-testid="tab-join" className="text-base">
              <Users className="w-5 h-5 ml-2" />
              الانضمام لغرفة
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card className="border-2 shadow-xl hover:shadow-2xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl">إنشاء غرفة جديدة</CardTitle>
                <CardDescription className="text-base">
                  كن المضيف واستقبل أصحابك! 🎪
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
                    className="w-full h-12 text-lg transition-transform hover:scale-105 active:scale-95"
                    disabled={!createName.trim()}
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
            <Card className="border-2 shadow-xl hover:shadow-2xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl">انضم لغرفة موجودة</CardTitle>
                <CardDescription className="text-base">
                  اطلب الكود من صاحبك وادخل! 🚪
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
                    className="w-full h-12 text-lg transition-transform hover:scale-105 active:scale-95"
                    disabled={!joinName.trim() || joinCode.length !== 6}
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
  );
}
