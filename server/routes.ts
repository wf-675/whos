import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { randomUUID } from "crypto";
import type { WSMessage, WSResponse } from "@shared/schema";

interface WSClient {
  ws: WebSocket;
  playerId: string | null;
  roomCode: string | null;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const clients = new Map<WebSocket, WSClient>();

  // Timer management
  const roomTimers = new Map<string, NodeJS.Timeout>();

  const broadcastRoomState = (roomCode: string) => {
    const room = storage.getRoom(roomCode);
    if (!room) return;

    clients.forEach((client) => {
      if (client.roomCode === roomCode && client.ws.readyState === WebSocket.OPEN) {
        const player = room.players.find(p => p.id === client.playerId);
        const playerWord = player?.isOddOneOut 
          ? room.currentWord?.odd 
          : room.currentWord?.normal;

        const response: WSResponse = {
          type: 'room_state',
          room,
          playerId: client.playerId!,
          playerWord: room.phase === 'lobby' ? null : (playerWord || null),
        };

        client.ws.send(JSON.stringify(response));
      }
    });
  };

  const startPhaseTimer = (roomCode: string, duration: number, nextPhase: () => void) => {
    // Clear existing timer
    const existingTimer = roomTimers.get(roomCode);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      nextPhase();
      broadcastRoomState(roomCode);
      roomTimers.delete(roomCode);
    }, duration);

    roomTimers.set(roomCode, timer);
  };

  const moveToVotingPhase = (roomCode: string) => {
    const room = storage.getRoom(roomCode);
    if (!room || room.phase !== 'discussion') return;

    room.phase = 'voting';
    room.timerEndsAt = Date.now() + 60000; // 1 minute for voting

    // Start voting timer
    startPhaseTimer(roomCode, 60000, () => {
      const currentRoom = storage.getRoom(roomCode);
      if (!currentRoom) return;

      // Auto-vote for players who haven't voted
      currentRoom.players.forEach(player => {
        if (!player.votedFor) {
          // Don't vote for yourself
          const otherPlayers = currentRoom.players.filter(p => p.id !== player.id);
          if (otherPlayers.length > 0) {
            const randomTarget = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
            player.votedFor = randomTarget.id;
          }
        }
      });

      currentRoom.phase = 'reveal';
      currentRoom.timerEndsAt = undefined;
      broadcastRoomState(roomCode);
    });
  };

  wss.on('connection', (ws: WebSocket) => {
    const clientData: WSClient = {
      ws,
      playerId: null,
      roomCode: null,
    };

    clients.set(ws, clientData);
    console.log('New WebSocket connection');

    ws.on('message', (data: Buffer) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'create_room': {
            const playerId = randomUUID();
            const room = storage.createRoom(playerId, message.data.playerName);
            
            clientData.playerId = playerId;
            clientData.roomCode = room.code;

            const response: WSResponse = {
              type: 'room_created',
              roomCode: room.code,
              playerId,
            };

            ws.send(JSON.stringify(response));
            broadcastRoomState(room.code);
            break;
          }

          case 'join_room': {
            const room = storage.getRoom(message.data.roomCode);
            
            if (!room) {
              const errorResponse: WSResponse = {
                type: 'error',
                message: 'الغرفة غير موجودة',
              };
              ws.send(JSON.stringify(errorResponse));
              break;
            }

            if (room.phase !== 'lobby') {
              const errorResponse: WSResponse = {
                type: 'error',
                message: 'اللعبة قد بدأت بالفعل',
              };
              ws.send(JSON.stringify(errorResponse));
              break;
            }

            const playerId = randomUUID();
            const updatedRoom = storage.addPlayerToRoom(message.data.roomCode, playerId, message.data.playerName);
            
            if (updatedRoom) {
              clientData.playerId = playerId;
              clientData.roomCode = message.data.roomCode;

              const response: WSResponse = {
                type: 'room_joined',
                playerId,
              };

              ws.send(JSON.stringify(response));
              broadcastRoomState(message.data.roomCode);
            }
            break;
          }

          case 'start_game': {
            if (!clientData.roomCode) break;

            const room = storage.startGame(clientData.roomCode);
            
            if (room) {
              broadcastRoomState(clientData.roomCode);
              
              // Start discussion timer (2 minutes)
              startPhaseTimer(clientData.roomCode, 120000, () => {
                moveToVotingPhase(clientData.roomCode!);
                broadcastRoomState(clientData.roomCode!);
              });
            }
            break;
          }

          case 'send_message': {
            if (!clientData.roomCode || !clientData.playerId) break;

            const room = storage.getRoom(clientData.roomCode);
            const player = room?.players.find(p => p.id === clientData.playerId);
            
            if (room && player) {
              storage.addMessage(clientData.roomCode, clientData.playerId, player.name, message.data.text);
              broadcastRoomState(clientData.roomCode);
            }
            break;
          }

          case 'vote': {
            if (!clientData.roomCode || !clientData.playerId) break;

            // Prevent voting for yourself
            if (message.data.targetPlayerId === clientData.playerId) {
              const errorResponse: WSResponse = {
                type: 'error',
                message: 'لا يمكنك التصويت لنفسك',
              };
              ws.send(JSON.stringify(errorResponse));
              break;
            }

            const result = storage.submitVote(clientData.roomCode, clientData.playerId, message.data.targetPlayerId);
            
            if (result) {
              broadcastRoomState(clientData.roomCode);
              
              // If all voted early, clear the voting timer
              if (result.allVoted) {
                const timer = roomTimers.get(clientData.roomCode);
                if (timer) {
                  clearTimeout(timer);
                  roomTimers.delete(clientData.roomCode);
                }
              }
            }
            break;
          }

          case 'next_round': {
            if (!clientData.roomCode) break;

            const room = storage.startNextRound(clientData.roomCode);
            
            if (room) {
              broadcastRoomState(clientData.roomCode);
              
              // Start discussion timer
              startPhaseTimer(clientData.roomCode, 120000, () => {
                moveToVotingPhase(clientData.roomCode!);
                broadcastRoomState(clientData.roomCode!);
              });
            }
            break;
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        const errorResponse: WSResponse = {
          type: 'error',
          message: 'حدث خطأ في معالجة الطلب',
        };
        ws.send(JSON.stringify(errorResponse));
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      
      // Mark player as disconnected
      if (clientData.roomCode && clientData.playerId) {
        storage.updatePlayerConnection(clientData.roomCode, clientData.playerId, false);
        broadcastRoomState(clientData.roomCode);
      }
      
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return httpServer;
}
