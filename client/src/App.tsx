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
import InfoPage from "@/pages/InfoPage";
import RoomsPage from "@/pages/RoomsPage";
import GameSelectionPage from "@/pages/GameSelectionPage";
import MafiaLobbyPage from "@/pages/MafiaLobbyPage";
import MafiaGamePage from "@/pages/MafiaGamePage";
import { Header } from "@/components/Header";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

function GameApp() {
  const { isConnected, room, playerId, playerWord, sendMessage } = useWebSocket();
  const [location, setLocation] = useLocation();

  // Check if player name is set on first load
  useEffect(() => {
    const playerName = localStorage.getItem('playerName');
    if (!playerName && location === '/') {
      // Redirect to profile if no name is set
      setLocation('/profile');
    }
  }, [location, setLocation]);

  // Note: We don't auto-redirect anymore. The Header component will show an alert
  // and the user can manually navigate back using the "ارجع للعبة" button.

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
      
      <Route path="/info">
        <InfoPage />
      </Route>
      
      <Route path="/rooms">
        <RoomsPage />
      </Route>
      
      <Route path="/whos-out">
        {!room || !playerId ? (
          <>
            <Header />
            <HomePage onSendMessage={sendMessage} gameType="whos-out" />
          </>
        ) : room.phase === 'lobby' ? (
          <LobbyPage room={room} playerId={playerId} onSendMessage={sendMessage} />
        ) : (
          <GamePage room={room} playerId={playerId} playerWord={playerWord} onSendMessage={sendMessage} />
        )}
      </Route>
      
      <Route path="/mafia">
        {!room || !playerId ? (
          <>
            <Header />
            <HomePage onSendMessage={sendMessage} gameType="mafia" />
          </>
        ) : room.gameType === "mafia" ? (
          room.phase === 'lobby' ? (
            <MafiaLobbyPage room={room} playerId={playerId} onSendMessage={sendMessage} />
          ) : (
            <MafiaGamePage room={room} playerId={playerId} onSendMessage={sendMessage} />
          )
        ) : (
          <>
            <Header />
            <HomePage onSendMessage={sendMessage} gameType="mafia" />
          </>
        )}
      </Route>
      
      <Route path="/">
        <Header />
        <GameSelectionPage />
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
