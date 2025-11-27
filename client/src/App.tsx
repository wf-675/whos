import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useWebSocket } from "@/hooks/use-websocket";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Route, Switch } from "wouter";
import HomePage from "@/pages/HomePage";
import LobbyPage from "@/pages/LobbyPage";
import GamePage from "@/pages/GamePage";
import ProfilePage from "@/pages/ProfilePage";
import { Loader2 } from "lucide-react";

function GameApp() {
  const { user, isLoading: authLoading, login } = useAuth();
  const { isConnected, room, playerId, playerWord, sendMessage } = useWebSocket();

  // Auto-login with saved name
  useEffect(() => {
    if (!authLoading && !user) {
      const savedName = localStorage.getItem('playerName');
      if (savedName) {
        login(savedName.toLowerCase().replace(/\s/g, '_'), savedName);
      }
    }
  }, [authLoading, user, login]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground text-lg">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Profile page route - always accessible
  return (
    <Switch>
      <Route path="/profile">
        <ProfilePage />
      </Route>
      
      <Route path="/">
        {!isConnected ? (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground text-lg">جاري الاتصال بالخادم...</p>
              <p className="text-sm text-muted-foreground mt-2">قد يستغرق الأمر بضع ثوانٍ</p>
            </div>
          </div>
        ) : !room || !playerId ? (
          <HomePage onSendMessage={sendMessage} />
        ) : room.phase === 'lobby' ? (
          <LobbyPage room={room} playerId={playerId} onSendMessage={sendMessage} />
        ) : (
          <GamePage room={room} playerId={playerId} playerWord={playerWord} onSendMessage={sendMessage} />
        )}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <GameApp />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
