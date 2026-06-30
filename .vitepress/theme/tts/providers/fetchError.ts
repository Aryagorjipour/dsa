export async function readApiError(res: Response): Promise<string> {
  try {
    const body = await res.json()
    const msg = body?.error?.message ?? body?.message ?? body?.detail
    if (typeof msg === 'string' && msg.trim()) return msg.trim()
  } catch {
    /* ignore */
  }
  if (res.status === 0 || res.type === 'opaque') {
    return 'Network blocked — API may not allow browser requests (try a proxy base URL)'
  }
  return `Request failed (${res.status})`
}

export function isLikelyCorsError(err: unknown): boolean {
  if (err instanceof TypeError && /fetch|network/i.test(err.message)) return true
  return false
}