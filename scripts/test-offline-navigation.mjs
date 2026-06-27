#!/usr/bin/env node
/**
 * Unit tests for offline navigation candidate paths (mirrors sw-clean-urls.js).
 */

import fs from 'node:fs'
import path from 'node:path'

let failed = 0

function assert(cond, msg) {
  if (!cond) {
    console.error(`  ✗ ${msg}`)
    failed++
  } else {
    console.log(`  ✓ ${msg}`)
  }
}

const BASE = '/dsa'

function buildCandidates(pathname) {
  let p = pathname
  if (p.endsWith('/') && p.length > BASE.length + 1) {
    p = p.slice(0, -1)
  }
  if (p === BASE || p === `${BASE}/`) {
    return [`${BASE}/index.html`, `${BASE}.html`]
  }
  return [`${p}.html`, `${p}/index.html`]
}

console.log('test-offline-navigation\n')

const home = buildCandidates('/dsa/')
assert(home.includes('/dsa/index.html'), 'home maps to index.html')

const page = buildCandidates('/dsa/fundamentals/00-what-is-a-data-structure')
assert(page[0] === '/dsa/fundamentals/00-what-is-a-data-structure.html', 'clean URL maps to .html')

const swPath = path.resolve('public/sw-clean-urls.js')
const swText = fs.readFileSync(swPath, 'utf8')
assert(!swText.includes("new Response('Offline'"), 'sw-clean-urls does not return bare Offline text')
assert(swText.includes('offline-shell.html'), 'sw-clean-urls references offline-shell.html')
assert(swText.includes('findInAnyCache'), 'sw-clean-urls searches all caches')
assert(!swText.includes('{ capture: true }'), 'sw-clean-urls does not block workbox with capture handler')
assert(swText.includes('toAbsoluteUrl'), 'sw-clean-urls resolves absolute precache URLs')

const shellPath = path.resolve('public/offline-shell.html')
assert(fs.existsSync(shellPath), 'offline-shell.html exists in public')

console.log(failed ? `\n${failed} check(s) failed` : '\nAll offline navigation checks passed')
process.exit(failed > 0 ? 1 : 0)