const CACHE_NAME = 'freeshell-v2';
const STATIC_CACHE_NAME = 'freeshell-static-v2';
const urlsToCache = [
  '/',
  '/editor',
  '/creator',
  '/agents',
  '/manifest.json',
];

// 캐시 전략: Network First, Cache Fallback
const networkFirst = async (request: Request) => {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
};

// 캐시 전략: Cache First (정적 자산)
const cacheFirst = async (request: Request) => {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // 오프라인 페이지 반환
    return new Response('오프라인 상태입니다.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
};

// 설치 이벤트
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('캐시 열기');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// 활성화 이벤트
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('오래된 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch 이벤트 (최적화된 캐싱 전략)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API 요청은 네트워크 우선
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 정적 자산은 캐시 우선
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot)$/)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML 페이지는 네트워크 우선
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 기타는 기본 전략
  event.respondWith(networkFirst(request));
});

// 푸시 알림
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'GRIP';
  const options = {
    body: data.body || '새로운 알림이 있습니다',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 알림 클릭
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// 백그라운드 동기화 (Background Sync API)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-queue') {
    event.waitUntil(syncOfflineQueue());
  }
});

// 오프라인 큐 동기화 함수
async function syncOfflineQueue() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    
    // 오프라인 큐에서 대기 중인 작업 처리
    // 실제 구현은 IndexedDB에서 큐를 가져와 처리
    console.log('[Service Worker] 오프라인 큐 동기화 시작');
  } catch (error) {
    console.error('[Service Worker] 오프라인 큐 동기화 실패:', error);
  }
}

// 메시지 수신 (클라이언트에서 Service Worker로)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'SYNC_OFFLINE_QUEUE') {
    event.waitUntil(syncOfflineQueue());
  }
});

