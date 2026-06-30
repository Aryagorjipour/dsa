#!/usr/bin/env node
/**
 * Unit tests for cloud TTS provider helpers (mirrors providers/types.ts).
 */

function filterTtsModels(ids) {
  const ttsHints = /tts|speech|audio|preview-tts/i
  return ids.filter(id => ttsHints.test(id)).sort()
}

function normalizeBaseUrl(url) {
  return url.replace(/\/+$/, '')
}

let failed = 0

function assert(name, condition) {
  if (!condition) {
    console.error(`FAIL: ${name}`)
    failed += 1
  } else {
    console.log(`ok: ${name}`)
  }
}

const ids = ['gpt-4o', 'tts-1', 'gpt-4o-mini-tts', 'dall-e-3', 'gemini-2.5-flash-preview-tts']
const filtered = filterTtsModels(ids)
assert('filters tts models', filtered.length === 3)
assert('includes tts-1', filtered.includes('tts-1'))
assert('includes preview-tts', filtered.includes('gemini-2.5-flash-preview-tts'))
assert('excludes non-tts', !filtered.includes('gpt-4o'))
assert('sorted alphabetically', filtered[0] === 'gemini-2.5-flash-preview-tts')

assert('strips trailing slash', normalizeBaseUrl('https://api.openai.com/') === 'https://api.openai.com')
assert('strips multiple slashes', normalizeBaseUrl('https://proxy.example/v1///') === 'https://proxy.example/v1')

if (failed) {
  console.error(`\n${failed} test(s) failed`)
  process.exit(1)
}

console.log('\nAll TTS provider tests passed')