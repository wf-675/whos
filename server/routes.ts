import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { randomUUID } from "crypto";
import type { WSMessage, WSResponse } from "@shared/schema";
import { getDb, schema } from "./db";
import { eq } from "drizzle-orm";

interface WSClient {
  ws: WebSocket;
  playerId: string | null;
  roomCode: string | null;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const db = getDb();

  // Auth API routes - بدون database للبساطة
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, displayName } = req.body;
      
      if (!username || !displayName) {
        return res.status(400).json({ message: 'Username and display name required' });
      }

      // Create guest user (no database needed)
      const guestUser = {
        id: randomUUID(),
        username,
        displayName,
        gamesPlayed: 0,
        gamesWon: 0,
        totalPoints: 0,
      };
      
      res.json(guestUser);
    } catch (error) {
      console.error('Auth error:', error);
      res.status(500).json({ message: 'Authentication failed' });
    }
  });

  // Get leaderboard - بسيط بدون database
  app.get('/api/leaderboard', async (req, res) => {
    res.json([]);
  });

  // User stats - بسيط بدون database
  app.post('/api/user/stats', async (req, res) => {
    res.json({ success: true });
  });

  const clients = new Map<WebSocket, WSClient>();

  // Timer management
  const roomTimers = new Map<string, NodeJS.Timeout>();

  const broadcastRoomState = (roomCode: string) => {
    const room = storage.getRoom(roomCode);
    if (!room) return;

    clients.forEach((client) => {
      if (client.roomCode === roomCode && client.ws.readyState === WebSocket.OPEN) {
        const isOddOneOut = room.oddOneOutId === client.playerId;
        // Check if odd one out should know their role
        const shouldReveal = room.settings?.allowOddOneOutReveal || false;
        let playerWord: string | null = null;
        
        if (room.phase !== 'lobby' && room.currentWord) {
          if (isOddOneOut) {
            // Odd one out always gets the odd word (different word), but only knows their role if reveal is enabled
            playerWord = room.currentWord.odd;
          } else {
            // Normal players always see normal word
            playerWord = room.currentWord.normal;
          }
        }

        const response: WSResponse = {
          type: 'room_state',
          room,
          playerId: client.playerId!,
          playerWord: playerWord || null,
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
            const isPublic = message.data.isPublic || false;
            const roomName = message.data.roomName;
            const room = storage.createRoom(playerId, message.data.playerName, isPublic, roomName);
            
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

          case 'request_join_room': {
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
            const updatedRoom = storage.requestJoinRoom(message.data.roomCode, playerId, message.data.playerName);
            
            if (updatedRoom) {
              if (room.isPublic) {
                // Public room - join directly
                clientData.playerId = playerId;
                clientData.roomCode = message.data.roomCode;

                const response: WSResponse = {
                  type: 'room_joined',
                  playerId,
                };

                ws.send(JSON.stringify(response));
                broadcastRoomState(message.data.roomCode);
              } else {
                // Private room - send request
                const response: WSResponse = {
                  type: 'join_request_sent',
                };
                ws.send(JSON.stringify(response));
                // Notify host
                broadcastRoomState(message.data.roomCode);
              }
            }
            break;
          }

          case 'approve_join_request': {
            if (!clientData.roomCode || !clientData.playerId) break;

            const room = storage.getRoom(clientData.roomCode);
            if (room && room.hostId === clientData.playerId) {
              const updatedRoom = storage.approveJoinRequest(
                clientData.roomCode,
                clientData.playerId,
                message.data.targetPlayerId,
                message.data.playerName
              );
              if (updatedRoom) {
                broadcastRoomState(clientData.roomCode);
              }
            }
            break;
          }

          case 'reject_join_request': {
            if (!clientData.roomCode || !clientData.playerId) break;

            const room = storage.getRoom(clientData.roomCode);
            if (room && room.hostId === clientData.playerId) {
              const updatedRoom = storage.rejectJoinRequest(
                clientData.roomCode,
                clientData.playerId,
                message.data.targetPlayerId
              );
              if (updatedRoom) {
                broadcastRoomState(clientData.roomCode);
              }
            }
            break;
          }

          case 'get_public_rooms': {
            const publicRooms = storage.getAllPublicRooms();
            const response: WSResponse = {
              type: 'public_rooms',
              rooms: publicRooms,
            };
            ws.send(JSON.stringify(response));
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
            if (!clientData.roomCode || !clientData.playerId) break;

            const room = storage.moveToVotingPhase(clientData.roomCode, clientData.playerId);
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
            // Host can kick players at any time
            if (room && room.hostId === clientData.playerId) {
              const wasInGame = room.phase !== 'lobby';
              const updatedRoom = storage.kickPlayer(clientData.roomCode, message.data.targetPlayerId);
              if (updatedRoom) {
                // If kicked during game, return to lobby
                if (wasInGame && updatedRoom.phase === 'lobby') {
                  // Clear game state
                  updatedRoom.currentWord = undefined;
                  updatedRoom.oddOneOutId = undefined;
                  updatedRoom.timerEndsAt = undefined;
                  updatedRoom.messages = [];
                  updatedRoom.votesReadyCount = 0;
                  updatedRoom.players.forEach(p => {
                    p.votedFor = undefined;
                  });
                }
                
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

          case 'end_game': {
            if (!clientData.roomCode || !clientData.playerId) break;

            const room = storage.getRoom(clientData.roomCode);
            // Only host can end game
            if (room && room.hostId === clientData.playerId && room.phase !== 'lobby') {
              room.phase = 'lobby';
              room.currentWord = undefined;
              room.oddOneOutId = undefined;
              room.timerEndsAt = undefined;
              room.messages = [];
              room.votesReadyCount = 0;
              room.players.forEach(p => {
                p.votedFor = undefined;
              });
              broadcastRoomState(clientData.roomCode);
            }
            break;
          }

          case 'return_to_lobby': {
            if (!clientData.roomCode || !clientData.playerId) break;

            const room = storage.getRoom(clientData.roomCode);
            // Only host can return to lobby
            if (room && room.hostId === clientData.playerId && room.phase !== 'lobby') {
              room.phase = 'lobby';
              room.currentWord = undefined;
              room.oddOneOutId = undefined;
              room.timerEndsAt = undefined;
              room.messages = [];
              room.votesReadyCount = 0;
              room.players.forEach(p => {
                p.votedFor = undefined;
              });
              broadcastRoomState(clientData.roomCode);
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

          case 'update_settings': {
            if (!clientData.roomCode || !clientData.playerId) break;
            const room = storage.getRoom(clientData.roomCode);
            const currentPlayer = room?.players.find(p => p.id === clientData.playerId);

            if (room && currentPlayer?.isHost && room.phase === 'lobby') {
              storage.updateSettings(clientData.roomCode, message.data);
              broadcastRoomState(clientData.roomCode);
            }
            break;
          }

          case 'leave_room': {
            if (!clientData.roomCode || !clientData.playerId) break;

            const room = storage.getRoom(clientData.roomCode);
            if (room) {
              const wasHost = room.hostId === clientData.playerId;
              const wasInGame = room.phase !== 'lobby';
              
              // Remove player from room
              room.players = room.players.filter(p => p.id !== clientData.playerId);

              // If room is empty, delete it
              if (room.players.length === 0) {
                storage.deleteRoom(clientData.roomCode);
              } else {
                // If host left, assign new host
                if (wasHost) {
                  room.hostId = room.players[0].id;
                  room.players[0].isHost = true;
                }

                // If someone left during game, return to lobby
                if (wasInGame && room.phase !== 'lobby') {
                  room.phase = 'lobby';
                  room.currentWord = undefined;
                  room.oddOneOutId = undefined;
                  room.timerEndsAt = undefined;
                  room.messages = [];
                  room.votesReadyCount = 0;
                  room.players.forEach(p => {
                    p.votedFor = undefined;
                  });
                }

                // Notify remaining players
                broadcastRoomState(clientData.roomCode);
              }
            }

            // Clear client data
            clientData.playerId = null;
            clientData.roomCode = null;
            
            // Send confirmation to client that they left
            const leaveResponse: WSResponse = {
              type: 'room_state',
              room: null as any,
              playerId: '',
              playerWord: null,
            };
            ws.send(JSON.stringify(leaveResponse));
            
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
