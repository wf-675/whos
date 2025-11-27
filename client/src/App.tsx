import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useWebSocket } from "@/hooks/use-websocket";
import { Route, Switch, useLocation } from "wouter";
import HomePage from "@/pages/HomePage";
import LobbyPage from "@/pages/LobbyPage";
import GamePage from "@/pages/GamePage";
import ProfilePage from "@/pages/ProfilePage";
import { Header } from "@/components/Header";
import { Loader2 } from "lucide-react";

function GameApp() {
  const { isConnected, room, playerId, playerWord, sendMessage } = useWebSocket();
  const [location] = useLocation();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground text-lg">جاري الاتصال بالخادم...</p>
          <p className="text-sm text-muted-foreground mt-2">قد يستغرق الأمر بضع ثوانٍ</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/profile">
        <ProfilePage />
      </Route>
      
      <Route path="/">
        {!room || !playerId ? (
          <>
            <Header />
            <HomePage onSendMessage={sendMessage} />
          </>
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
      <TooltipProvider>
        <GameApp />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
