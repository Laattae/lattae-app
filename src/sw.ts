/// <reference lib="webworker" />
import { initializeApp } from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'
import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute, type PrecacheEntry } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { firebaseConfig, firebaseConfigured, toNotification } from './lib/firebase'

declare let self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<PrecacheEntry | string> }

// 이전 generateSW 설정과 같은 동작: 프리캐시 + SPA 내비게이션 폴백, autoUpdate
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')))
self.skipWaiting()
clientsClaim()

// 급등락 푸시. 서버는 data 전용 메시지를 보내고 표시는 여기서 한다.
if (firebaseConfigured) {
  onBackgroundMessage(getMessaging(initializeApp(firebaseConfig)), (payload) => {
    const notification = toNotification(payload.data)
    if (notification) return self.registration.showNotification(notification.title, notification.options)
  })
}

/** 링크는 경로만 쓰고 출처는 항상 이 앱으로 고정한다. */
function sameOriginPath(link: unknown): string {
  try {
    const url = new URL(String(link), self.location.origin)
    return `${url.pathname}${url.search}`
  } catch {
    return '/'
  }
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = new URL(sameOriginPath(event.notification.data?.link), self.location.origin).href
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      const client = windows.find((item) => new URL(item.url).origin === self.location.origin)
      if (client) {
        try {
          // focus는 클릭 직후 짧은 시간에만 허용된다. navigate(페이지 로드)를 기다리기 전에 먼저 부른다.
          const focused = await client.focus()
          await focused.navigate(target)
          return
        } catch {
          // 이 SW가 제어하지 않는 창이면 navigate가 거부된다. 그때는 새 창으로 연다.
        }
      }
      await self.clients.openWindow(target)
    })(),
  )
})
