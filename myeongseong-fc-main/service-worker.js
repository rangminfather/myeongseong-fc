const APP_VERSION = "1.0.2"; // 👈 여기만 올리면 캐시도 자동 교체됨
const CACHE_NAME = `mfc-cache-v${APP_VERSION}`;

const CORE_ASSETS = [
  "./",
  "./js/updates.js", // 이제 업데이트 내역을 확인합니다.
  "./index.html",
  "./css/style.css",
  "./js/data.js",
  "./js/attendance.js",
  "./js/manage.js",
  "./js/members.js",
  "./js/stats.js",
  "./js/app.js"
];

// 설치: 핵심 파일 캐시
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

// 활성화: 이전 버전 캐시 삭제
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// 요청 처리: 캐시 우선, 없으면 네트워크
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});


self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});