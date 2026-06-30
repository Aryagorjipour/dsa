#!/usr/bin/env node
/**
 * Post-build checks for PWA artifacts in .vitepress/dist
 */

import fs from 'node:fs'
import path from 'node:path'

const DIST = path.resolve('.vitepress/dist')
const MAX_PRECACHE_BYTES = 50 * 1024 * 1024

let failed = 0

function fail(msg) {
  console.error(`  ✗ ${msg}`)
  failed++
}

function pass(msg) {
  console.log(`  ✓ ${msg}`)
}

function findFile(dir, pattern) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      const nested = findFile(full, pattern)
      if (nested) return nested
    } else if (pattern.test(entry.name)) {
      return full
    }
  }
  return null
}

console.log('verify-pwa-build\n')

if (!fs.existsSync(DIST)) {
  fail('.vitepress/dist not found — run docs:build first')
  process.exit(1)
}

const manifestPath = path.join(DIST, 'manifest.webmanifest')
if (!fs.existsSync(manifestPath)) {
  fail('manifest.webmanifest missing')
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  if (manifest.start_url !== '/dsa/') fail(`start_url is ${manifest.start_url}, expected /dsa/`)
  else pass('manifest start_url is /dsa/')

  const sizes = new Set((manifest.icons || []).map(i => i.sizes))
  if (!sizes.has('192x192') || !sizes.has('512x512')) {
    fail('manifest missing 192x192 or 512x512 icons')
  } else {
    pass('manifest has required icon sizes')
  }

  const purposes = new Set((manifest.icons || []).map(i => i.purpose || 'any'))
  if (!purposes.has('any') || !purposes.has('maskable')) {
    fail('manifest missing separate any and maskable icon purposes')
  } else {
    pass('manifest has any + maskable icon purposes')
  }

  if (manifest.theme_color !== '#6366f1') {
    fail(`manifest theme_color is ${manifest.theme_color}, expected #6366f1`)
  } else {
    pass('manifest theme_color matches brand')
  }
}

const swRoot = path.join(DIST, 'sw.js')
const swFile = fs.existsSync(swRoot)
  ? swRoot
  : findFile(DIST, /^workbox-.*\.js$/)
if (!swFile) {
  fail('service worker JS not found in dist')
} else {
  pass(`service worker found: ${path.basename(swFile)}`)
  const swText = fs.readFileSync(swFile, 'utf8')
  const required = ['index.html', '404.html', 'offline-shell.html', 'examples-manifest.json', 'playground.html']
  for (const item of required) {
    if (!swText.includes(item)) fail(`precache manifest missing ${item}`)
    else pass(`precache includes ${item}`)
  }
}

const cleanUrlsHelper = path.join(DIST, 'sw-clean-urls.js')
if (!fs.existsSync(cleanUrlsHelper)) {
  fail('sw-clean-urls.js missing from dist')
} else {
  pass('sw-clean-urls.js copied to dist')
  const helperText = fs.readFileSync(cleanUrlsHelper, 'utf8')
  if (helperText.includes("new Response('Offline'")) {
    fail('sw-clean-urls.js still returns bare Offline text')
  } else {
    pass('sw-clean-urls.js uses HTML fallbacks instead of bare Offline')
  }
}

const requiredPublicAssets = [
  'icons/icon-192.png',
  'icons/icon-512.png',
  'favicon.ico',
  'favicon.svg',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'apple-touch-icon.png',
  'logo.png',
  'logo.svg',
  'robots.txt',
]
for (const asset of requiredPublicAssets) {
  const full = path.join(DIST, asset)
  if (!fs.existsSync(full)) fail(`missing dist asset: ${asset}`)
  else pass(`dist asset present: ${asset}`)
}

function distHasWasmAsset() {
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (walk(full)) return true
      } else if (/ort-wasm-simd-threaded\.jsep.*\.wasm$/i.test(entry.name)) {
        return true
      }
    }
    return false
  }
  return walk(DIST)
}

const sitemap = path.join(DIST, 'sitemap.xml')
if (!fs.existsSync(sitemap)) {
  fail('sitemap.xml missing from dist')
} else {
  pass('sitemap.xml present in dist')
}

if (!distHasWasmAsset()) {
  fail('dist missing bundled ort-wasm-simd-threaded.jsep.wasm asset')
} else {
  pass('dist includes ONNX wasm asset (Vite ?url bundle)')
}

let totalBytes = 0
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (!entry.name.endsWith('.wasm') && !entry.name.endsWith('.data')) {
      // Piper/ONNX WASM + espeak data are lazy-loaded — not precached (5 MB SW limit).
      totalBytes += fs.statSync(full).size
    }
  }
}
walk(DIST)
if (totalBytes > MAX_PRECACHE_BYTES) {
  fail(`dist size ${(totalBytes / 1024 / 1024).toFixed(1)} MB exceeds ${MAX_PRECACHE_BYTES / 1024 / 1024} MB ceiling`)
} else {
  pass(`dist size ${(totalBytes / 1024 / 1024).toFixed(1)} MB within limit`)
}

console.log(failed ? `\n${failed} check(s) failed` : '\nAll PWA build checks passed')
process.exit(failed > 0 ? 1 : 0)