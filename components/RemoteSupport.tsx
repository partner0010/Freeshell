'use client';

import { useState, useRef, useEffect } from 'react';
import { Monitor, MousePointer, Keyboard, Video, MessageSquare, Lock, CheckCircle, XCircle, Loader2, Copy, Download, RefreshCw, Wifi, WifiOff, Upload, FileText, AlertCircle, Settings, X } from 'lucide-react';
import { WebRTCRemote } from '@/lib/webrtc-remote';
import { RemoteControlHandler } from '@/lib/remote-control-handler';
import { ReconnectionManager } from '@/lib/reconnection-manager';
import { NetworkQualityMonitor, NetworkQuality } from '@/lib/network-quality-monitor';

interface RemoteSession {
  code: string;
  status: 'pending' | 'connected' | 'disconnected';
  permissions: {
    screenShare: boolean;
    mouseControl: boolean;
    keyboardControl: boolean;
    recording: boolean;
  };
}

export default function RemoteSupport() {
  const [mode, setMode] = useState<'host' | 'client'>('host');
  const [connectionCode, setConnectionCode] = useState('');
  const [session, setSession] = useState<RemoteSession | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [permissions, setPermissions] = useState({
    screenShare: false,
    mouseControl: false,
    keyboardControl: false,
    recording: false,
  });
  const [chatPassword, setChatPassword] = useState('');
  const [showChatPassword, setShowChatPassword] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ from: 'host' | 'client'; message: string; time: Date }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const webrtcRef = useRef<WebRTCRemote | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const controlHandlerRef = useRef<RemoteControlHandler | null>(null);
  const reconnectionManagerRef = useRef<ReconnectionManager | null>(null);
  const qualityMonitorRef = useRef<NetworkQualityMonitor | null>(null);
  const [networkQuality, setNetworkQuality] = useState<NetworkQuality | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [fileTransferProgress, setFileTransferProgress] = useState<number | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionType, setPermissionType] = useState<'screen' | 'microphone' | 'camera' | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // 호스트: 클라이언트 연결 감지 및 권한 동기화 (폴링)
  useEffect(() => {
    if (mode === 'host' && connectionCode) {
      const checkClientConnection = async () => {
        try {
          const response = await fetch(`/api/remote/session?code=${connectionCode}`);
          const data = await response.json();
          if (data.success) {
            if (!isConnected && data.session.status === 'connected') {
              setIsConnected(true);
            }
            // 권한 동기화: 클라이언트가 설정한 권한을 호스트에 반영
            if (data.session.permissions) {
              setPermissions(data.session.permissions);
              setSession(data.session);
            }
          }
        } catch (error) {
          console.error('클라이언트 연결 확인 오류:', error);
        }
      };

      // 2초마다 클라이언트 연결 및 권한 확인
      const interval = setInterval(checkClientConnection, 2000);
      return () => clearInterval(interval);
    }
  }, [mode, connectionCode, isConnected]);

  // WebRTC 초기화 및 시그널링
  useEffect(() => {
    if (isConnected && connectionCode) {
      initializeWebRTC();
    }
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, connectionCode]);

  const initializeWebRTC = async () => {
    if (!webrtcRef.current) {
      webrtcRef.current = new WebRTCRemote();
    }

    // 재연결 관리자 초기화
    if (!reconnectionManagerRef.current) {
      reconnectionManagerRef.current = new ReconnectionManager({
        maxRetries: 5,
        retryDelay: 3000,
      });
      
      reconnectionManagerRef.current.onReconnect(async () => {
        setIsReconnecting(true);
        await connectWithCode();
      });
      
      reconnectionManagerRef.current.onReconnectSuccess(() => {
        setIsReconnecting(false);
      });
      
      reconnectionManagerRef.current.onReconnectFailed(() => {
        setIsReconnecting(false);
        alert('재연결에 실패했습니다. 수동으로 다시 연결해주세요.');
      });
    }

    // 네트워크 품질 모니터 초기화
    if (webrtcRef.current && webrtcRef.current['peerConnection']) {
      if (!qualityMonitorRef.current) {
        qualityMonitorRef.current = new NetworkQualityMonitor(
          webrtcRef.current['peerConnection']
        );
        qualityMonitorRef.current.onQualityChange((quality) => {
          setNetworkQuality(quality);
        });
        qualityMonitorRef.current.start();
      }
    }
  };

  const cleanup = () => {
    if (webrtcRef.current) {
      webrtcRef.current.disconnect();
      webrtcRef.current = null;
    }
    if (controlHandlerRef.current) {
      controlHandlerRef.current.destroy();
      controlHandlerRef.current = null;
    }
    if (reconnectionManagerRef.current) {
      reconnectionManagerRef.current.stop();
      reconnectionManagerRef.current = null;
    }
    if (qualityMonitorRef.current) {
      qualityMonitorRef.current.stop();
      qualityMonitorRef.current = null;
    }
  };

  // 호스트: 연결 코드 생성
  const generateCode = async () => {
    if (isGenerating) return; // 중복 호출 방지
    
    setIsGenerating(true);
    try {
      console.log('[Host] Generating connection code...');
      const response = await fetch('/api/remote/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create' }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Host] API error:', response.status, errorText);
        let errorMessage = `서버 오류 (${response.status})`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('[Host] Code generation response:', data);
      
      if (data.success && data.session && data.session.code) {
        setConnectionCode(data.session.code);
        setSession(data.session);
        console.log('[Host] Connection code generated:', data.session.code);
      } else {
        console.error('[Host] Invalid response:', data);
        throw new Error(data.error || '연결 코드 생성에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('[Host] Code generation error:', error);
      alert(`코드 생성 오류: ${error.message || '알 수 없는 오류'}\n\n브라우저 개발자 도구 콘솔(F12)을 열어 상세 오류를 확인해주세요.`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 클라이언트: 연결 코드로 접속
  const connectWithCode = async () => {
    if (!connectionCode || connectionCode.length !== 6) {
      alert('6자리 연결 코드를 입력해주세요.');
      return;
    }

    setIsConnecting(true);
    try {
      console.log('[Client] Attempting to join with code:', connectionCode);
      const response = await fetch('/api/remote/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', code: connectionCode }),
      });
      
      const data = await response.json();
      console.log('[Client] Join response:', data);
      
      if (data.success) {
        setIsConnected(true);
        setSession(data.session);
        
        // WebRTC 연결 시작
        if (webrtcRef.current && remoteVideoRef.current) {
          webrtcRef.current.setupRemoteStream(remoteVideoRef.current);
        }
      } else {
        const errorMsg = data.message 
          ? `${data.error}\n${data.message}`
          : data.error || '유효하지 않은 연결 코드입니다.';
        alert(errorMsg);
        console.error('[Client] Join failed:', data);
      }
    } catch (error: any) {
      console.error('[Client] Connection error:', error);
      alert(`연결에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  // 권한 요청 팝업 표시
  const requestPermission = (type: 'screen' | 'microphone' | 'camera') => {
    setPermissionType(type);
    setPermissionError(null);
    setShowPermissionModal(true);
  };

  // 화면 공유 시작 (클라이언트가 화면을 공유하고 호스트가 받음)
  const startScreenShare = async () => {
    if (mode === 'client') {
      // 클라이언트: 자신의 화면을 공유
      if (!webrtcRef.current || !remoteVideoRef.current) return;
      
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          } as MediaTrackConstraints,
          audio: true,
        });

        localStreamRef.current = stream;
        
        // 서버에 화면 공유 시작 알림
        await fetch('/api/remote/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update',
            code: connectionCode,
            permissions: { ...permissions, screenShare: true },
          }),
        });

        setPermissions({ ...permissions, screenShare: true });
        
        // WebRTC로 스트림 전송 (실제 구현 시)
        if (webrtcRef.current) {
          // Offer 생성 및 전송
          const offer = await webrtcRef.current.createOffer();
          // 시그널링 서버를 통해 전송
        }

        // 스트림 종료 감지
        stream.getVideoTracks()[0].addEventListener('ended', () => {
          stopScreenShare();
        });
      } catch (error) {
        console.error('화면 공유 오류:', error);
        alert('화면 공유에 실패했습니다. 브라우저 권한을 확인해주세요.');
      }
    } else {
      // 호스트: 클라이언트에게 화면 공유 요청
      await fetch('/api/remote/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          code: connectionCode,
          permissions: { ...permissions, screenShare: true },
        }),
      });
      setPermissions({ ...permissions, screenShare: true });
    }
  };

  // 실제 권한 요청 실행
  const executePermissionRequest = async () => {
    if (!permissionType || !webrtcRef.current || !videoRef.current) return;

    try {
      if (permissionType === 'screen') {
        const stream = await webrtcRef.current.startScreenShare(videoRef.current);
        localStreamRef.current = stream;
        setPermissions({ ...permissions, screenShare: true });
        setShowPermissionModal(false);
        setPermissionType(null);

        // WebRTC Offer 생성 및 전송
        const offer = await webrtcRef.current.createOffer();
        // 실제로는 시그널링 서버를 통해 전송해야 함
        
        // 스트림 종료 감지
        stream.getVideoTracks()[0].addEventListener('ended', () => {
          stopScreenShare();
        });
      } else if (permissionType === 'microphone') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // 마이크 권한 처리
        setShowPermissionModal(false);
        setPermissionType(null);
        stream.getTracks().forEach(track => track.stop()); // 테스트용으로 즉시 중지
      } else if (permissionType === 'camera') {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // 카메라 권한 처리
        setShowPermissionModal(false);
        setPermissionType(null);
        stream.getTracks().forEach(track => track.stop()); // 테스트용으로 즉시 중지
      }
    } catch (error: any) {
      console.error('권한 요청 오류:', error);
      
      let errorMessage = '권한 요청에 실패했습니다.';
      if (error.name === 'NotAllowedError') {
        errorMessage = '권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = '요청한 미디어 장치를 찾을 수 없습니다.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = '미디어 장치에 접근할 수 없습니다. 다른 프로그램에서 사용 중일 수 있습니다.';
      }
      
      setPermissionError(errorMessage);
    }
  };

  // 브라우저 설정 가이드
  const getBrowserSettingsGuide = () => {
    const userAgent = typeof window !== 'undefined' ? navigator.userAgent : '';
    if (userAgent.includes('Chrome')) {
      return 'Chrome: 주소창 왼쪽 자물쇠 아이콘 → 사이트 설정 → 권한 허용';
    } else if (userAgent.includes('Firefox')) {
      return 'Firefox: 주소창 왼쪽 자물쇠 아이콘 → 권한 → 허용';
    } else if (userAgent.includes('Safari')) {
      return 'Safari: Safari → 환경설정 → 웹사이트 → 권한 설정';
    } else if (userAgent.includes('Edge')) {
      return 'Edge: 주소창 왼쪽 자물쇠 아이콘 → 사이트 권한 → 허용';
    }
    return '브라우저 설정에서 사이트 권한을 확인해주세요.';
  };

  // 화면 공유 중지
  const stopScreenShare = async () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    
    const newPermissions = { ...permissions, screenShare: false };
    setPermissions(newPermissions);
    
    // 서버에 화면 공유 중지 알림
    if (connectionCode) {
      await fetch('/api/remote/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          code: connectionCode,
          permissions: newPermissions,
        }),
      });
    }
  };

  // 녹화 시작
  const startRecording = async () => {
    if (!localStreamRef.current || !webrtcRef.current) {
      alert('먼저 화면 공유를 시작해주세요.');
      return;
    }
    try {
      const recorder = await webrtcRef.current.startRecording(localStreamRef.current);
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch (error) {
      console.error('녹화 시작 오류:', error);
      alert('녹화를 시작할 수 없습니다.');
    }
  };

  // 녹화 중지
  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
    setIsRecording(false);
  };

  // 채팅 메시지 전송
  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    
    setChatMessages([...chatMessages, {
      from: mode,
      message: chatInput,
      time: new Date(),
    }]);
    setChatInput('');
  };

  // 연결 코드 복사
  const copyCode = () => {
    navigator.clipboard.writeText(connectionCode);
    alert('연결 코드가 복사되었습니다.');
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* 모드 선택 */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setMode('host')}
            className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all ${
              mode === 'host'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            호스트 (원격 지원 제공)
          </button>
          <button
            onClick={() => setMode('client')}
            className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all ${
              mode === 'client'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            클라이언트 (원격 지원 받기)
          </button>
        </div>

        {/* 호스트 모드 */}
        {mode === 'host' && (
          <div className="space-y-4">
            {!connectionCode ? (
              <div className="text-center py-8">
                <p className="text-gray-700 mb-4">원격 지원을 시작하려면 연결 코드를 생성하세요.</p>
                <button
                  onClick={generateCode}
                  disabled={isGenerating}
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>생성 중...</span>
                    </>
                  ) : (
                    <>
                      <Monitor className="w-5 h-5" />
                      <span>연결 코드 생성</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">연결 코드</h3>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-blue-600 tracking-wider">
                      {connectionCode}
                    </div>
                    <button
                      onClick={copyCode}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>복사</span>
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    이 코드를 클라이언트에게 전달하세요. 클라이언트가 코드를 입력하면 연결이 시작됩니다.
                  </p>
                </div>

                {!isConnected && connectionCode && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
                      <span className="text-sm font-medium text-yellow-800">클라이언트 연결 대기 중...</span>
                    </div>
                    <p className="text-xs text-yellow-600">
                      클라이언트가 연결 코드를 입력하면 자동으로 연결됩니다.
                    </p>
                  </div>
                )}

                {isConnected && (
                  <div className="space-y-4">
                    {/* 연결 성공 알림 */}
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">클라이언트가 연결되었습니다!</span>
                      </div>
                    </div>
                    {/* 화면 공유 */}
                    <div className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-gray-900">화면 공유</span>
                        </div>
                        {permissions.screenShare ? (
                          <button
                            onClick={stopScreenShare}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            중지
                          </button>
                        ) : (
                          <button
                            onClick={startScreenShare}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            시작
                          </button>
                        )}
                      </div>
                      {permissions.screenShare && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">클라이언트 화면이 표시됩니다.</p>
                          <video
                            ref={remoteVideoRef}
                            autoPlay
                            className="w-full rounded-lg bg-gray-900"
                            style={{ maxHeight: '400px' }}
                          />
                        </div>
                      )}
                    </div>

                    {/* 권한 상태 (클라이언트가 설정한 권한 표시) */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">원격 제어 권한 상태</h4>
                      <p className="text-sm text-gray-600 mb-3">클라이언트가 설정한 권한입니다.</p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          {permissions.mouseControl ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-gray-400" />
                          )}
                          <div className="flex items-center gap-2">
                            <MousePointer className="w-5 h-5 text-gray-600" />
                            <span className={`text-gray-700 ${permissions.mouseControl ? 'font-semibold' : ''}`}>
                              마우스 제어 {permissions.mouseControl ? '허용됨' : '거부됨'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {permissions.keyboardControl ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-gray-400" />
                          )}
                          <div className="flex items-center gap-2">
                            <Keyboard className="w-5 h-5 text-gray-600" />
                            <span className={`text-gray-700 ${permissions.keyboardControl ? 'font-semibold' : ''}`}>
                              키보드 제어 {permissions.keyboardControl ? '허용됨' : '거부됨'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {permissions.recording ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-gray-400" />
                          )}
                          <div className="flex items-center gap-2">
                            <Video className="w-5 h-5 text-gray-600" />
                            <span className={`text-gray-700 ${permissions.recording ? 'font-semibold' : ''}`}>
                              세션 녹화 {permissions.recording ? '허용됨' : '거부됨'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 녹화 제어 */}
                    {permissions.recording && (
                      <div className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Video className="w-5 h-5 text-red-600" />
                            <span className="font-semibold text-gray-900">세션 녹화</span>
                            {isRecording && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                                녹화 중...
                              </span>
                            )}
                          </div>
                          {isRecording ? (
                            <button
                              onClick={stopRecording}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                              <Video className="w-4 h-4" />
                              <span>녹화 중지</span>
                            </button>
                          ) : (
                            <button
                              onClick={startRecording}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                              <Video className="w-4 h-4" />
                              <span>녹화 시작</span>
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          녹화된 파일은 PC에 저장됩니다.
                        </p>
                      </div>
                    )}

                    {/* 채팅 */}
                    <div className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-gray-900">보안 채팅</span>
                        </div>
                        {!showChatPassword && (
                          <button
                            onClick={() => setShowChatPassword(true)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                          >
                            <Lock className="w-4 h-4" />
                            <span>채팅 활성화</span>
                          </button>
                        )}
                      </div>
                      {showChatPassword && (
                        <div className="space-y-3">
                          <input
                            type="password"
                            value={chatPassword}
                            onChange={(e) => setChatPassword(e.target.value)}
                            placeholder="비밀번호 입력 (에이전트가 제공)"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                          <div className="bg-gray-50 rounded-lg p-4 h-48 overflow-y-auto">
                            {chatMessages.length === 0 ? (
                              <p className="text-gray-500 text-center py-8">메시지가 없습니다.</p>
                            ) : (
                              chatMessages.map((msg, index) => (
                                <div key={index} className={`mb-3 ${msg.from === 'host' ? 'text-right' : 'text-left'}`}>
                                  <div className={`inline-block px-3 py-2 rounded-lg ${
                                    msg.from === 'host' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-900'
                                  }`}>
                                    <p className="text-sm">{msg.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {msg.time.toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                              placeholder="메시지 입력..."
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                            <button
                              onClick={sendChatMessage}
                              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              전송
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 클라이언트 모드 */}
        {mode === 'client' && (
          <div className="space-y-4">
            {!isConnected ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    6자리 연결 코드 입력
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={connectionCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setConnectionCode(value);
                      }}
                      placeholder="000000"
                      maxLength={6}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 text-center text-2xl font-bold tracking-widest text-gray-900"
                    />
                    <button
                      onClick={connectWithCode}
                      disabled={isConnecting || connectionCode.length !== 6}
                      className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>연결 중...</span>
                        </>
                      ) : (
                        <>
                          <Monitor className="w-5 h-5" />
                          <span>연결</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-gray-700">
                    고객 지원 담당자로부터 받은 6자리 연결 코드를 입력하세요.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-gray-900">연결됨</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    원격 지원 담당자가 화면을 볼 수 있습니다.
                  </p>
                </div>

                {/* 권한 동의 */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">원격 제어 동의</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={permissions.mouseControl}
                        onChange={async (e) => {
                          const newPermissions = { ...permissions, mouseControl: e.target.checked };
                          setPermissions(newPermissions);
                          // 서버에 권한 업데이트
                          await fetch('/api/remote/session', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              action: 'update',
                              code: connectionCode,
                              permissions: newPermissions,
                            }),
                          });
                        }}
                        className="w-5 h-5"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <MousePointer className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-700 font-medium">마우스 제어 허용</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          원격 지원 담당자가 마우스를 제어할 수 있습니다.
                        </p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={permissions.keyboardControl}
                        onChange={async (e) => {
                          const newPermissions = { ...permissions, keyboardControl: e.target.checked };
                          setPermissions(newPermissions);
                          // 서버에 권한 업데이트
                          await fetch('/api/remote/session', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              action: 'update',
                              code: connectionCode,
                              permissions: newPermissions,
                            }),
                          });
                        }}
                        className="w-5 h-5"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <Keyboard className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-700 font-medium">키보드 제어 허용</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          원격 지원 담당자가 키보드를 제어할 수 있습니다.
                        </p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={permissions.recording}
                        onChange={async (e) => {
                          const newPermissions = { ...permissions, recording: e.target.checked };
                          setPermissions(newPermissions);
                          // 서버에 권한 업데이트
                          await fetch('/api/remote/session', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              action: 'update',
                              code: connectionCode,
                              permissions: newPermissions,
                            }),
                          });
                        }}
                        className="w-5 h-5"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <Video className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-700 font-medium">세션 녹화 허용</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          원격 지원 과정이 녹화됩니다. 녹화 파일은 담당자 PC에 저장됩니다.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* 화면 공유 시작 버튼 */}
                {!permissions.screenShare && (
                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">화면 공유</h4>
                        <p className="text-sm text-gray-600">원격 지원을 위해 화면을 공유하세요.</p>
                      </div>
                      <button
                        onClick={startScreenShare}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Monitor className="w-5 h-5" />
                        <span>화면 공유 시작</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 원격 화면 표시 */}
                {permissions.screenShare && (
                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">공유 중인 화면</h4>
                      <button
                        onClick={stopScreenShare}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        중지
                      </button>
                    </div>
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      muted
                      className="w-full rounded-lg bg-gray-900"
                      style={{ maxHeight: '400px' }}
                    />
                  </div>
                )}

                {/* 채팅 */}
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">보안 채팅</span>
                    </div>
                    {!showChatPassword && (
                      <button
                        onClick={() => setShowChatPassword(true)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        <span>채팅 활성화</span>
                      </button>
                    )}
                  </div>
                  {showChatPassword && (
                    <div className="space-y-3">
                      <input
                        type="password"
                        value={chatPassword}
                        onChange={(e) => setChatPassword(e.target.value)}
                        placeholder="비밀번호 입력 (에이전트가 제공)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                      <div className="bg-gray-50 rounded-lg p-4 h-48 overflow-y-auto">
                        {chatMessages.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">메시지가 없습니다.</p>
                        ) : (
                          chatMessages.map((msg, index) => (
                            <div key={index} className={`mb-3 ${msg.from === 'host' ? 'text-right' : 'text-left'}`}>
                              <div className={`inline-block px-3 py-2 rounded-lg ${
                                msg.from === 'host' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-900'
                              }`}>
                                <p className="text-sm">{msg.message}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {msg.time.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                          placeholder="메시지 입력..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                        <button
                          onClick={sendChatMessage}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          전송
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 연결 해제 */}
                <button
                  onClick={() => {
                    setIsConnected(false);
                    setConnectionCode('');
                    setPermissions({
                      screenShare: false,
                      mouseControl: false,
                      keyboardControl: false,
                      recording: false,
                    });
                  }}
                  className="w-full px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  <span>연결 해제</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 보안 안내 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Lock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">보안 안내</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• 모든 연결은 HTTPS를 통해 암호화됩니다.</li>
              <li>• 연결 코드는 30분 후 자동으로 만료됩니다.</li>
              <li>• 마우스/키보드 제어는 사용자 동의가 필요합니다.</li>
              <li>• 세션 녹화는 사용자 동의 후에만 시작됩니다.</li>
              <li>• 언제든지 연결을 해제할 수 있습니다.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 권한 요청 모달 */}
      {showPermissionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
              {/* 헤더 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {permissionType === 'screen' && '화면 공유 권한 필요'}
                    {permissionType === 'microphone' && '마이크 권한 필요'}
                    {permissionType === 'camera' && '카메라 권한 필요'}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowPermissionModal(false);
                    setPermissionType(null);
                    setPermissionError(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* 내용 */}
              <div className="space-y-3">
                <p className="text-gray-700">
                  {permissionType === 'screen' && '원격 지원을 위해 화면 공유 권한이 필요합니다. 브라우저에서 권한 요청 팝업이 나타나면 "허용"을 클릭해주세요.'}
                  {permissionType === 'microphone' && '음성 통신을 위해 마이크 권한이 필요합니다. 브라우저에서 권한 요청 팝업이 나타나면 "허용"을 클릭해주세요.'}
                  {permissionType === 'camera' && '영상 통신을 위해 카메라 권한이 필요합니다. 브라우저에서 권한 요청 팝업이 나타나면 "허용"을 클릭해주세요.'}
                </p>

                {permissionError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800 mb-1">권한 요청 실패</p>
                        <p className="text-sm text-red-700">{permissionError}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Settings className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 mb-1">권한이 거부된 경우</p>
                      <p className="text-xs text-gray-600">{getBrowserSettingsGuide()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowPermissionModal(false);
                    setPermissionType(null);
                    setPermissionError(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={executePermissionRequest}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  {permissionError ? (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>다시 시도</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>권한 허용</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

