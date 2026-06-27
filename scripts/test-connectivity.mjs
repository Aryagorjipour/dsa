#!/usr/bin/env node
/**
 * Pure-logic tests for offline connectivity helpers.
 * Mirrors .vitepress/theme/utils/networkFeatures.ts
 */

const FEATURE_COPY = {
  wandbox: {
    title: 'Wandbox requires internet',
    message:
      'Code compilation runs on wandbox.org servers. You can still edit code and use saved snippets offline.',
    worksOffline: ['Edit and save code', 'Saved snippets', 'Copy code'],
  },
  chatgpt: {
    title: 'ChatGPT requires internet',
    message: 'Your prompt was copied to the clipboard. Connect to the internet to open ChatGPT.',
    worksOffline: ['Copy prompt to clipboard'],
  },
  'external-link': {
    title: 'This link requires internet',
    message: 'Connect to the internet to open this external page.',
    worksOffline: [],
  },
}

function requiresNetwork(_feature) {
  return true
}

function assertOnline(feature, isOnline) {
  if (isOnline) return { ok: true }
  const copy = FEATURE_COPY[feature]
  return { ok: false, title: copy.title, message: copy.message }
}

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    passed++
    console.log(`  ✓ ${name}`)
  } catch (err) {
    failed++
    console.error(`  ✗ ${name}`)
    console.error(`    ${err.message}`)
  }
}

console.log('test-connectivity\n')

test('requiresNetwork returns true for wandbox', () => {
  if (!requiresNetwork('wandbox')) throw new Error('expected true')
})

test('assertOnline passes when online', () => {
  const result = assertOnline('wandbox', true)
  if (!result.ok) throw new Error('expected ok: true')
})

test('assertOnline blocks wandbox when offline', () => {
  const result = assertOnline('wandbox', false)
  if (result.ok) throw new Error('expected ok: false')
  if (!result.title.includes('Wandbox')) throw new Error('title should mention Wandbox')
  if (!result.message.length) throw new Error('message should be non-empty')
})

test('assertOnline blocks chatgpt when offline', () => {
  const result = assertOnline('chatgpt', false)
  if (result.ok) throw new Error('expected ok: false')
  if (!result.title.includes('ChatGPT')) throw new Error('title should mention ChatGPT')
})

test('assertOnline blocks external-link when offline', () => {
  const result = assertOnline('external-link', false)
  if (result.ok) throw new Error('expected ok: false')
})

test('wandbox offline copy lists worksOffline items', () => {
  const copy = FEATURE_COPY.wandbox
  if (!copy.worksOffline.includes('Edit and save code')) {
    throw new Error('missing offline capability copy')
  }
})

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)