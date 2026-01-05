/**
 * 비디오 품질 자동 조절
 * 네트워크 상태에 따라 해상도 및 프레임레이트 자동 조절
 */

export interface VideoQuality {
  width: number;
  height: number;
  frameRate: number;
  bitrate: number;
}

export class VideoQualityAdapter {
  private currentQuality: VideoQuality = {
    width: 1920,
    height: 1080,
    frameRate: 30,
    bitrate: 2500000,
  };

  private videoTrack: MediaStreamTrack | null = null;
  private onQualityChangeCallback?: (quality: VideoQuality) => void;

  constructor(videoTrack: MediaStreamTrack) {
    this.videoTrack = videoTrack;
  }

  /**
   * 품질 조절
   */
  async adjustQuality(quality: VideoQuality) {
    if (!this.videoTrack) return;

    try {
      await this.videoTrack.applyConstraints({
        width: { ideal: quality.width },
        height: { ideal: quality.height },
        frameRate: { ideal: quality.frameRate },
      });

      this.currentQuality = quality;

      if (this.onQualityChangeCallback) {
        this.onQualityChangeCallback(quality);
      }
    } catch (error) {
      console.error('품질 조절 오류:', error);
    }
  }

  /**
   * 네트워크 상태에 따른 자동 품질 조절
   */
  async autoAdjustQuality(networkQuality: {
    bandwidth: number;
    latency: number;
    packetLoss: number;
  }) {
    let quality: VideoQuality;

    if (networkQuality.bandwidth < 1 || networkQuality.latency > 200 || networkQuality.packetLoss > 5) {
      // 낮은 품질
      quality = {
        width: 640,
        height: 360,
        frameRate: 15,
        bitrate: 400000,
      };
    } else if (networkQuality.bandwidth < 2 || networkQuality.latency > 150 || networkQuality.packetLoss > 3) {
      // 보통 품질
      quality = {
        width: 854,
        height: 480,
        frameRate: 24,
        bitrate: 800000,
      };
    } else if (networkQuality.bandwidth < 5 || networkQuality.latency > 100 || networkQuality.packetLoss > 1) {
      // 좋은 품질
      quality = {
        width: 1280,
        height: 720,
        frameRate: 30,
        bitrate: 1500000,
      };
    } else {
      // 최고 품질
      quality = {
        width: 1920,
        height: 1080,
        frameRate: 30,
        bitrate: 2500000,
      };
    }

    await this.adjustQuality(quality);
  }

  /**
   * 품질 변경 콜백 설정
   */
  onQualityChange(callback: (quality: VideoQuality) => void) {
    this.onQualityChangeCallback = callback;
  }

  /**
   * 현재 품질 가져오기
   */
  getCurrentQuality(): VideoQuality {
    return { ...this.currentQuality };
  }
}

