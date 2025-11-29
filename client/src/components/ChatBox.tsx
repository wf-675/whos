import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import type { Message } from "@shared/schema";

interface ChatBoxProps {
  messages: Message[];
  currentPlayerId?: string;
  playerId?: string;
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export function ChatBox({ messages, currentPlayerId, playerId, onSendMessage, disabled = false }: ChatBoxProps) {
  const actualPlayerId = playerId || currentPlayerId || '';
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText("");
    }
  };

  return (
    <div className="flex flex-col h-96 bg-card border border-card-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-card-border bg-card">
        <h3 className="font-semibold">المحادثة</h3>
      </div>
      
      <ScrollArea className="flex-1 p-4" data-testid="scroll-messages">
        <div ref={scrollRef} className="space-y-3">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm">
              لا توجد رسائل بعد
            </p>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.playerId === actualPlayerId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  data-testid={`message-${msg.id}`}
                >
                  <div
                    className={`
                      max-w-[80%] rounded-2xl p-3
                      ${isOwn 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                      }
                    `}
                  >
                    {!isOwn && (
                      <p className="text-xs font-medium mb-1 opacity-80">
                        {msg.playerName}
                      </p>
                    )}
                    <p className="text-sm break-words">{msg.text}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
      
      <form onSubmit={handleSubmit} className="p-4 border-t border-card-border bg-card">
        <div className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={disabled ? "أنت ميت، لا يمكنك الكتابة" : "اكتب رسالتك..."}
            maxLength={500}
            className="flex-1"
            data-testid="input-message"
            disabled={disabled}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!inputText.trim() || disabled}
            data-testid="button-send"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
