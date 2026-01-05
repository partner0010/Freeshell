/**
 * 원격 제어 이벤트 핸들러
 * 마우스 및 키보드 이벤트를 원격으로 전송하고 처리
 */

export interface RemoteMouseEvent {
  type: 'mousedown' | 'mouseup' | 'mousemove' | 'click' | 'dblclick' | 'contextmenu' | 'wheel';
  x: number;
  y: number;
  button?: number; // 0: left, 1: middle, 2: right
  deltaX?: number;
  deltaY?: number;
  deltaZ?: number;
}

export interface RemoteKeyboardEvent {
  type: 'keydown' | 'keyup' | 'keypress';
  key: string;
  code: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

export class RemoteControlHandler {
  private dataChannel: RTCDataChannel | null = null;
  private isEnabled: boolean = false;
  private videoElement: HTMLVideoElement | null = null;
  private onControlCallback?: (enabled: boolean) => void;

  constructor(dataChannel: RTCDataChannel, videoElement: HTMLVideoElement) {
    this.dataChannel = dataChannel;
    this.videoElement = videoElement;
    this.setupDataChannel();
  }

  private setupDataChannel() {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      console.log('원격 제어 데이터 채널이 열렸습니다.');
    };

    this.dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleRemoteControl(data);
      } catch (error) {
        console.error('원격 제어 메시지 파싱 오류:', error);
      }
    };

    this.dataChannel.onerror = (error) => {
      console.error('원격 제어 데이터 채널 오류:', error);
    };
  }

  /**
   * 원격 제어 활성화/비활성화
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (enabled) {
      this.attachEventListeners();
    } else {
      this.detachEventListeners();
    }
    if (this.onControlCallback) {
      this.onControlCallback(enabled);
    }
  }

  /**
   * 이벤트 리스너 연결
   */
  private attachEventListeners() {
    if (!this.videoElement) return;

    this.videoElement.addEventListener('mousedown', this.handleMouseDown);
    this.videoElement.addEventListener('mouseup', this.handleMouseUp);
    this.videoElement.addEventListener('mousemove', this.handleMouseMove);
    this.videoElement.addEventListener('click', this.handleClick);
    this.videoElement.addEventListener('dblclick', this.handleDoubleClick);
    this.videoElement.addEventListener('contextmenu', this.handleContextMenu);
    this.videoElement.addEventListener('wheel', this.handleWheel);
    this.videoElement.addEventListener('keydown', this.handleKeyDown);
    this.videoElement.addEventListener('keyup', this.handleKeyUp);
    this.videoElement.setAttribute('tabindex', '0');
    this.videoElement.focus();
  }

  /**
   * 이벤트 리스너 제거
   */
  private detachEventListeners() {
    if (!this.videoElement) return;

    this.videoElement.removeEventListener('mousedown', this.handleMouseDown);
    this.videoElement.removeEventListener('mouseup', this.handleMouseUp);
    this.videoElement.removeEventListener('mousemove', this.handleMouseMove);
    this.videoElement.removeEventListener('click', this.handleClick);
    this.videoElement.removeEventListener('dblclick', this.handleDoubleClick);
    this.videoElement.removeEventListener('contextmenu', this.handleContextMenu);
    this.videoElement.removeEventListener('wheel', this.handleWheel);
    this.videoElement.removeEventListener('keydown', this.handleKeyDown);
    this.videoElement.removeEventListener('keyup', this.handleKeyUp);
  }

  /**
   * 화면 좌표를 원격 화면 좌표로 변환
   */
  private getRemoteCoordinates(clientX: number, clientY: number): { x: number; y: number } {
    if (!this.videoElement) return { x: 0, y: 0 };

    const rect = this.videoElement.getBoundingClientRect();
    const videoWidth = this.videoElement.videoWidth || rect.width;
    const videoHeight = this.videoElement.videoHeight || rect.height;

    const x = Math.round((clientX - rect.left) * (videoWidth / rect.width));
    const y = Math.round((clientY - rect.top) * (videoHeight / rect.height));

    return { x, y };
  }

  private handleMouseDown = (e: globalThis.MouseEvent) => {
    if (!this.isEnabled || !this.dataChannel) return;
    const { x, y } = this.getRemoteCoordinates(e.clientX, e.clientY);
    this.sendMouseEvent({
      type: 'mousedown',
      x,
      y,
      button: e.button,
    });
  };

  private handleMouseUp = (e: globalThis.MouseEvent) => {
    if (!this.isEnabled || !this.dataChannel) return;
    const { x, y } = this.getRemoteCoordinates(e.clientX, e.clientY);
    this.sendMouseEvent({
      type: 'mouseup',
      x,
      y,
      button: e.button,
    });
  };

  private handleMouseMove = (e: globalThis.MouseEvent) => {
    if (!this.isEnabled || !this.dataChannel) return;
    const { x, y } = this.getRemoteCoordinates(e.clientX, e.clientY);
    this.sendMouseEvent({
      type: 'mousemove',
      x,
      y,
    });
  };

  private handleClick = (e: globalThis.MouseEvent) => {
    if (!this.isEnabled || !this.dataChannel) return;
    const { x, y } = this.getRemoteCoordinates(e.clientX, e.clientY);
    this.sendMouseEvent({
      type: 'click',
      x,
      y,
      button: e.button,
    });
  };

  private handleDoubleClick = (e: globalThis.MouseEvent) => {
    if (!this.isEnabled || !this.dataChannel) return;
    const { x, y } = this.getRemoteCoordinates(e.clientX, e.clientY);
    this.sendMouseEvent({
      type: 'dblclick',
      x,
      y,
      button: e.button,
    });
  };

  private handleContextMenu = (e: globalThis.MouseEvent) => {
    if (!this.isEnabled || !this.dataChannel) return;
    e.preventDefault();
    const { x, y } = this.getRemoteCoordinates(e.clientX, e.clientY);
    this.sendMouseEvent({
      type: 'contextmenu',
      x,
      y,
      button: e.button,
    });
  };

  private handleWheel = (e: WheelEvent) => {
    if (!this.isEnabled || !this.dataChannel) return;
    e.preventDefault();
    const { x, y } = this.getRemoteCoordinates(e.clientX, e.clientY);
    this.sendMouseEvent({
      type: 'wheel',
      x,
      y,
      deltaX: e.deltaX,
      deltaY: e.deltaY,
      deltaZ: e.deltaZ,
    });
  };

  private handleKeyDown = (e: globalThis.KeyboardEvent) => {
    if (!this.isEnabled || !this.dataChannel) return;
    this.sendKeyboardEvent({
      type: 'keydown',
      key: e.key,
      code: e.code,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
      metaKey: e.metaKey,
    });
  };

  private handleKeyUp = (e: globalThis.KeyboardEvent) => {
    if (!this.isEnabled || !this.dataChannel) return;
    this.sendKeyboardEvent({
      type: 'keyup',
      key: e.key,
      code: e.code,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
      metaKey: e.metaKey,
    });
  };

  /**
   * 마우스 이벤트 전송
   */
  private sendMouseEvent(event: RemoteMouseEvent) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      const { type, ...eventData } = event;
      this.dataChannel.send(JSON.stringify({
        type: 'mouse',
        eventType: type,
        ...eventData,
      }));
    }
  }

  /**
   * 키보드 이벤트 전송
   */
  private sendKeyboardEvent(event: RemoteKeyboardEvent) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      const { type, ...eventData } = event;
      this.dataChannel.send(JSON.stringify({
        type: 'keyboard',
        eventType: type,
        ...eventData,
      }));
    }
  }

  /**
   * 원격 제어 메시지 처리 (호스트 측)
   */
  private handleRemoteControl(data: any) {
    // 실제 원격 제어는 서버 측에서 처리해야 함
    // 여기서는 이벤트만 전달
    console.log('원격 제어 이벤트 수신:', data);
  }

  /**
   * 콜백 설정
   */
  onControlChange(callback: (enabled: boolean) => void) {
    this.onControlCallback = callback;
  }

  /**
   * 정리
   */
  destroy() {
    this.setEnabled(false);
    this.dataChannel = null;
    this.videoElement = null;
  }
}

