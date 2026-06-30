#!/usr/bin/env node
/**
 * Unit tests for TTS word tokenization (mirrors wordHighlight.ts).
 */

function normalizeReadingText(raw) {
  return raw
    .replace(/\u200b/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim()
}

function tokenizeWords(text) {
  const normalized = normalizeReadingText(text)
  const words = []
  const re = /\S+/g
  let match
  while ((match = re.exec(normalized)) !== null) {
    words.push({ text: match[0], start: match.index, end: match.index + match[0].length })
  }
  return words
}

function wordIndexAtRatio(wordCount, ratio) {
  if (wordCount <= 0) return 0
  const clamped = Math.max(0, Math.min(1, ratio))
  return Math.min(wordCount - 1, Math.floor(clamped * wordCount))
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

const words = tokenizeWords('Hello world, again.')
assert('tokenize finds three words', words.length === 3)
assert('first token text', words[0].text === 'Hello')
assert('ratio zero is first word', wordIndexAtRatio(10, 0) === 0)
assert('ratio maps to middle', wordIndexAtRatio(10, 0.55) === 5)
assert('ratio clamps at end', wordIndexAtRatio(10, 1) === 9)

if (failed) {
  console.error(`\n${failed} test(s) failed`)
  process.exit(1)
}

console.log('\nAll TTS word tests passed')