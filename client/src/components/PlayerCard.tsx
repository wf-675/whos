import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Crown, WifiOff } from "lucide-react";
import type { Player } from "@shared/schema";

interface PlayerCardProps {
  player: Player;
  isSelected?: boolean;
  onClick?: () => void;
  showVote?: boolean;
  votedFor?: string;
  playerRole?: 'odd' | 'normal';
  voteCount?: number;
  showPoints?: boolean;
}

export function PlayerCard({ player, isSelected, onClick, showVote, votedFor, playerRole, voteCount, showPoints = true }: PlayerCardProps) {
  const initials = player.name.slice(0, 2).toUpperCase();
  
  return (
    <Card
      className={`
        p-4 relative hover-elevate cursor-pointer transition-all
        ${isSelected ? 'ring-2 ring-primary' : ''}
        ${!player.isConnected ? 'opacity-50' : ''}
        h-full flex flex-col
      `}
      onClick={onClick}
      data-testid={`card-player-${player.id}`}
    >
      {player.isHost && (
        <div className="absolute top-2 left-2 z-10">
          <Crown className="w-5 h-5 text-primary fill-primary" data-testid="icon-host" />
        </div>
      )}

      {voteCount !== undefined && voteCount > 0 && (
        <div className="absolute top-2 right-2 z-10 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
          {voteCount}
        </div>
      )}
      
      <div className="flex flex-col items-center gap-3 flex-1">
        <div className="relative">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          {!player.isConnected && (
            <div className="absolute -bottom-1 -right-1 bg-destructive rounded-full p-1">
              <WifiOff className="w-3 h-3 text-destructive-foreground" />
            </div>
          )}
        </div>
        
        <div className="text-center w-full flex-1 flex flex-col justify-center">
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
          
          {showPoints && player.points !== undefined && player.points > 0 && (
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
