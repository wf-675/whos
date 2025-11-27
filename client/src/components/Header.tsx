import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, Home } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";

export function Header() {
  const [playerName, setPlayerName] = useState("");
  const [location] = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem('playerName');
    if (saved) setPlayerName(saved);
  }, []);

  const initials = playerName.slice(0, 2).toUpperCase() || "??";

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                م
              </div>
              <h1 className="text-xl font-bold hidden sm:block">مين برا السالفة؟</h1>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {playerName && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <span>مرحباً،</span>
              <span className="font-semibold text-foreground">{playerName}</span>
            </div>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
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
              {location !== "/" && (
                <Link href="/">
                  <DropdownMenuItem>
                    <Home className="w-4 h-4 ml-2" />
                    الصفحة الرئيسية
                  </DropdownMenuItem>
                </Link>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

