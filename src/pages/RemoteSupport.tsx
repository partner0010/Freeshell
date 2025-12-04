/**
 * 🔧 원격 지원 페이지
 */

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Monitor, Phone, Upload, Download, Lock, Unlock } from 'lucide-react'
import { io, Socket } from 'socket.io-client'

export default function RemoteSupport() {
  const [mode, setMode] = useState<'client' | 'helper' | null>(null)
  const [sessionId, setSessionId] = useState('')
  const [password, setPassword] = useState('')
  const [inputSessionId, setInputSessionId] = useState('')
  const [inputPassword, setInputPassword] = useState('')
  const [connected, setConnected] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  
  const socketRef = useRef<Socket | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const peerRef = useRef<RTCPeerConnection | null>(null)

  /**
   * 🆕 세션 생성 (도움 요청자)
   */
  const createSession = async () => {
    try {
      // 화면 캡처
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor'
        },
        audio: true
      })

      setStream(mediaStream)

      // Socket.IO 연결
      const socket = io('http://localhost:3001')
      socketRef.current = socket

      // 세션 생성
      socket.emit('create-session', { userId: 'user-id' }, (session: any) => {
        setSessionId(session.sessionId)
        setPassword(session.password)
        setMode('client')
        setConnected(true)
      })

      // 지원자 참가 알림
      socket.on('helper-joined', () => {
        startWebRTC(socket, mediaStream, 'client')
      })

    } catch (error) {
      console.error('화면 캡처 실패:', error)
      alert('화면 공유 권한이 필요합니다')
    }
  }

  /**
   * 👋 세션 참가 (지원자)
   */
  const joinSession = () => {
    const socket = io('http://localhost:3001')
    socketRef.current = socket

    socket.emit('join-session', {
      sessionId: inputSessionId,
      password: inputPassword
    }, (result: any) => {
      if (result.success) {
        setMode('helper')
        setConnected(true)
        startWebRTC(socket, null, 'helper')
      } else {
        alert(result.error)
      }
    })
  }

  /**
   * 🌐 WebRTC 연결
   */
  const startWebRTC = (socket: Socket, stream: MediaStream | null, role: 'client' | 'helper') => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    })

    peerRef.current = peer

    // 클라이언트: 스트림 추가
    if (role === 'client' && stream) {
      stream.getTracks().forEach(track => {
        peer.addTrack(track, stream)
      })

      // Offer 생성
      peer.createOffer().then(offer => {
        peer.setLocalDescription(offer)
        socket.emit('offer', {
          sessionId: sessionId || inputSessionId,
          offer
        })
      })
    }

    // 지원자: Offer 받기
    if (role === 'helper') {
      socket.on('offer', async (data: any) => {
        await peer.setRemoteDescription(data.offer)
        const answer = await peer.createAnswer()
        await peer.setLocalDescription(answer)
        
        socket.emit('answer', {
          sessionId: inputSessionId,
          answer
        })
      })

      // 스트림 받기
      peer.ontrack = (event) => {
        if (videoRef.current) {
          videoRef.current.srcObject = event.streams[0]
        }
      }
    }

    // 클라이언트: Answer 받기
    if (role === 'client') {
      socket.on('answer', async (data: any) => {
        await peer.setRemoteDescription(data.answer)
      })
    }

    // ICE Candidate 교환
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          sessionId: sessionId || inputSessionId,
          candidate: event.candidate
        })
      }
    }

    socket.on('ice-candidate', async (data: any) => {
      await peer.addIceCandidate(data.candidate)
    })
  }

  /**
   * 🛑 세션 종료
   */
  const endSession = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    if (peerRef.current) {
      peerRef.current.close()
    }
    if (socketRef.current) {
      socketRef.current.disconnect()
    }
    
    setConnected(false)
    setMode(null)
  }

  // 초기 화면
  if (!mode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-white mb-4">
              🔧 원격 지원
            </h1>
            <p className="text-xl text-gray-300">
              화면 공유 및 원격 제어로 문제를 해결하세요
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* 도움 요청 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <Monitor className="w-16 h-16 text-blue-400 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">
                도움 요청하기
              </h2>
              <p className="text-gray-300 mb-6">
                화면을 공유하고 9자리 코드를 받아<br />
                지원자에게 전달하세요
              </p>
              <button
                onClick={createSession}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
              >
                화면 공유 시작
              </button>
            </motion.div>

            {/* 지원 제공 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <Phone className="w-16 h-16 text-green-400 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">
                지원 제공하기
              </h2>
              <p className="text-gray-300 mb-4">
                9자리 세션 코드로 연결하세요
              </p>
              
              <input
                type="text"
                placeholder="123-456-789"
                value={inputSessionId}
                onChange={(e) => setInputSessionId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white text-center text-xl tracking-wider mb-3"
                maxLength={11}
              />

              <input
                type="password"
                placeholder="4자리 비밀번호"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white text-center mb-4"
                maxLength={4}
              />

              <button
                onClick={joinSession}
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
              >
                연결하기
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  // 세션 진행 중
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 헤더 */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <h2 className="text-xl font-bold">
              {mode === 'client' ? '🆘 도움 요청 중' : '🔧 원격 지원 중'}
            </h2>
          </div>

          {mode === 'client' && (
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500/20 px-6 py-3 rounded-xl border border-blue-500/50">
                <p className="text-sm text-gray-400">세션 번호</p>
                <p className="text-2xl font-mono font-bold">{sessionId}</p>
              </div>
              <div className="bg-purple-500/20 px-6 py-3 rounded-xl border border-purple-500/50">
                <p className="text-sm text-gray-400">비밀번호</p>
                <p className="text-2xl font-mono font-bold">{password}</p>
              </div>
            </div>
          )}

          <button
            onClick={endSession}
            className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-xl transition-colors"
          >
            연결 종료
          </button>
        </div>
      </div>

      {/* 메인 화면 */}
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-black rounded-xl overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-[calc(100vh-200px)] object-contain"
            />
          </div>

          {/* 컨트롤 바 */}
          {mode === 'helper' && (
            <div className="mt-4 flex items-center justify-center space-x-4">
              <button className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors">
                <Upload className="w-5 h-5" />
                <span>파일 전송</span>
              </button>
              <button className="bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors">
                <Lock className="w-5 h-5" />
                <span>제어 요청</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

