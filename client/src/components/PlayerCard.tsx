import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Crown, WifiOff, Check } from "lucide-react";
import type { Player } from "@shared/schema";

interface PlayerCardProps {
  player: Player;
  isSelected?: boolean;
  onClick?: () => void;
  showVote?: boolean;
  votedFor?: string;
  playerRole?: 'odd' | 'normal';
}

export function PlayerCard({ player, isSelected, onClick, showVote, votedFor, playerRole }: PlayerCardProps) {
  const initials = player.name.slice(0, 2).toUpperCase();
  
  return (
    <Card
      className={`
        p-4 relative cursor-pointer transition-all duration-300 overflow-hidden
        ${isSelected ? 'ring-4 ring-primary shadow-2xl scale-110 bg-primary/5' : 'hover:scale-105 hover:shadow-lg'}
        ${!player.isConnected ? 'opacity-50' : ''}
        ${onClick ? 'hover:border-primary' : ''}
      `}
      onClick={onClick}
      data-testid={`card-player-${player.id}`}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 animate-bounce z-10">
          <Check className="w-4 h-4" />
        </div>
      )}
      
      {player.isHost && (
        <div className="absolute top-2 left-2 z-10">
          <Crown className="w-5 h-5 text-primary fill-primary animate-pulse" data-testid="icon-host" />
        </div>
      )}
      
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <Avatar className={`
            w-16 h-16 transition-all duration-300
            ${isSelected ? 'ring-4 ring-white shadow-xl' : ''}
          `}>
            <AvatarFallback className={`
              text-lg font-bold transition-colors
              ${isSelected ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}
            `}>
              {initials}
            </AvatarFallback>
          </Avatar>
          
          {!player.isConnected && (
            <div className="absolute -bottom-1 -right-1 bg-destructive rounded-full p-1">
              <WifiOff className="w-3 h-3 text-destructive-foreground" />
            </div>
          )}
        </div>
        
        <div className="text-center w-full">
          <p className="font-medium text-sm truncate" data-testid={`text-name-${player.id}`}>
            {player.name}
          </p>
          
          {playerRole && (
            <Badge 
              variant={playerRole === 'odd' ? 'destructive' : 'secondary'} 
              className="mt-2 text-xs"
              data-testid={`badge-role-${player.id}`}
            >
              {playerRole === 'odd' ? 'برا السالفة' : 'بالسالفة'}
            </Badge>
          )}
          
          {player.points !== undefined && player.points > 0 && (
            <Badge variant="default" className="mt-2 text-xs" data-testid={`badge-points-${player.id}`}>
              {player.points} نقطة
            </Badge>
          )}
          
          {showVote && votedFor && (
            <Badge variant="secondary" className="mt-2 text-xs">
              صوّت لـ: {votedFor}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
