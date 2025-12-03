/**
 * 🤝 실시간 협업 시스템 - WebSocket 기반
 * 동시 편집, 채팅, 알림, 커서 추적
 */

import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { logger } from '../../utils/logger'
import jwt from 'jsonwebtoken'

export interface CollaborationRoom {
  id: string
  name: string
  users: Map<string, CollaborationUser>
  content: any
  cursors: Map<string, CursorPosition>
  changes: Change[]
  locked: boolean
}

export interface CollaborationUser {
  id: string
  username: string
  email: string
  color: string
  socketId: string
  lastSeen: Date
}

export interface CursorPosition {
  userId: string
  x: number
  y: number
  selection?: {
    start: number
    end: number
  }
}

export interface Change {
  id: string
  userId: string
  timestamp: Date
  type: 'insert' | 'delete' | 'replace'
  position: number
  content: string
  length: number
}

export interface ChatMessage {
  id: string
  userId: string
  username: string
  content: string
  timestamp: Date
  type: 'text' | 'image' | 'file'
  mentions?: string[]
}

class RealtimeCollaboration {
  private io: SocketIOServer
  private rooms: Map<string, CollaborationRoom> = new Map()
  private userColors: string[] = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
  ]

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    })

    this.setupMiddleware()
    this.setupEventHandlers()

    logger.info('🤝 실시간 협업 시스템 초기화 완료')
  }

  /**
   * 🔐 인증 미들웨어
   */
  private setupMiddleware() {
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token
        if (!token) {
          throw new Error('인증 토큰 없음')
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
        socket.data.userId = decoded.id
        socket.data.username = decoded.username || decoded.email
        socket.data.email = decoded.email

        next()
      } catch (error: any) {
        logger.error('WebSocket 인증 실패:', error)
        next(new Error('Authentication failed'))
      }
    })
  }

  /**
   * 📡 이벤트 핸들러 설정
   */
  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`✅ 사용자 연결: ${socket.data.username} (${socket.id})`)

      // 방 참가
      socket.on('join-room', (roomId: string) => {
        this.handleJoinRoom(socket, roomId)
      })

      // 방 나가기
      socket.on('leave-room', (roomId: string) => {
        this.handleLeaveRoom(socket, roomId)
      })

      // 콘텐츠 변경
      socket.on('content-change', (data: { roomId: string; change: Change }) => {
        this.handleContentChange(socket, data.roomId, data.change)
      })

      // 커서 이동
      socket.on('cursor-move', (data: { roomId: string; position: CursorPosition }) => {
        this.handleCursorMove(socket, data.roomId, data.position)
      })

      // 채팅 메시지
      socket.on('chat-message', (data: { roomId: string; message: string }) => {
        this.handleChatMessage(socket, data.roomId, data.message)
      })

      // 파일 공유
      socket.on('share-file', (data: { roomId: string; file: any }) => {
        this.handleFileShare(socket, data.roomId, data.file)
      })

      // 화면 공유 시작
      socket.on('start-screen-share', (roomId: string) => {
        this.handleScreenShare(socket, roomId, true)
      })

      // 화면 공유 종료
      socket.on('stop-screen-share', (roomId: string) => {
        this.handleScreenShare(socket, roomId, false)
      })

      // 연결 해제
      socket.on('disconnect', () => {
        this.handleDisconnect(socket)
      })

      // Ping-Pong (연결 유지)
      socket.on('ping', () => {
        socket.emit('pong')
      })
    })
  }

  /**
   * 🚪 방 참가
   */
  private handleJoinRoom(socket: any, roomId: string) {
    try {
      // 방이 없으면 생성
      if (!this.rooms.has(roomId)) {
        this.rooms.set(roomId, {
          id: roomId,
          name: `Room ${roomId}`,
          users: new Map(),
          content: {},
          cursors: new Map(),
          changes: [],
          locked: false
        })
      }

      const room = this.rooms.get(roomId)!

      // 사용자 추가
      const user: CollaborationUser = {
        id: socket.data.userId,
        username: socket.data.username,
        email: socket.data.email,
        color: this.getRandomColor(),
        socketId: socket.id,
        lastSeen: new Date()
      }

      room.users.set(user.id, user)
      socket.join(roomId)

      // 현재 방 상태 전송
      socket.emit('room-state', {
        content: room.content,
        users: Array.from(room.users.values()),
        cursors: Array.from(room.cursors.entries()),
        locked: room.locked
      })

      // 다른 사용자들에게 알림
      socket.to(roomId).emit('user-joined', user)

      logger.info(`👤 ${user.username}이(가) 방 ${roomId}에 참가`)
    } catch (error: any) {
      logger.error('방 참가 실패:', error)
      socket.emit('error', { message: '방 참가 실패' })
    }
  }

  /**
   * 🚪 방 나가기
   */
  private handleLeaveRoom(socket: any, roomId: string) {
    try {
      const room = this.rooms.get(roomId)
      if (!room) return

      const userId = socket.data.userId
      const user = room.users.get(userId)

      if (user) {
        room.users.delete(userId)
        room.cursors.delete(userId)
        socket.leave(roomId)

        // 다른 사용자들에게 알림
        socket.to(roomId).emit('user-left', { userId, username: user.username })

        logger.info(`👤 ${user.username}이(가) 방 ${roomId}에서 나감`)

        // 방이 비었으면 삭제
        if (room.users.size === 0) {
          this.rooms.delete(roomId)
          logger.info(`🗑️ 빈 방 ${roomId} 삭제`)
        }
      }
    } catch (error: any) {
      logger.error('방 나가기 실패:', error)
    }
  }

  /**
   * ✏️ 콘텐츠 변경
   */
  private handleContentChange(socket: any, roomId: string, change: Change) {
    try {
      const room = this.rooms.get(roomId)
      if (!room) return

      if (room.locked) {
        socket.emit('error', { message: '콘텐츠가 잠겨있습니다' })
        return
      }

      // 변경사항 저장
      room.changes.push(change)

      // 다른 사용자들에게 전달 (본인 제외)
      socket.to(roomId).emit('content-changed', change)

      logger.debug(`✏️ 콘텐츠 변경: ${change.type} by ${socket.data.username}`)
    } catch (error: any) {
      logger.error('콘텐츠 변경 실패:', error)
    }
  }

  /**
   * 🖱️ 커서 이동
   */
  private handleCursorMove(socket: any, roomId: string, position: CursorPosition) {
    try {
      const room = this.rooms.get(roomId)
      if (!room) return

      const userId = socket.data.userId
      position.userId = userId

      room.cursors.set(userId, position)

      // 다른 사용자들에게 전달
      socket.to(roomId).emit('cursor-moved', position)
    } catch (error: any) {
      logger.error('커서 이동 실패:', error)
    }
  }

  /**
   * 💬 채팅 메시지
   */
  private handleChatMessage(socket: any, roomId: string, content: string) {
    try {
      const room = this.rooms.get(roomId)
      if (!room) return

      const message: ChatMessage = {
        id: `msg-${Date.now()}`,
        userId: socket.data.userId,
        username: socket.data.username,
        content,
        timestamp: new Date(),
        type: 'text',
        mentions: this.extractMentions(content)
      }

      // 모든 사용자에게 전송
      this.io.to(roomId).emit('chat-message', message)

      logger.debug(`💬 채팅: ${message.username}: ${content}`)
    } catch (error: any) {
      logger.error('채팅 메시지 전송 실패:', error)
    }
  }

  /**
   * 📁 파일 공유
   */
  private handleFileShare(socket: any, roomId: string, file: any) {
    try {
      const room = this.rooms.get(roomId)
      if (!room) return

      const fileMessage: ChatMessage = {
        id: `file-${Date.now()}`,
        userId: socket.data.userId,
        username: socket.data.username,
        content: file.url,
        timestamp: new Date(),
        type: 'file'
      }

      this.io.to(roomId).emit('file-shared', fileMessage)

      logger.info(`📁 파일 공유: ${file.name} by ${socket.data.username}`)
    } catch (error: any) {
      logger.error('파일 공유 실패:', error)
    }
  }

  /**
   * 🖥️ 화면 공유
   */
  private handleScreenShare(socket: any, roomId: string, isSharing: boolean) {
    try {
      const room = this.rooms.get(roomId)
      if (!room) return

      const event = isSharing ? 'screen-share-started' : 'screen-share-stopped'

      socket.to(roomId).emit(event, {
        userId: socket.data.userId,
        username: socket.data.username
      })

      logger.info(`🖥️ 화면 공유 ${isSharing ? '시작' : '종료'}: ${socket.data.username}`)
    } catch (error: any) {
      logger.error('화면 공유 처리 실패:', error)
    }
  }

  /**
   * 🔌 연결 해제
   */
  private handleDisconnect(socket: any) {
    try {
      const userId = socket.data.userId
      const username = socket.data.username

      // 모든 방에서 사용자 제거
      for (const [roomId, room] of this.rooms.entries()) {
        if (room.users.has(userId)) {
          room.users.delete(userId)
          room.cursors.delete(userId)

          socket.to(roomId).emit('user-left', { userId, username })

          if (room.users.size === 0) {
            this.rooms.delete(roomId)
          }
        }
      }

      logger.info(`❌ 사용자 연결 해제: ${username}`)
    } catch (error: any) {
      logger.error('연결 해제 처리 실패:', error)
    }
  }

  /**
   * 🎨 랜덤 색상 선택
   */
  private getRandomColor(): string {
    return this.userColors[Math.floor(Math.random() * this.userColors.length)]
  }

  /**
   * 🏷️ 멘션 추출 (@username)
   */
  private extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g
    const mentions: string[] = []
    let match

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1])
    }

    return mentions
  }

  /**
   * 📊 통계
   */
  getStats() {
    return {
      totalRooms: this.rooms.size,
      totalUsers: Array.from(this.rooms.values()).reduce(
        (sum, room) => sum + room.users.size,
        0
      ),
      rooms: Array.from(this.rooms.entries()).map(([id, room]) => ({
        id,
        name: room.name,
        userCount: room.users.size,
        changeCount: room.changes.length,
        locked: room.locked
      }))
    }
  }

  /**
   * 🔒 방 잠금/해제
   */
  lockRoom(roomId: string, locked: boolean) {
    const room = this.rooms.get(roomId)
    if (room) {
      room.locked = locked
      this.io.to(roomId).emit('room-locked', { locked })
      logger.info(`🔒 방 ${roomId} ${locked ? '잠금' : '잠금 해제'}`)
    }
  }

  /**
   * 👥 방의 사용자 목록
   */
  getRoomUsers(roomId: string): CollaborationUser[] {
    const room = this.rooms.get(roomId)
    return room ? Array.from(room.users.values()) : []
  }
}

export let realtimeCollaboration: RealtimeCollaboration

export function initializeRealtimeCollaboration(httpServer: HTTPServer) {
  realtimeCollaboration = new RealtimeCollaboration(httpServer)
  return realtimeCollaboration
}

export default realtimeCollaboration

