export const API_BASE = import.meta.env.VITE_API_URL as string | undefined

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE) {
    throw new Error('Brak VITE_API_URL – ustaw w .env.local')
  }
  const res = await fetch(API_BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`API ${res.status}: ${txt}`)
  }
  return res.json() as Promise<T>
}
