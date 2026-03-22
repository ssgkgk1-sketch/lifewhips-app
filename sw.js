const CACHE_NAME = 'lifewhips-v1';
const urlsToCache = [
  './lifewhips.html',
  './manifest.json'
];

// 설치 이벤트
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// 활성화 이벤트
self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

// 페치 이벤트 - 네트워크 우선, 캐시 폴백
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 성공한 응답을 캐시에 저장
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // 네트워크 실패시 캐시에서 가져오기
        return caches.match(event.request)
          .then(response => {
            return response || new Response('오프라인 상태입니다. 나중에 다시 시도해주세요.', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});
