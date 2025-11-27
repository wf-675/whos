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
        const isOddOneOut = room.oddOneOutId === client.playerId;
        const playerWord = isOddOneOut 
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

  const sendToDiscordWebhook = async (ip: string) => {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) return;

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🎮 لاعب جديد دخل: **${ip}**`,
          embeds: [{
            color: 0x00FF00,
            description: `IP: \`${ip}\`\nالوقت: <t:${Math.floor(Date.now() / 1000)}:f>`,
          }]
        })
      });
    } catch (error) {
      console.error('Failed to send Discord webhook:', error);
    }
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

  const startVotingPhase = (roomCode: string) => {
    const room = storage.getRoom(roomCode);
    if (!room) return;

    room.phase = 'voting';
    room.timerEndsAt = Date.now() + 60000; // 1 minute for voting

    broadcastRoomState(roomCode);

    // Start voting timer
    startPhaseTimer(roomCode, 60000, () => {
      const currentRoom = storage.getRoom(roomCode);
      if (!currentRoom) return;

      // Auto-vote for players who haven't voted (random selection)
      currentRoom.players.forEach(player => {
        if (!player.votedFor) {
          // Can vote for anyone, including themselves
          const randomIndex = Math.floor(Math.random() * currentRoom.players.length);
          player.votedFor = currentRoom.players[randomIndex].id;
        }
      });

      currentRoom.phase = 'reveal';
      currentRoom.timerEndsAt = undefined;
      broadcastRoomState(roomCode);
    });
  };

  wss.on('connection', (ws: WebSocket, req: any) => {
    const clientData: WSClient = {
      ws,
      playerId: null,
      roomCode: null,
    };

    clients.set(ws, clientData);
    
    // Get IP and send to Discord
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
               req.socket.remoteAddress || 
               'Unknown';
    sendToDiscordWebhook(ip);
    console.log('New WebSocket connection from IP:', ip);

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
            }
            break;
          }

          case 'start_voting': {
            if (!clientData.roomCode) break;

            const room = storage.moveToVotingPhase(clientData.roomCode);
            if (room && room.phase === 'voting') {
              const timer = roomTimers.get(clientData.roomCode);
              if (timer) {
                clearTimeout(timer);
                roomTimers.delete(clientData.roomCode);
              }
              startVotingPhase(clientData.roomCode);
            } else {
              broadcastRoomState(clientData.roomCode);
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
            }
            break;
          }

          case 'kick_player': {
            if (!clientData.roomCode || !clientData.playerId) break;

            const room = storage.getRoom(clientData.roomCode);
            // Only host can kick players, and only in lobby phase
            if (room && room.hostId === clientData.playerId && room.phase === 'lobby') {
              const updatedRoom = storage.kickPlayer(clientData.roomCode, message.data.targetPlayerId);
              if (updatedRoom) {
                broadcastRoomState(clientData.roomCode);
                // Disconnect the kicked player's WebSocket
                clients.forEach((client) => {
                  if (client.playerId === message.data.targetPlayerId && client.roomCode === clientData.roomCode) {
                    client.ws.close();
                  }
                });
              }
            }
            break;
          }

          case 'reconnect': {
            const room = storage.getRoom(message.data.roomCode);
            if (!room) {
              const errorResponse: WSResponse = {
                type: 'error',
                message: 'الغرفة غير موجودة',
              };
              ws.send(JSON.stringify(errorResponse));
              break;
            }

            const player = room.players.find(p => p.id === message.data.playerId);
            if (!player) {
              const errorResponse: WSResponse = {
                type: 'error',
                message: 'اللاعب غير موجود',
              };
              ws.send(JSON.stringify(errorResponse));
              break;
            }

            // Reconnect player
            const updatedRoom = storage.reconnectPlayer(message.data.roomCode, message.data.playerId);
            if (updatedRoom) {
              clientData.playerId = message.data.playerId;
              clientData.roomCode = message.data.roomCode;

              const response: WSResponse = {
                type: 'room_joined',
                playerId: message.data.playerId,
              };

              ws.send(JSON.stringify(response));
              broadcastRoomState(message.data.roomCode);
            }
            break;
          }

          case 'leave_room': {
            if (!clientData.roomCode || !clientData.playerId) break;

            const room = storage.getRoom(clientData.roomCode);
            if (room) {
              // Remove player from room
              room.players = room.players.filter(p => p.id !== clientData.playerId);

              // If room is empty, delete it
              if (room.players.length === 0) {
                storage.deleteRoom(clientData.roomCode);
              } else {
                // If host left, assign new host
                if (room.hostId === clientData.playerId) {
                  room.hostId = room.players[0].id;
                }

                // Notify remaining players
                broadcastRoomState(clientData.roomCode);
              }
            }

            // Clear client data and reset to home
            clientData.playerId = null;
            clientData.roomCode = null;
            localStorage.clear();
            
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
