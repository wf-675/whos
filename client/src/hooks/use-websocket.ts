import { useEffect, useRef, useState, useCallback } from 'react';
import type { WSMessage, WSResponse, Room } from '@shared/schema';

interface UseWebSocketResult {
  isConnected: boolean;
  room: Room | null;
  playerId: string | null;
  playerWord: string | null;
  sendMessage: (message: WSMessage) => void;
  reconnect: () => void;
}

export function useWebSocket(): UseWebSocketResult {
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(() => {
    return localStorage.getItem('playerId');
  });
  const [playerWord, setPlayerWord] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
      
      // Try to reconnect to previous session
      const storedPlayerId = localStorage.getItem('playerId');
      const storedRoomCode = localStorage.getItem('roomCode');
      if (storedPlayerId && storedRoomCode) {
        console.log('Attempting to reconnect with playerId:', storedPlayerId);
        ws.send(JSON.stringify({
          type: 'reconnect',
          data: {
            roomCode: storedRoomCode,
            playerId: storedPlayerId,
          }
        }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const response: WSResponse = JSON.parse(event.data);
        
        switch (response.type) {
          case 'room_created':
            setPlayerId(response.playerId);
            localStorage.setItem('playerId', response.playerId);
            localStorage.setItem('roomCode', response.roomCode);
            break;
          case 'room_joined':
            setPlayerId(response.playerId);
            // Store for reconnection
            if (response.roomCode) {
              localStorage.setItem('playerId', response.playerId);
              localStorage.setItem('roomCode', response.roomCode);
            }
            break;
          case 'room_state':
            // If room is null, clear everything (player left)
            if (!response.room || !response.room.code) {
              setRoom(null);
              setPlayerId(null);
              setPlayerWord(null);
              localStorage.removeItem('playerId');
              localStorage.removeItem('roomCode');
            } else {
              setRoom(response.room);
              setPlayerId(response.playerId);
              setPlayerWord(response.playerWord);
              // Update localStorage
              localStorage.setItem('roomCode', response.room.code);
            }
            break;
          case 'public_rooms':
            // Handle public rooms list (will be used in rooms page)
            break;
          case 'join_request_sent':
            // Handle join request sent confirmation
            break;
          case 'error':
            console.error('WebSocket error:', response.message);
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
      
      // Auto-reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('Attempting to reconnect...');
        connect();
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: WSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);

  // Expose WebSocket for external use
  useEffect(() => {
    (window as any).__ws__ = wsRef.current;
    return () => {
      delete (window as any).__ws__;
    };
  }, [isConnected]);

  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    connect();
  }, [connect]);

  return {
    isConnected,
    room,
    playerId,
    playerWord,
    sendMessage,
    reconnect,
  };
}
