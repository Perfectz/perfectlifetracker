/**
 * backend/src/services/WebSocketService.ts
 * WebSocket service for real-time features and live updates
 */
import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';

// WebSocket event types
export interface WebSocketEvents {
  // User events
  'user:online': { userId: string; userName?: string; timestamp: Date };
  'user:offline': { userId: string; timestamp: Date };
  'user:status-changed': { userId: string; status: string; timestamp: Date };
  
  // Task events
  'task:created': { taskId: string; userId: string; task: any };
  'task:updated': { taskId: string; userId: string; updates: any };
  'task:completed': { taskId: string; userId: string; completedAt: Date };
  'task:deleted': { taskId: string; userId: string };
  
  // Notification events
  'notification:new': { notificationId: string; userId: string; type: string; message: string };
  'notification:read': { notificationId: string; userId: string; readAt?: Date };
  
  // System events
  'system:maintenance': { message: string; scheduledTime?: Date };
  'system:announcement': { message: string; priority: 'low' | 'medium' | 'high' };
  
  // Collaboration events
  'collaboration:join': { roomId: string; userId: string; userName: string };
  'collaboration:leave': { roomId: string; userId: string };
  'collaboration:typing': { roomId: string; userId: string; isTyping: boolean };
}

// Connected user information
interface ConnectedUser {
  userId: string;
  socketId: string;
  userName: string;
  connectedAt: Date;
  lastActivity: Date;
  rooms: Set<string>;
}

export class WebSocketService {
  private static instance: WebSocketService;
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<string, ConnectedUser> = new Map();
  private userSockets: Map<string, Set<string>> = new Map();

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  /**
   * Initialize WebSocket server
   */
  initialize(server: Server): void {
    try {
      this.io = new SocketIOServer(server, {
        cors: {
          origin: [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3002',
            process.env.FRONTEND_URL || ''
          ].filter(url => url && url.length > 0),
          methods: ['GET', 'POST'],
          credentials: true
        },
        transports: ['websocket', 'polling']
      });

      this.setupMiddleware();
      this.setupEventHandlers();
      
      logger.info('WebSocket server initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize WebSocket server', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Setup authentication middleware
   */
  private setupMiddleware(): void {
    if (!this.io) return;

    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Verify JWT token (simplified for mock)
        const decoded = jwt.decode(token) as any;
        if (!decoded || !decoded.userId) {
          return next(new Error('Invalid authentication token'));
        }

        // Attach user info to socket
        socket.data.userId = decoded.userId;
        socket.data.userName = decoded.userName || 'Unknown User';
        
        next();
      } catch (error) {
        logger.error('WebSocket authentication failed', {
          error: error instanceof Error ? error.message : String(error),
          socketId: socket.id
        });
        next(new Error('Authentication failed'));
      }
    });
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      const userId = socket.data.userId;
      const userName = socket.data.userName;

      logger.info('User connected via WebSocket', {
        userId,
        userName,
        socketId: socket.id
      });

      // Register connected user
      this.registerUser(socket.id, userId, userName);

      // Handle user events
      this.setupUserEvents(socket);
      
      // Handle task events
      this.setupTaskEvents(socket);
      
      // Handle notification events
      this.setupNotificationEvents(socket);
      
      // Handle collaboration events
      this.setupCollaborationEvents(socket);

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        this.handleUserDisconnect(socket.id, userId, reason);
      });

      // Send welcome message
      socket.emit('system:connected', {
        message: 'Connected to Perfect LifeTracker Pro',
        timestamp: new Date(),
        connectedUsers: this.getConnectedUsersCount()
      });
    });
  }

  /**
   * Setup user-related events
   */
  private setupUserEvents(socket: any): void {
    const userId = socket.data.userId;

    socket.on('user:activity', () => {
      this.updateUserActivity(userId);
    });

    socket.on('user:status', (status: 'online' | 'away' | 'busy') => {
      this.broadcastUserStatus(userId, status);
    });
  }

  /**
   * Setup task-related events
   */
  private setupTaskEvents(socket: any): void {
    const userId = socket.data.userId;

    socket.on('task:subscribe', (taskId: string) => {
      socket.join(`task:${taskId}`);
      logger.debug('User subscribed to task updates', { userId, taskId });
    });

    socket.on('task:unsubscribe', (taskId: string) => {
      socket.leave(`task:${taskId}`);
      logger.debug('User unsubscribed from task updates', { userId, taskId });
    });
  }

  /**
   * Setup notification events
   */
  private setupNotificationEvents(socket: any): void {
    const userId = socket.data.userId;

    socket.on('notifications:subscribe', () => {
      socket.join(`notifications:${userId}`);
      logger.debug('User subscribed to notifications', { userId });
    });

    socket.on('notification:mark-read', (notificationId: string) => {
      this.emitToUser(userId, 'notification:read', {
        notificationId,
        userId,
        readAt: new Date()
      });
    });
  }

  /**
   * Setup collaboration events
   */
  private setupCollaborationEvents(socket: any): void {
    const userId = socket.data.userId;
    const userName = socket.data.userName;

    socket.on('collaboration:join-room', (roomId: string) => {
      socket.join(roomId);
      
      const user = this.connectedUsers.get(socket.id);
      if (user) {
        user.rooms.add(roomId);
      }

      socket.to(roomId).emit('collaboration:user-joined', {
        roomId,
        userId,
        userName,
        timestamp: new Date()
      });

      logger.debug('User joined collaboration room', { userId, roomId });
    });

    socket.on('collaboration:leave-room', (roomId: string) => {
      socket.leave(roomId);
      
      const user = this.connectedUsers.get(socket.id);
      if (user) {
        user.rooms.delete(roomId);
      }

      socket.to(roomId).emit('collaboration:user-left', {
        roomId,
        userId,
        userName,
        timestamp: new Date()
      });

      logger.debug('User left collaboration room', { userId, roomId });
    });

    socket.on('collaboration:typing', (data: { roomId: string; isTyping: boolean }) => {
      socket.to(data.roomId).emit('collaboration:user-typing', {
        roomId: data.roomId,
        userId,
        userName,
        isTyping: data.isTyping,
        timestamp: new Date()
      });
    });
  }

  /**
   * Register a connected user
   */
  private registerUser(socketId: string, userId: string, userName: string): void {
    const now = new Date();
    
    const connectedUser: ConnectedUser = {
      userId,
      socketId,
      userName,
      connectedAt: now,
      lastActivity: now,
      rooms: new Set()
    };

    this.connectedUsers.set(socketId, connectedUser);

    // Track user sockets
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);

    // Broadcast user online status
    this.broadcastToAll('user:online', {
      userId,
      userName,
      timestamp: now
    });
  }

  /**
   * Handle user disconnection
   */
  private handleUserDisconnect(socketId: string, userId: string, reason: string): void {
    const user = this.connectedUsers.get(socketId);
    
    if (user) {
      // Leave all rooms
      user.rooms.forEach(roomId => {
        this.io?.to(roomId).emit('collaboration:user-left', {
          roomId,
          userId,
          userName: user.userName,
          timestamp: new Date()
        });
      });

      this.connectedUsers.delete(socketId);
    }

    // Update user sockets tracking
    const userSocketSet = this.userSockets.get(userId);
    if (userSocketSet) {
      userSocketSet.delete(socketId);
      if (userSocketSet.size === 0) {
        this.userSockets.delete(userId);
        
        // User is completely offline
        this.broadcastToAll('user:offline', {
          userId,
          timestamp: new Date()
        });
      }
    }

    logger.info('User disconnected from WebSocket', {
      userId,
      socketId,
      reason,
      connectedUsers: this.getConnectedUsersCount()
    });
  }

  /**
   * Update user activity timestamp
   */
  private updateUserActivity(userId: string): void {
    for (const [socketId, user] of this.connectedUsers.entries()) {
      if (user.userId === userId) {
        user.lastActivity = new Date();
      }
    }
  }

  /**
   * Broadcast user status change
   */
  private broadcastUserStatus(userId: string, status: string): void {
    this.broadcastToAll('user:status-changed', {
      userId,
      status,
      timestamp: new Date()
    });
  }

  /**
   * Emit event to specific user
   */
  emitToUser<K extends keyof WebSocketEvents>(
    userId: string,
    event: K,
    data: WebSocketEvents[K]
  ): void {
    const userSocketSet = this.userSockets.get(userId);
    if (userSocketSet && this.io) {
      userSocketSet.forEach(socketId => {
        this.io!.to(socketId).emit(event, data);
      });
    }
  }

  /**
   * Emit event to specific room
   */
  emitToRoom<K extends keyof WebSocketEvents>(
    roomId: string,
    event: K,
    data: WebSocketEvents[K]
  ): void {
    if (this.io) {
      this.io.to(roomId).emit(event, data);
    }
  }

  /**
   * Broadcast event to all connected users
   */
  broadcastToAll<K extends keyof WebSocketEvents>(
    event: K,
    data: WebSocketEvents[K]
  ): void {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  /**
   * Emit task-related events
   */
  emitTaskEvent(taskId: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`task:${taskId}`).emit(event, data);
    }
  }

  /**
   * Send notification to user
   */
  sendNotification(userId: string, notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    priority?: 'low' | 'medium' | 'high';
  }): void {
    this.emitToUser(userId, 'notification:new', {
      notificationId: notification.id,
      userId,
      type: notification.type,
      message: notification.message
    });

    logger.info('Notification sent via WebSocket', {
      userId,
      notificationId: notification.id,
      type: notification.type
    });
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Get connected users list
   */
  getConnectedUsers(): Array<{ userId: string; userName: string; connectedAt: Date }> {
    const users: Array<{ userId: string; userName: string; connectedAt: Date }> = [];
    const processedUsers = new Set<string>();

    for (const user of this.connectedUsers.values()) {
      if (!processedUsers.has(user.userId)) {
        users.push({
          userId: user.userId,
          userName: user.userName,
          connectedAt: user.connectedAt
        });
        processedUsers.add(user.userId);
      }
    }

    return users;
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  /**
   * Get WebSocket server statistics
   */
  getStats(): {
    connectedUsers: number;
    totalConnections: number;
    rooms: number;
    uptime: number;
  } {
    const rooms = this.io?.sockets.adapter.rooms?.size || 0;
    const totalConnections = this.connectedUsers.size;

    return {
      connectedUsers: this.getConnectedUsersCount(),
      totalConnections,
      rooms,
      uptime: process.uptime()
    };
  }
}

// Export singleton instance
export const webSocketService = WebSocketService.getInstance();
export default webSocketService; 