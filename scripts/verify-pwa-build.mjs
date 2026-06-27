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
  const required = ['index.html', '404.html', 'examples-manifest.json', 'playground.html']
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
}

const icon192 = path.join(DIST, 'icons/icon-192.png')
const icon512 = path.join(DIST, 'icons/icon-512.png')
if (!fs.existsSync(icon192) || !fs.existsSync(icon512)) {
  fail('PWA icons missing from dist')
} else {
  pass('PWA icons present in dist')
}

let totalBytes = 0
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else totalBytes += fs.statSync(full).size
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