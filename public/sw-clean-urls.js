/**
 * Maps VitePress clean URLs to precached .html entries for offline navigation.
 * Loaded via workbox.importScripts in the generated service worker.
 */
const BASE = '/dsa'
const SW_VERSION = '2'

const SHELL_FALLBACKS = [
  `${BASE}/index.html`,
  `${BASE}/offline-shell.html`,
  `${BASE}/404.html`,
]

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  if (event.request.mode !== 'navigate') return

  const url = new URL(event.request.url)
  if (!url.pathname.startsWith(BASE)) return

  event.respondWith(resolveNavigation(event.request))
})

function toAbsoluteUrl(path) {
  if (path instanceof Request) return path.url
  if (typeof path === 'string' && path.startsWith('http')) return path
  const base = self.registration?.scope || `${self.location.origin}${BASE}/`
  return new URL(path, base).href
}

function pathnameOf(input) {
  try {
    return new URL(toAbsoluteUrl(input)).pathname
  } catch {
    return String(input)
  }
}

async function findInAnyCache(pathOrUrl) {
  const absolute = toAbsoluteUrl(pathOrUrl)
  const pathname = pathnameOf(absolute)

  const lookupKeys = [
    absolute,
    pathname,
    new Request(absolute, { method: 'GET' }),
    new Request(absolute, { method: 'GET', mode: 'navigate' }),
  ]

  for (const key of lookupKeys) {
    const hit = await caches.match(key, { ignoreSearch: true })
    if (hit) return hit
  }

  const cacheNames = await caches.keys()
  for (const name of cacheNames) {
    const cache = await caches.open(name)
    for (const key of lookupKeys) {
      const hit = await cache.match(key, { ignoreSearch: true })
      if (hit) return hit
    }

    const requests = await cache.keys()
    for (const req of requests) {
      if (pathnameOf(req.url) === pathname) {
        const hit = await cache.match(req)
        if (hit) return hit
      }
    }
  }

  return null
}

async function resolveNavigation(request) {
  const url = new URL(request.url)

  const direct = await findInAnyCache(request.url)
  if (direct) return direct

  const candidates = buildCandidates(url.pathname)
  for (const candidate of candidates) {
    const match = await findInAnyCache(candidate)
    if (match) return match
  }

  for (const fallback of SHELL_FALLBACKS) {
    const match = await findInAnyCache(fallback)
    if (match) return match
  }

  try {
    return await fetch(request)
  } catch {
    for (const fallback of SHELL_FALLBACKS) {
      const match = await findInAnyCache(fallback)
      if (match) return match
    }
    return offlineShellResponse()
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

function offlineShellResponse() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#6366f1">
  <title>DSA Handbook</title>
  <style>
    body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: #0f172a; color: #e2e8f0; font-family: system-ui, sans-serif; text-align: center; padding: 24px; }
    p { margin: 8px 0; line-height: 1.5; }
    a { color: #818cf8; }
  </style>
</head>
<body>
  <div>
    <p><strong>DSA Handbook</strong></p>
    <p id="status">Restoring offline access…</p>
    <p><a href="${BASE}/">Open handbook home</a></p>
  </div>
  <script>
    (async function () {
      const status = document.getElementById('status')
      const home = '${BASE}/'
      try {
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.getRegistration()
          if (reg) await reg.update()
          await navigator.serviceWorker.ready
        }
        const cached = await caches.match(home + 'index.html') || await caches.match(home)
        if (cached) {
          status.textContent = 'Loading cached handbook…'
          location.replace(location.pathname + location.search)
          return
        }
      } catch (e) { /* ignore */ }
      status.textContent = 'Visit once online so pages are cached, then refresh.'
      setTimeout(function () { location.reload() }, 1500)
    })()
  </script>
</body>
</html>`
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}