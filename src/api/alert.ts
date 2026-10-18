/**
 * lattae-alert(Django) 경계다. 푸시 토큰과 구독 종목만 다룬다.
 */
const baseUrl = (import.meta.env.VITE_ALERT_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '')

export async function registerDevice(token: string, codes: string[]): Promise<void> {
  const res = await fetch(`${baseUrl}/v1/devices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, codes }),
  })
  if (!res.ok) throw new Error(`registerDevice ${res.status}`)
}

export async function unregisterDevice(token: string): Promise<void> {
  const res = await fetch(`${baseUrl}/v1/devices/${encodeURIComponent(token)}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`unregisterDevice ${res.status}`)
}
