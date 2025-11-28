import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { User, Settings, LogOut, Home, Info, Menu, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useWebSocket } from "@/hooks/use-websocket";

export function Header() {
  const [playerName, setPlayerName] = useState("");
  const [location] = useLocation();
  const { room, playerId } = useWebSocket();
  const [showGameAlert, setShowGameAlert] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('playerName');
    if (saved) setPlayerName(saved);
  }, []);

  useEffect(() => {
    // Show alert if user navigates away during game (but not in lobby, and not if host)
    const currentPlayer = room?.players.find(p => p.id === playerId);
    const isHost = currentPlayer?.isHost || false;
    
    // Only show alert if:
    // 1. In a room and has playerId
    // 2. Not in lobby phase
    // 3. Not the host
    // 4. On home or info page
    if (room && playerId && room.phase !== 'lobby' && !isHost && (location === "/" || location === "/info")) {
      setShowGameAlert(true);
    } else {
      setShowGameAlert(false);
    }
  }, [room, playerId, location]);

  const initials = playerName.slice(0, 2).toUpperCase() || "??";
  const isInGame = room && playerId;

  const isHomePage = location === "/" && (!room || !playerId);

  return (
    <>
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-base sm:text-lg">
                م
              </div>
              <h1 className="text-lg sm:text-xl font-bold">مين برا السالفة؟</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Button 
              variant={isHomePage ? "default" : "ghost"} 
              size="sm"
              onClick={() => {
                if (room && playerId) {
                  // Leave room first if in a room
                  const ws = (window as any).__ws__;
                  if (ws) {
                    ws.send(JSON.stringify({ type: 'leave_room' }));
                  }
                  localStorage.removeItem('playerId');
                  localStorage.removeItem('roomCode');
                }
                window.location.href = '/';
              }}
            >
              <Home className="w-4 h-4 ml-2" />
              الرئيسية
            </Button>
            <Link href="/info">
              <Button variant={location === "/info" ? "default" : "ghost"} size="sm">
                <Info className="w-4 h-4 ml-2" />
                معلومات
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {playerName && (
              <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
                <span>مرحباً،</span>
                <span className="font-semibold text-foreground">{playerName}</span>
              </div>
            )}
            
            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle>القائمة</SheetTitle>
                  <SheetDescription>
                    {playerName && (
                      <div className="flex items-center gap-2 mt-2 p-2 bg-muted rounded-lg">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold">{playerName}</p>
                          <p className="text-xs text-muted-foreground">لاعب</p>
                        </div>
                      </div>
                    )}
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  <Button 
                    variant={isHomePage ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => {
                      if (room && playerId) {
                        // Leave room first if in a room
                        const ws = (window as any).__ws__;
                        if (ws) {
                          ws.send(JSON.stringify({ type: 'leave_room' }));
                        }
                        localStorage.removeItem('playerId');
                        localStorage.removeItem('roomCode');
                      }
                      setMobileMenuOpen(false);
                      window.location.href = '/';
                    }}
                  >
                    <Home className="w-4 h-4 ml-2" />
                    الرئيسية
                  </Button>
                  <Link href="/rooms" onClick={() => setMobileMenuOpen(false)}>
                    <Button 
                      variant={location === "/rooms" ? "default" : "ghost"} 
                      className="w-full justify-start"
                    >
                      <Users className="w-4 h-4 ml-2" />
                      اللوبيات
                    </Button>
                  </Link>
                  <Link href="/info" onClick={() => setMobileMenuOpen(false)}>
                    <Button 
                      variant={location === "/info" ? "default" : "ghost"} 
                      className="w-full justify-start"
                    >
                      <Info className="w-4 h-4 ml-2" />
                      معلومات
                    </Button>
                  </Link>
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="w-4 h-4 ml-2" />
                      الملف الشخصي
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hidden md:flex">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-semibold">{playerName || "ضيف"}</p>
                  <p className="text-xs text-muted-foreground">لاعب</p>
                </div>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem>
                    <User className="w-4 h-4 ml-2" />
                    الملف الشخصي
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      {showGameAlert && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 text-center">
          <p className="text-sm text-primary font-semibold flex items-center justify-center gap-2">
            <span className="text-destructive">!</span>
            أنت في لعبة نشطة! <button onClick={() => window.history.back()} className="underline hover:no-underline">ارجع للعبة</button>
          </p>
        </div>
      )}
    </>
  );
}

