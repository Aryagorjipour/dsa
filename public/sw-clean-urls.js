/**
 * Maps VitePress clean URLs to precached .html entries for offline navigation.
 * Loaded via workbox.importScripts in the generated service worker.
 */
const BASE = '/dsa'

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
    const shell = await findInAnyCache(`${BASE}/offline-shell.html`)
    if (shell) return shell
    return offlineShellResponse()
  }
}

async function findInAnyCache(url) {
  const direct = await caches.match(url, { ignoreSearch: true })
  if (direct) return direct

  const keys = await caches.keys()
  for (const name of keys) {
    const cache = await caches.open(name)
    const match = await cache.match(url, { ignoreSearch: true })
    if (match) return match
  }
  return null
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
  <title>DSA Handbook — Offline</title>
  <style>
    body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: #0f172a; color: #e2e8f0; font-family: system-ui, sans-serif; text-align: center; padding: 24px; }
    p { margin: 8px 0; line-height: 1.5; }
  </style>
</head>
<body>
  <div>
    <p><strong>DSA Handbook</strong></p>
    <p>Loading offline content…</p>
    <p id="status">Waiting for cache…</p>
  </div>
  <script>
    (async function () {
      const status = document.getElementById('status')
      try {
        if ('serviceWorker' in navigator) {
          await navigator.serviceWorker.ready
          status.textContent = 'Retrying…'
          location.reload()
          return
        }
      } catch (e) { /* ignore */ }
      status.textContent = 'Go online once to cache the handbook, then try again.'
    })()
  </script>
</body>
</html>`
  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}