/**
 * backend/src/tests/integration/websocket.test.ts
 * Comprehensive WebSocket integration tests for real-time features
 */
import { Server } from 'socket.io';
import { createServer } from 'http';
import { AddressInfo } from 'net';
import Client from 'socket.io-client';
import jwt from 'jsonwebtoken';
import { setupTests } from '../../setupTests';

describe('WebSocket Integration Tests', () => {
  let server: any;
  let io: Server;
  let clientSocket: any;
  let serverSocket: any;
  let httpServer: any;
  let port: number;

  // Mock JWT for testing
  const mockJWT = jwt.sign(
    { 
      email: 'test@example.com',
      sub: 'test-user-id',
      preferred_username: 'test@example.com'
    },
    'test-secret'
  );

  beforeAll(async () => {
    await setupTests();
    
    // Create HTTP server for WebSocket
    httpServer = createServer();
    
    // Initialize Socket.IO server
    io = new Server(httpServer, {
      cors: {
        origin: ["http://localhost:3000", "http://localhost:3001"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // Set up WebSocket authentication middleware
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication token required'));
      }
      
      try {
        const decoded = jwt.verify(token, 'test-secret');
        socket.data.user = decoded;
        next();
      } catch (err) {
        next(new Error('Invalid authentication token'));
      }
    });

    // Set up connection handler
    io.on('connection', (socket) => {
      serverSocket = socket;
      
      // User presence events
      socket.on('user:join', (data) => {
        socket.join(`user:${socket.data.user.sub}`);
        socket.broadcast.emit('user:online', {
          userId: socket.data.user.sub,
          email: socket.data.user.email,
          timestamp: new Date().toISOString()
        });
      });

      socket.on('user:leave', () => {
        socket.broadcast.emit('user:offline', {
          userId: socket.data.user.sub,
          timestamp: new Date().toISOString()
        });
      });

      // Task events
      socket.on('task:create', (taskData) => {
        socket.broadcast.emit('task:created', {
          ...taskData,
          userId: socket.data.user.sub,
          timestamp: new Date().toISOString()
        });
      });

      socket.on('task:update', (taskData) => {
        socket.broadcast.emit('task:updated', {
          ...taskData,
          userId: socket.data.user.sub,
          timestamp: new Date().toISOString()
        });
      });

      socket.on('task:complete', (taskData) => {
        socket.broadcast.emit('task:completed', {
          ...taskData,
          userId: socket.data.user.sub,
          timestamp: new Date().toISOString()
        });
      });

      // Notification events
      socket.on('notification:send', (notificationData) => {
        const targetUserId = notificationData.targetUserId;
        socket.to(`user:${targetUserId}`).emit('notification:received', {
          ...notificationData,
          senderId: socket.data.user.sub,
          timestamp: new Date().toISOString()
        });
      });

      // Typing indicators
      socket.on('typing:start', (data) => {
        socket.broadcast.emit('user:typing', {
          userId: socket.data.user.sub,
          email: socket.data.user.email,
          context: data.context,
          timestamp: new Date().toISOString()
        });
      });

      socket.on('typing:stop', (data) => {
        socket.broadcast.emit('user:stopped_typing', {
          userId: socket.data.user.sub,
          context: data.context,
          timestamp: new Date().toISOString()
        });
      });

      // Room management
      socket.on('room:join', (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user:joined_room', {
          userId: socket.data.user.sub,
          email: socket.data.user.email,
          roomId,
          timestamp: new Date().toISOString()
        });
      });

      socket.on('room:leave', (roomId) => {
        socket.leave(roomId);
        socket.to(roomId).emit('user:left_room', {
          userId: socket.data.user.sub,
          roomId,
          timestamp: new Date().toISOString()
        });
      });

      // System events
      socket.on('system:announcement', (data) => {
        if (socket.data.user.role === 'admin') {
          io.emit('system:announcement', {
            ...data,
            adminId: socket.data.user.sub,
            timestamp: new Date().toISOString()
          });
        }
      });
    });

    // Start server
    await new Promise<void>((resolve) => {
      httpServer.listen(() => {
        port = (httpServer.address() as AddressInfo).port;
        resolve();
      });
    });
  });

  beforeEach(async () => {
    // Create client connection for each test
    clientSocket = Client(`http://localhost:${port}`, {
      auth: {
        token: mockJWT
      },
      transports: ['websocket']
    });

    await new Promise<void>((resolve) => {
      clientSocket.on('connect', resolve);
    });
  });

  afterEach(() => {
    if (clientSocket) {
      clientSocket.disconnect();
    }
  });

  afterAll(async () => {
    if (io) {
      io.close();
    }
    if (httpServer) {
      httpServer.close();
    }
  });

  describe('Connection and Authentication', () => {
    test('should connect with valid JWT token', (done) => {
      expect(clientSocket.connected).toBe(true);
      done();
    });

    test('should reject connection without token', (done) => {
      const unauthorizedClient = Client(`http://localhost:${port}`, {
        transports: ['websocket']
      });

      unauthorizedClient.on('connect_error', (error) => {
        expect(error.message).toContain('Authentication token required');
        unauthorizedClient.disconnect();
        done();
      });
    });

    test('should reject connection with invalid token', (done) => {
      const invalidClient = Client(`http://localhost:${port}`, {
        auth: {
          token: 'invalid-token'
        },
        transports: ['websocket']
      });

      invalidClient.on('connect_error', (error) => {
        expect(error.message).toContain('Invalid authentication token');
        invalidClient.disconnect();
        done();
      });
    });
  });

  describe('User Presence Events', () => {
    test('should broadcast user online event when joining', (done) => {
      const secondClient = Client(`http://localhost:${port}`, {
        auth: { token: mockJWT },
        transports: ['websocket']
      });

      secondClient.on('connect', () => {
        clientSocket.on('user:online', (data) => {
          expect(data).toHaveProperty('userId');
          expect(data).toHaveProperty('email');
          expect(data).toHaveProperty('timestamp');
          secondClient.disconnect();
          done();
        });

        secondClient.emit('user:join', { status: 'online' });
      });
    });

    test('should broadcast user offline event when leaving', (done) => {
      const secondClient = Client(`http://localhost:${port}`, {
        auth: { token: mockJWT },
        transports: ['websocket']
      });

      secondClient.on('connect', () => {
        clientSocket.on('user:offline', (data) => {
          expect(data).toHaveProperty('userId');
          expect(data).toHaveProperty('timestamp');
          done();
        });

        secondClient.emit('user:leave');
        secondClient.disconnect();
      });
    });
  });

  describe('Task Events', () => {
    test('should broadcast task creation event', (done) => {
      const taskData = {
        id: 'test-task-1',
        title: 'Test Task',
        description: 'Test task description',
        priority: 'medium',
        category: 'work'
      };

      const secondClient = Client(`http://localhost:${port}`, {
        auth: { token: mockJWT },
        transports: ['websocket']
      });

      secondClient.on('connect', () => {
        secondClient.on('task:created', (data) => {
          expect(data.title).toBe(taskData.title);
          expect(data).toHaveProperty('userId');
          expect(data).toHaveProperty('timestamp');
          secondClient.disconnect();
          done();
        });

        clientSocket.emit('task:create', taskData);
      });
    });

    test('should broadcast task update event', (done) => {
      const updateData = {
        id: 'test-task-1',
        title: 'Updated Task Title',
        status: 'in-progress'
      };

      const secondClient = Client(`http://localhost:${port}`, {
        auth: { token: mockJWT },
        transports: ['websocket']
      });

      secondClient.on('connect', () => {
        secondClient.on('task:updated', (data) => {
          expect(data.title).toBe(updateData.title);
          expect(data.status).toBe(updateData.status);
          expect(data).toHaveProperty('timestamp');
          secondClient.disconnect();
          done();
        });

        clientSocket.emit('task:update', updateData);
      });
    });

    test('should broadcast task completion event', (done) => {
      const completeData = {
        id: 'test-task-1',
        title: 'Completed Task',
        status: 'completed',
        completedAt: new Date().toISOString()
      };

      const secondClient = Client(`http://localhost:${port}`, {
        auth: { token: mockJWT },
        transports: ['websocket']
      });

      secondClient.on('connect', () => {
        secondClient.on('task:completed', (data) => {
          expect(data.status).toBe('completed');
          expect(data).toHaveProperty('completedAt');
          expect(data).toHaveProperty('timestamp');
          secondClient.disconnect();
          done();
        });

        clientSocket.emit('task:complete', completeData);
      });
    });
  });

  describe('Notification System', () => {
    test('should send targeted notifications', (done) => {
      const targetUserId = 'target-user-123';
      const notificationData = {
        targetUserId,
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'info'
      };

      // Create client for target user
      const targetJWT = jwt.sign(
        { 
          email: 'target@example.com',
          sub: targetUserId,
          preferred_username: 'target@example.com'
        },
        'test-secret'
      );

      const targetClient = Client(`http://localhost:${port}`, {
        auth: { token: targetJWT },
        transports: ['websocket']
      });

      targetClient.on('connect', () => {
        targetClient.emit('user:join', { status: 'online' });
        
        targetClient.on('notification:received', (data) => {
          expect(data.title).toBe(notificationData.title);
          expect(data.message).toBe(notificationData.message);
          expect(data).toHaveProperty('senderId');
          expect(data).toHaveProperty('timestamp');
          targetClient.disconnect();
          done();
        });

        // Send notification from first client
        setTimeout(() => {
          clientSocket.emit('notification:send', notificationData);
        }, 100);
      });
    });
  });

  describe('Typing Indicators', () => {
    test('should broadcast typing start event', (done) => {
      const typingData = { context: 'task-comments' };

      const secondClient = Client(`http://localhost:${port}`, {
        auth: { token: mockJWT },
        transports: ['websocket']
      });

      secondClient.on('connect', () => {
        secondClient.on('user:typing', (data) => {
          expect(data.context).toBe(typingData.context);
          expect(data).toHaveProperty('userId');
          expect(data).toHaveProperty('email');
          secondClient.disconnect();
          done();
        });

        clientSocket.emit('typing:start', typingData);
      });
    });

    test('should broadcast typing stop event', (done) => {
      const typingData = { context: 'task-comments' };

      const secondClient = Client(`http://localhost:${port}`, {
        auth: { token: mockJWT },
        transports: ['websocket']
      });

      secondClient.on('connect', () => {
        secondClient.on('user:stopped_typing', (data) => {
          expect(data.context).toBe(typingData.context);
          expect(data).toHaveProperty('userId');
          secondClient.disconnect();
          done();
        });

        clientSocket.emit('typing:stop', typingData);
      });
    });
  });

  describe('Room Management', () => {
    test('should handle room joining', (done) => {
      const roomId = 'test-room-123';

      const secondClient = Client(`http://localhost:${port}`, {
        auth: { token: mockJWT },
        transports: ['websocket']
      });

      secondClient.on('connect', () => {
        secondClient.on('user:joined_room', (data) => {
          expect(data.roomId).toBe(roomId);
          expect(data).toHaveProperty('userId');
          expect(data).toHaveProperty('email');
          secondClient.disconnect();
          done();
        });

        // First client joins room
        clientSocket.emit('room:join', roomId);
        
        // Second client joins same room
        setTimeout(() => {
          secondClient.emit('room:join', roomId);
        }, 100);
      });
    });

    test('should handle room leaving', (done) => {
      const roomId = 'test-room-456';

      const secondClient = Client(`http://localhost:${port}`, {
        auth: { token: mockJWT },
        transports: ['websocket']
      });

      secondClient.on('connect', () => {
        // Both clients join room first
        clientSocket.emit('room:join', roomId);
        secondClient.emit('room:join', roomId);

        secondClient.on('user:left_room', (data) => {
          expect(data.roomId).toBe(roomId);
          expect(data).toHaveProperty('userId');
          secondClient.disconnect();
          done();
        });

        // First client leaves room
        setTimeout(() => {
          clientSocket.emit('room:leave', roomId);
        }, 100);
      });
    });
  });

  describe('Performance Tests', () => {
    test('should handle multiple concurrent connections', async () => {
      const numClients = 10;
      const clients: any[] = [];
      const connectedClients: any[] = [];

      try {
        // Create multiple clients
        for (let i = 0; i < numClients; i++) {
          const client = Client(`http://localhost:${port}`, {
            auth: { token: mockJWT },
            transports: ['websocket']
          });
          clients.push(client);
        }

        // Wait for all connections
        await Promise.all(
          clients.map(client => 
            new Promise<void>((resolve) => {
              client.on('connect', () => {
                connectedClients.push(client);
                resolve();
              });
            })
          )
        );

        expect(connectedClients.length).toBe(numClients);

        // Test concurrent messaging
        const messagePromises = connectedClients.map((client, index) => 
          new Promise<void>((resolve) => {
            const receivedMessages: any[] = [];
            
            client.on('task:created', (data: any) => {
              receivedMessages.push(data);
              if (receivedMessages.length === numClients - 1) {
                resolve();
              }
            });

            // Each client sends a message
            client.emit('task:create', {
              id: `task-${index}`,
              title: `Task from client ${index}`,
              priority: 'medium'
            });
          })
        );

        await Promise.all(messagePromises);

      } finally {
        // Cleanup all clients
        clients.forEach(client => client.disconnect());
      }
    });

    test('should maintain low latency for real-time events', (done) => {
      const startTime = Date.now();
      
      const secondClient = Client(`http://localhost:${port}`, {
        auth: { token: mockJWT },
        transports: ['websocket']
      });

      secondClient.on('connect', () => {
        secondClient.on('task:created', () => {
          const latency = Date.now() - startTime;
          expect(latency).toBeLessThan(100); // Should be under 100ms
          secondClient.disconnect();
          done();
        });

        clientSocket.emit('task:create', {
          id: 'latency-test-task',
          title: 'Latency Test Task'
        });
      });
    });
  });
}); 