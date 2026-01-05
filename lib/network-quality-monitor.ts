/**
 * 네트워크 품질 모니터링
 * 연결 품질에 따라 비디오 품질 자동 조절
 */

export interface NetworkQuality {
  bandwidth: number; // Mbps
  latency: number; // ms
  packetLoss: number; // percentage
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

export class NetworkQualityMonitor {
  private peerConnection: RTCPeerConnection | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private onQualityChangeCallback?: (quality: NetworkQuality) => void;
  private stats: RTCStatsReport | null = null;

  constructor(peerConnection: RTCPeerConnection) {
    this.peerConnection = peerConnection;
  }

  /**
   * 모니터링 시작
   */
  start(interval: number = 5000) {
    if (this.intervalId) {
      this.stop();
    }

    this.intervalId = setInterval(async () => {
      await this.checkQuality();
    }, interval);
  }

  /**
   * 모니터링 중지
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * 네트워크 품질 확인
   */
  private async checkQuality() {
    if (!this.peerConnection) return;

    try {
      const stats = await this.peerConnection.getStats();
      this.stats = stats;

      const quality = this.calculateQuality(stats);
      
      if (this.onQualityChangeCallback) {
        this.onQualityChangeCallback(quality);
      }
    } catch (error) {
      console.error('네트워크 품질 확인 오류:', error);
    }
  }

  /**
   * 품질 계산
   */
  private calculateQuality(stats: RTCStatsReport): NetworkQuality {
    let totalBytesReceived = 0;
    let totalBytesSent = 0;
    let totalPacketsReceived = 0;
    let totalPacketsLost = 0;
    let rtt = 0;

    stats.forEach((report) => {
      if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
        totalBytesReceived += report.bytesReceived || 0;
        totalPacketsReceived += report.packetsReceived || 0;
        totalPacketsLost += report.packetsLost || 0;
      }
      if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
        totalBytesSent += report.bytesSent || 0;
      }
      if (report.type === 'candidate-pair' && report.currentRoundTripTime) {
        rtt = report.currentRoundTripTime * 1000; // ms
      }
    });

    // 대역폭 계산 (간단한 추정)
    const bandwidth = (totalBytesReceived / 1024 / 1024) * 8; // Mbps (간단한 추정)
    
    // 패킷 손실률 계산
    const packetLoss = totalPacketsReceived > 0
      ? (totalPacketsLost / (totalPacketsReceived + totalPacketsLost)) * 100
      : 0;

    // 품질 등급 결정
    let quality: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
    
    if (bandwidth < 1 || rtt > 200 || packetLoss > 5) {
      quality = 'poor';
    } else if (bandwidth < 2 || rtt > 150 || packetLoss > 3) {
      quality = 'fair';
    } else if (bandwidth < 5 || rtt > 100 || packetLoss > 1) {
      quality = 'good';
    }

    return {
      bandwidth,
      latency: rtt,
      packetLoss,
      quality,
    };
  }

  /**
   * 품질 변경 콜백 설정
   */
  onQualityChange(callback: (quality: NetworkQuality) => void) {
    this.onQualityChangeCallback = callback;
  }

  /**
   * 비디오 품질 조절 제안
   */
  getRecommendedVideoSettings(quality: NetworkQuality): {
    width: number;
    height: number;
    frameRate: number;
    bitrate: number;
  } {
    switch (quality.quality) {
      case 'excellent':
        return {
          width: 1920,
          height: 1080,
          frameRate: 30,
          bitrate: 2500000,
        };
      case 'good':
        return {
          width: 1280,
          height: 720,
          frameRate: 30,
          bitrate: 1500000,
        };
      case 'fair':
        return {
          width: 854,
          height: 480,
          frameRate: 24,
          bitrate: 800000,
        };
      case 'poor':
        return {
          width: 640,
          height: 360,
          frameRate: 15,
          bitrate: 400000,
        };
    }
  }
}

