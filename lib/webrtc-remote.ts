/**
 * WebRTC 기반 원격 데스크톱 제어
 * 프로그램 설치 없이 브라우저에서 작동
 */

export class WebRTCRemote {
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  public peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;

  constructor() {
    // STUN 서버 설정 (실제로는 TURN 서버도 필요)
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ],
    };
    this.peerConnection = new RTCPeerConnection(configuration);
  }

  /**
   * 화면 공유 시작
   */
  async startScreenShare(videoElement: HTMLVideoElement): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        } as MediaTrackConstraints,
        audio: true,
      });

      // 로컬 스트림 설정
      stream.getTracks().forEach(track => {
        if (this.peerConnection) {
          this.peerConnection.addTrack(track, stream);
        }
      });

      videoElement.srcObject = stream;
      this.localStream = stream;

      return stream;
    } catch (error) {
      console.error('화면 공유 오류:', error);
      throw error;
    }
  }

  /**
   * 원격 제어 데이터 채널 생성
   */
  createDataChannel(): RTCDataChannel {
    if (!this.peerConnection) {
      throw new Error('PeerConnection이 초기화되지 않았습니다.');
    }

    const channel = this.peerConnection.createDataChannel('remote-control', {
      ordered: true,
      maxRetransmits: 3,
    });

    channel.onopen = () => {
      console.log('데이터 채널이 열렸습니다.');
    };

    channel.onerror = (error) => {
      console.error('데이터 채널 오류:', error);
    };

    channel.onclose = () => {
      console.log('데이터 채널이 닫혔습니다.');
    };

    this.dataChannel = channel;
    return channel;
  }

  /**
   * 데이터 채널 수신 설정 (클라이언트 측)
   */
  setupDataChannel(onMessage?: (data: any) => void): void {
    if (!this.peerConnection) return;

    this.peerConnection.ondatachannel = (event) => {
      const channel = event.channel;
      this.dataChannel = channel;

      channel.onopen = () => {
        console.log('데이터 채널이 열렸습니다.');
      };

      channel.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessage) {
            onMessage(data);
          }
        } catch (error) {
          console.error('데이터 채널 메시지 파싱 오류:', error);
        }
      };

      channel.onerror = (error) => {
        console.error('데이터 채널 오류:', error);
      };

      channel.onclose = () => {
        console.log('데이터 채널이 닫혔습니다.');
      };
    };
  }

  /**
   * 마우스 이벤트 전송
   */
  sendMouseEvent(event: { 
    type: string; 
    x: number; 
    y: number; 
    button?: number;
    deltaX?: number;
    deltaY?: number;
    deltaZ?: number;
  }) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      const { type, ...eventData } = event;
      this.dataChannel.send(JSON.stringify({
        type: 'mouse',
        eventType: type,
        ...eventData,
        timestamp: Date.now(),
      }));
    }
  }

  /**
   * 키보드 이벤트 전송
   */
  sendKeyboardEvent(event: { 
    type: string; 
    key: string; 
    code: string;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
  }) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      const { type, ...eventData } = event;
      this.dataChannel.send(JSON.stringify({
        type: 'keyboard',
        eventType: type,
        ...eventData,
        timestamp: Date.now(),
      }));
    }
  }

  /**
   * 클립보드 데이터 전송
   */
  sendClipboard(text: string) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify({
        type: 'clipboard',
        text,
        timestamp: Date.now(),
      }));
    }
  }

  /**
   * 파일 전송 시작
   */
  sendFile(file: File) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const chunks = this.chunkArrayBuffer(arrayBuffer, 16384); // 16KB chunks
        
        // 파일 메타데이터 전송
        this.dataChannel!.send(JSON.stringify({
          type: 'file-start',
          name: file.name,
          size: file.size,
          mimeType: file.type,
          chunks: chunks.length,
        }));

        // 파일 데이터 전송
        chunks.forEach((chunk, index) => {
          this.dataChannel!.send(JSON.stringify({
            type: 'file-chunk',
            index,
            data: Array.from(new Uint8Array(chunk)),
          }));
        });

        // 파일 전송 완료
        this.dataChannel!.send(JSON.stringify({
          type: 'file-end',
          name: file.name,
        }));
      };
      reader.readAsArrayBuffer(file);
    }
  }

  /**
   * ArrayBuffer를 청크로 분할
   */
  private chunkArrayBuffer(buffer: ArrayBuffer, chunkSize: number): ArrayBuffer[] {
    const chunks: ArrayBuffer[] = [];
    let offset = 0;

    while (offset < buffer.byteLength) {
      const end = Math.min(offset + chunkSize, buffer.byteLength);
      chunks.push(buffer.slice(offset, end));
      offset = end;
    }

    return chunks;
  }

  /**
   * Offer 생성 (호스트)
   */
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('PeerConnection이 초기화되지 않았습니다.');
    }

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  /**
   * Answer 생성 (클라이언트)
   */
  async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('PeerConnection이 초기화되지 않았습니다.');
    }

    await this.peerConnection.setRemoteDescription(offer);
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  /**
   * 원격 Description 설정
   */
  async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('PeerConnection이 초기화되지 않았습니다.');
    }
    await this.peerConnection.setRemoteDescription(description);
  }

  /**
   * ICE Candidate 추가
   */
  addIceCandidate(candidate: RTCIceCandidateInit): void {
    if (this.peerConnection) {
      this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  /**
   * 원격 스트림 수신 설정
   */
  setupRemoteStream(videoElement: HTMLVideoElement): void {
    if (!this.peerConnection) return;

    this.peerConnection.ontrack = (event) => {
      console.log('[WebRTC] 원격 트랙 수신:', event);
      if (event.streams && event.streams[0]) {
        console.log('[WebRTC] 스트림 할당:', event.streams[0]);
        videoElement.srcObject = event.streams[0];
        this.remoteStream = event.streams[0];
        // 비디오 재생 시도
        videoElement.play().catch(err => {
          console.error('[WebRTC] 비디오 재생 오류:', err);
        });
      } else if (event.track) {
        // 스트림이 없으면 트랙만 처리
        console.log('[WebRTC] 트랙만 수신:', event.track);
        const stream = new MediaStream([event.track]);
        videoElement.srcObject = stream;
        this.remoteStream = stream;
        videoElement.play().catch(err => {
          console.error('[WebRTC] 비디오 재생 오류:', err);
        });
      }
    };
  }

  /**
   * 연결 종료
   */
  disconnect(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => track.stop());
      this.remoteStream = null;
    }

    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }

  /**
   * 연결 상태 확인
   */
  getConnectionState(): RTCPeerConnectionState {
    return this.peerConnection?.connectionState || 'closed';
  }

  /**
   * ICE 연결 상태 확인
   */
  getIceConnectionState(): RTCIceConnectionState {
    return this.peerConnection?.iceConnectionState || 'closed';
  }

  /**
   * 녹화 시작
   */
  async startRecording(stream: MediaStream): Promise<MediaRecorder> {
    const options = {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 2500000,
    };

    const recorder = new MediaRecorder(stream, options);
    const chunks: Blob[] = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `remote-session-${new Date().getTime()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    };

    recorder.start();
    return recorder;
  }
}
