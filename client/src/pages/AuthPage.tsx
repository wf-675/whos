import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, LogIn, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthPageProps {
  onLogin?: () => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسمك",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // Save name to localStorage
    localStorage.setItem('playerName', displayName.trim());
    // Login with name
    const username = displayName.trim().toLowerCase().replace(/\s/g, '_');
    const success = await login(username, displayName.trim());
    setIsLoading(false);

    if (success) {
      toast({
        title: "مرحباً! 👋",
        description: "تم تسجيل الدخول بنجاح",
      });
      onLogin?.();
    } else {
      toast({
        title: "خطأ",
        description: "فشل تسجيل الدخول. حاول مرة أخرى",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2">مين برا السالفة؟</h1>
          <p className="text-lg text-muted-foreground">
            أدخل اسمك وابدأ اللعب! 🎮
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>أدخل اسمك</CardTitle>
            <CardDescription>
              مرة واحدة فقط - الاسم بيحفظ تلقائياً
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="displayName">اسمك</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="مثال: أحمد"
                  maxLength={20}
                  className="mt-2"
                  disabled={isLoading}
                  autoComplete="name"
                  autoFocus
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                size="lg"
                disabled={isLoading || !displayName.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    جاري التسجيل...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 ml-2" />
                    ابدأ اللعب
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

