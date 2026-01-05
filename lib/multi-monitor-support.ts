/**
 * 다중 모니터 지원
 * 여러 모니터 중 선택하여 화면 공유
 */

export interface MonitorInfo {
  id: string;
  name: string;
  width: number;
  height: number;
  isPrimary: boolean;
}

export class MultiMonitorSupport {
  /**
   * 사용 가능한 모니터 목록 가져오기
   */
  static async getAvailableMonitors(): Promise<MonitorInfo[]> {
    try {
      // getDisplayMedia API를 사용하여 모니터 선택
      // 실제로는 사용자가 브라우저에서 직접 선택
      const monitors: MonitorInfo[] = [];

      // 기본 모니터 정보
      monitors.push({
        id: 'primary',
        name: '주 모니터',
        width: window.screen.width,
        height: window.screen.height,
        isPrimary: true,
      });

      // 추가 모니터는 사용자가 선택할 때 감지
      return monitors;
    } catch (error) {
      console.error('모니터 정보 가져오기 오류:', error);
      return [];
    }
  }

  /**
   * 특정 모니터로 화면 공유 시작
   */
  static async startScreenShareForMonitor(
    monitorId: string,
    videoElement: HTMLVideoElement
  ): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        } as MediaTrackConstraints,
        audio: true,
      });

      // 선택된 모니터 정보 확인
      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();

      videoElement.srcObject = stream;

      return stream;
    } catch (error) {
      console.error('모니터 화면 공유 오류:', error);
      throw error;
    }
  }

  /**
   * 모든 모니터 동시 공유 (그리드 뷰)
   */
  static async startAllMonitorsShare(
    videoElements: HTMLVideoElement[]
  ): Promise<MediaStream[]> {
    const streams: MediaStream[] = [];

    try {
      // 각 모니터별로 화면 공유 시작
      // 실제로는 한 번에 하나의 모니터만 공유 가능하므로
      // 사용자가 여러 번 선택하도록 안내
      
      for (let i = 0; i < videoElements.length; i++) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always',
            displaySurface: 'monitor',
          } as MediaTrackConstraints,
          audio: false,
        });

        videoElements[i].srcObject = stream;
        streams.push(stream);
      }

      return streams;
    } catch (error) {
      console.error('다중 모니터 공유 오류:', error);
      // 이미 시작된 스트림 정리
      streams.forEach(stream => {
        stream.getTracks().forEach(track => track.stop());
      });
      throw error;
    }
  }

  /**
   * 모니터 전환
   */
  static async switchMonitor(
    currentStream: MediaStream,
    newMonitorId: string,
    videoElement: HTMLVideoElement
  ): Promise<MediaStream> {
    // 현재 스트림 중지
    currentStream.getTracks().forEach(track => track.stop());

    // 새 모니터로 전환
    return await this.startScreenShareForMonitor(newMonitorId, videoElement);
  }
}

