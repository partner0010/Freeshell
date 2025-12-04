/**
 * 🔧 원격 지원 시스템
 * WebRTC 기반 화면 공유 및 원격 제어
 */

import { Server as SocketIOServer } from 'socket.io'
import { logger } from '../../utils/logger'
import crypto from 'crypto'

export interface RemoteSession {
  sessionId: string
  password: string
  clientId: string
  helperId?: string
  createdAt: Date
  expiresAt: Date
  permissions: {
    screen: boolean
    control: boolean
    files: boolean
    clipboard: boolean
    audio: boolean
  }
  logs: SessionLog[]
}

export interface SessionLog {
  timestamp: Date
  action: string
  user: 'client' | 'helper'
}

class RemoteSupportService {
  private sessions: Map<string, RemoteSession> = new Map()
  private io?: SocketIOServer

  /**
   * 🚀 Socket.IO 초기화
   */
  initialize(io: SocketIOServer) {
    this.io = io

    io.on('connection', (socket) => {
      logger.info(`🔌 원격 지원 연결: ${socket.id}`)

      // 세션 생성
      socket.on('create-session', (data, callback) => {
        const session = this.createSession(socket.id, data.userId)
        callback(session)
      })

      // 세션 참가
      socket.on('join-session', (data, callback) => {
        const result = this.joinSession(data.sessionId, data.password, socket.id)
        callback(result)
      })

      // WebRTC 시그널링
      socket.on('offer', (data) => {
        socket.to(data.sessionId).emit('offer', data.offer)
      })

      socket.on('answer', (data) => {
        socket.to(data.sessionId).emit('answer', data.answer)
      })

      socket.on('ice-candidate', (data) => {
        socket.to(data.sessionId).emit('ice-candidate', data.candidate)
      })

      // 원격 제어 이벤트
      socket.on('mouse-event', (data) => {
        const session = this.getSessionBySocket(socket.id)
        if (session && session.permissions.control) {
          socket.to(data.sessionId).emit('mouse-event', data)
          this.addLog(data.sessionId, 'mouse-event', 'helper')
        }
      })

      socket.on('keyboard-event', (data) => {
        const session = this.getSessionBySocket(socket.id)
        if (session && session.permissions.control) {
          socket.to(data.sessionId).emit('keyboard-event', data)
          this.addLog(data.sessionId, 'keyboard-event', 'helper')
        }
      })

      // 파일 전송
      socket.on('file-transfer', (data) => {
        const session = this.getSessionBySocket(socket.id)
        if (session && session.permissions.files) {
          socket.to(data.sessionId).emit('file-transfer', data)
          this.addLog(data.sessionId, `file-transfer: ${data.fileName}`, 'helper')
        }
      })

      // 권한 요청
      socket.on('request-permission', (data, callback) => {
        socket.to(data.sessionId).emit('permission-request', {
          permission: data.permission,
          callback: (granted: boolean) => {
            callback(granted)
            if (granted) {
              this.updatePermission(data.sessionId, data.permission, true)
            }
          }
        })
      })

      // 연결 해제
      socket.on('disconnect', () => {
        this.handleDisconnect(socket.id)
      })
    })

    logger.info('✅ 원격 지원 시스템 초기화 완료')
  }

  /**
   * 🆕 세션 생성
   */
  createSession(socketId: string, userId: string): RemoteSession {
    const sessionId = this.generateSessionId()
    const password = this.generatePassword()

    const session: RemoteSession = {
      sessionId,
      password,
      clientId: socketId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30분 후 만료
      permissions: {
        screen: true,   // 화면 공유는 기본
        control: false, // 제어는 승인 필요
        files: false,   // 파일은 승인 필요
        clipboard: false,
        audio: true
      },
      logs: []
    }

    this.sessions.set(sessionId, session)
    this.addLog(sessionId, 'session-created', 'client')

    logger.info(`🆕 세션 생성: ${sessionId}`)

    // 30분 후 자동 만료
    setTimeout(() => {
      this.endSession(sessionId)
    }, 30 * 60 * 1000)

    return session
  }

  /**
   * 🔐 9자리 세션 ID 생성
   */
  private generateSessionId(): string {
    const num = Math.floor(100000000 + Math.random() * 900000000)
    return num.toString().match(/.{1,3}/g)!.join('-') // "123-456-789"
  }

  /**
   * 🔑 4자리 비밀번호 생성
   */
  private generatePassword(): string {
    return Math.floor(1000 + Math.random() * 9000).toString()
  }

  /**
   * 🚪 세션 참가
   */
  joinSession(sessionId: string, password: string, socketId: string) {
    const session = this.sessions.get(sessionId)

    if (!session) {
      return { success: false, error: '세션을 찾을 수 없습니다' }
    }

    if (session.password !== password) {
      return { success: false, error: '비밀번호가 올바르지 않습니다' }
    }

    if (new Date() > session.expiresAt) {
      return { success: false, error: '세션이 만료되었습니다' }
    }

    session.helperId = socketId
    this.addLog(sessionId, 'helper-joined', 'helper')

    logger.info(`👋 지원자 참가: ${sessionId}`)

    // 클라이언트에게 알림
    this.io?.to(session.clientId).emit('helper-joined', {
      sessionId
    })

    return { success: true, session }
  }

  /**
   * 📝 로그 추가
   */
  private addLog(sessionId: string, action: string, user: 'client' | 'helper') {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.logs.push({
        timestamp: new Date(),
        action,
        user
      })
    }
  }

  /**
   * ⚙️ 권한 업데이트
   */
  private updatePermission(sessionId: string, permission: string, granted: boolean) {
    const session = this.sessions.get(sessionId)
    if (session && permission in session.permissions) {
      (session.permissions as any)[permission] = granted
      this.addLog(sessionId, `permission-${permission}-${granted ? 'granted' : 'denied'}`, 'client')
    }
  }

  /**
   * 🔍 소켓으로 세션 찾기
   */
  private getSessionBySocket(socketId: string): RemoteSession | undefined {
    for (const session of this.sessions.values()) {
      if (session.clientId === socketId || session.helperId === socketId) {
        return session
      }
    }
    return undefined
  }

  /**
   * 👋 연결 해제
   */
  private handleDisconnect(socketId: string) {
    const session = this.getSessionBySocket(socketId)
    
    if (session) {
      if (session.clientId === socketId) {
        this.addLog(session.sessionId, 'client-disconnected', 'client')
        // 클라이언트가 나가면 세션 종료
        this.endSession(session.sessionId)
      } else if (session.helperId === socketId) {
        this.addLog(session.sessionId, 'helper-disconnected', 'helper')
        session.helperId = undefined
      }
    }
  }

  /**
   * 🛑 세션 종료
   */
  endSession(sessionId: string) {
    const session = this.sessions.get(sessionId)
    
    if (session) {
      // 모든 참가자에게 알림
      this.io?.to(session.clientId).emit('session-ended')
      if (session.helperId) {
        this.io?.to(session.helperId).emit('session-ended')
      }

      this.sessions.delete(sessionId)
      logger.info(`🛑 세션 종료: ${sessionId}`)
    }
  }

  /**
   * 📊 세션 통계
   */
  getStats() {
    return {
      activeSessions: this.sessions.size,
      sessions: Array.from(this.sessions.values()).map(s => ({
        sessionId: s.sessionId,
        duration: Date.now() - s.createdAt.getTime(),
        hasHelper: !!s.helperId
      }))
    }
  }
}

// 싱글톤
export const remoteSupportService = new RemoteSupportService()
export default remoteSupportService

