import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, LogIn, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !displayName.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال جميع البيانات",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const success = await login(username.trim().toLowerCase(), displayName.trim());
    setIsLoading(false);

    if (success) {
      toast({
        title: "مرحباً! 👋",
        description: "تم تسجيل الدخول بنجاح",
      });
    } else {
      toast({
        title: "خطأ",
        description: "فشل تسجيل الدخول. حاول مرة أخرى",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="inline-block mb-4 p-4 bg-primary/10 rounded-full">
            <Sparkles className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            مين برا السالفة؟
          </h1>
          <p className="text-lg text-muted-foreground">
            سجل دخول وابدأ اللعب الحين! ⚡
          </p>
        </div>

        <Card className="shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="w-5 h-5" />
              تسجيل دخول سريع
            </CardTitle>
            <CardDescription>
              أدخل معلوماتك وابدأ اللعب - ما يحتاج إيميل! 🚀
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username">اسم المستخدم</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="مثال: cool_player"
                  maxLength={20}
                  className="mt-2"
                  disabled={isLoading}
                  autoComplete="username"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  اسم فريد بالإنجليزي بدون مسافات
                </p>
              </div>
              
              <div>
                <Label htmlFor="displayName">الاسم الظاهر</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="مثال: أحمد الرياض"
                  maxLength={20}
                  className="mt-2"
                  disabled={isLoading}
                  autoComplete="name"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  الاسم الي بيشوفه اللاعبين الثانيين
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                size="lg"
                disabled={isLoading || !username.trim() || !displayName.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    جاري التسجيل...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 ml-2" />
                    دخول
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                💡 نصيحة: اختر اسم مستخدم تتذكره عشان تقدر ترجع لحسابك في أي وقت
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>مجرد ما تسجل دخول، بتقدر تلعب مع أصحابك مباشرة! 🎮</p>
        </div>
      </div>
    </div>
  );
}

