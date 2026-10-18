import { getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app'

/** 앱과 서비스 워커가 같은 설정을 쓴다. 값은 .env.local의 VITE_FIREBASE_*다. */
export const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId)

export function firebaseApp(): FirebaseApp {
  return getApps()[0] ?? initializeApp(firebaseConfig)
}

/** 서버가 보내는 data 전용 메시지. lattae-alert/alerts/services/push.py와 맞춘다. */
export interface MovePushData {
  title: string
  body: string
  link: string
  tag: string
  moveId: string
  code: string
  direction: 'up' | 'down'
}

export function toNotification(data: Record<string, string> | undefined): { title: string; options: NotificationOptions } | null {
  if (!data?.title) return null
  return {
    title: data.title,
    options: {
      body: data.body,
      tag: data.tag,
      icon: '/lattae-icon-192.png',
      badge: '/lattae-icon-192.png',
      data: { link: data.link, moveId: data.moveId },
    },
  }
}
