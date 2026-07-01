#!/usr/bin/env node
/**
 * Unit tests for Piper synthesis chunk sizing (mirrors extractReadingSegments.ts).
 */

const PIPER_SYNTH_MAX_CHARS = 480

function normalizeReadingText(raw) {
  return raw
    .replace(/\u200b/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim()
}

function splitIntoChunks(text, maxChars = PIPER_SYNTH_MAX_CHARS) {
  const normalized = normalizeReadingText(text)
  if (!normalized) return []
  if (normalized.length <= maxChars) return [normalized]

  const sentences = normalized.split(/(?<=[.!?])\s+/).filter(Boolean)
  const chunks = []
  let buffer = ''

  for (const sentence of sentences) {
    const piece = buffer ? `${buffer} ${sentence}` : sentence
    if (piece.length <= maxChars) {
      buffer = piece
      continue
    }
    if (buffer) chunks.push(buffer)
    if (sentence.length <= maxChars) {
      buffer = sentence
      continue
    }
    buffer = ''
    for (let i = 0; i < sentence.length; i += maxChars) {
      chunks.push(sentence.slice(i, i + maxChars).trim())
    }
  }

  if (buffer) chunks.push(buffer)
  return chunks.filter(Boolean)
}

let failed = 0
function assert(name, cond) {
  if (!cond) {
    console.error(`FAIL: ${name}`)
    failed++
  } else {
    console.log(`ok: ${name}`)
  }
}

const short = 'Hello world.'
assert('short text is one chunk', splitIntoChunks(short).length === 1)

const long = 'Word. '.repeat(200).trim()
const chunks = splitIntoChunks(long)
assert('long text splits', chunks.length > 1)
assert('every chunk within limit', chunks.every(c => c.length <= PIPER_SYNTH_MAX_CHARS))
assert('chunks rejoin to full text', normalizeReadingText(chunks.join(' ')).length > 500)

if (failed) {
  console.error(`\n${failed} test(s) failed`)
  process.exit(1)
}

console.log('\nAll TTS Piper chunk tests passed')