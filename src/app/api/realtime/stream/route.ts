/**
 * 실시간 이벤트 스트림 API (Server-Sent Events)
 */

import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const stream = new ReadableStream({
    start(controller) {
      const { eventStreamManager } = require('@/lib/realtime/event-stream');
      
      // 클라이언트 등록
      eventStreamManager.addClient(clientId, controller);

      // 연결 유지용 하트비트
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': heartbeat\n\n'));
        } catch (error) {
          clearInterval(heartbeat);
          eventStreamManager.removeClient(clientId);
        }
      }, 30000); // 30초마다

      // 연결 종료 시 정리
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        eventStreamManager.removeClient(clientId);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

