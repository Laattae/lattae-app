import { deleteToken, getMessaging, getToken, isSupported, onMessage, type Messaging } from 'firebase/messaging'
import { registerDevice, unregisterDevice } from '@/api/alert'
import { firebaseApp, firebaseConfigured, toNotification } from '@/lib/firebase'

/** lattae-alert에 마지막으로 등록한 토큰. 끌 때와 토큰이 바뀔 때 이 값으로 정리한다. */
const TOKEN_KEY = 'lattae.pushToken'

let messaging: Messaging | null = null
let listening = false
let inflight: Promise<void> | null = null

function storedToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function storeToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* 저장소를 못 쓰면 정리만 덜 된다 */
  }
}

async function serviceWorker(): Promise<ServiceWorkerRegistration> {
  const registration = await navigator.serviceWorker?.getRegistration()
  if (!registration) throw new Error('service worker not registered')
  return registration
}

async function ready(): Promise<Messaging> {
  if (!firebaseConfigured) throw new Error('firebase not configured')
  if (!(await isSupported())) throw new Error('push not supported')
  messaging ??= getMessaging(firebaseApp())
  return messaging
}

/** 알림 권한이 있는 상태에서 토큰을 받아 lattae-alert에 종목과 함께 등록한다. 동시에 한 번만 돈다. */
export function enablePush(codes: string[]): Promise<void> {
  const run = (inflight ?? Promise.resolve()).catch(() => {}).then(() => register(codes))
  inflight = run.finally(() => {
    if (inflight === run) inflight = null
  })
  return run
}

async function register(codes: string[]): Promise<void> {
  const m = await ready()
  const token = await getToken(m, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: await serviceWorker(),
  })
  await registerDevice(token, codes)
  const previous = storedToken()
  storeToken(token)
  if (previous && previous !== token) {
    await unregisterDevice(previous).catch((error) => console.warn('[push] old token cleanup failed', error))
  }
  listenForeground()
}

export async function disablePush(): Promise<void> {
  await inflight?.catch(() => {})
  const token = storedToken()
  if (token) await unregisterDevice(token)
  storeToken(null)
  await deleteToken(await ready())
}

/**
 * 앱 화면이 보이는 동안 온 메시지는 서비스 워커가 아니라 여기로 온다.
 * 백그라운드와 같은 모양으로 띄우고, 클릭은 서비스 워커의 notificationclick이 처리한다.
 */
export function listenForeground(): void {
  if (listening || !messaging) return
  listening = true
  onMessage(messaging, async (payload) => {
    const notification = toNotification(payload.data)
    if (!notification) return
    const registration = await serviceWorker()
    await registration.showNotification(notification.title, notification.options)
  })
}

/** 앱 시작 시 알림이 켜져 있으면 토큰을 다시 등록한다(토큰 교체 대비). 실패해도 화면에는 영향이 없다. */
export async function resumePush(codes: string[]): Promise<void> {
  if (!firebaseConfigured || !('Notification' in window) || Notification.permission !== 'granted') return
  try {
    await enablePush(codes)
  } catch (error) {
    console.warn('[push] resume failed', error)
  }
}
