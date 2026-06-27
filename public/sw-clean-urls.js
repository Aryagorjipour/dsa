/**
 * Maps VitePress clean URLs to precached .html entries for offline navigation.
 * Loaded via workbox.importScripts in the generated service worker.
 */
const BASE = '/dsa'

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener(
  'fetch',
  (event) => {
    if (event.request.method !== 'GET') return
    if (event.request.mode !== 'navigate') return

    const url = new URL(event.request.url)
    if (!url.pathname.startsWith(BASE)) return

    event.respondWith(resolveNavigation(event.request))
  },
  { capture: true },
)

async function resolveNavigation(request) {
  const url = new URL(request.url)
  const candidates = buildCandidates(url.pathname)

  for (const candidate of candidates) {
    const match = await caches.match(candidate)
    if (match) return match
  }

  const fallback = await caches.match(`${BASE}/404.html`)
  if (fallback) return fallback

  try {
    return await fetch(request)
  } catch {
    return fallback || new Response('Offline', { status: 503, statusText: 'Offline' })
  }
}

function buildCandidates(pathname) {
  let path = pathname
  if (path.endsWith('/') && path.length > BASE.length + 1) {
    path = path.slice(0, -1)
  }

  if (path === BASE || path === `${BASE}/`) {
    return [`${BASE}/index.html`, `${BASE}.html`]
  }

  return [`${path}.html`, `${path}/index.html`]
}