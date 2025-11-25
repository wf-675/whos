import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface TimerProps {
  endsAt: number;
  onComplete?: () => void;
}

export function Timer({ endsAt, onComplete }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [initialTime, setInitialTime] = useState(0);

  useEffect(() => {
    const now = Date.now();
    const initial = Math.max(0, Math.floor((endsAt - now) / 1000));
    setInitialTime(initial > 0 ? initial : 120);
    setTimeLeft(initial);
  }, [endsAt]);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endsAt - now) / 1000));
      setTimeLeft(remaining);
      
      if (remaining === 0 && onComplete) {
        onComplete();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endsAt, onComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isPulsing = timeLeft <= 10 && timeLeft > 0;
  const progress = initialTime > 0 ? (timeLeft / initialTime) * 100 : 0;
  const circumference = 2 * Math.PI * 58; // radius = 58
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex items-center justify-center" data-testid="timer">
      <div className={`relative w-32 h-32 ${isPulsing ? 'animate-pulse' : ''}`}>
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="58"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-primary/20"
          />
          <circle
            cx="64"
            cy="64"
            r="58"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-primary transition-all duration-1000"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Clock className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
            <div className="text-3xl font-bold tabular-nums" data-testid="text-time">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
