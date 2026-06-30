#!/usr/bin/env node
/**
 * Unit tests for handbook TTS text extraction (mirrors extractReadingSegments.ts).
 */

let failed = 0

function assert(cond, msg) {
  if (!cond) {
    console.error(`  ✗ ${msg}`)
    failed++
  } else {
    console.log(`  ✓ ${msg}`)
  }
}

const MAX_CHUNK_CHARS = 160
const CHARS_PER_SECOND = 12

function normalizeReadingText(raw) {
  return raw.replace(/\u200b/g, '').replace(/\s+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim()
}

function splitIntoChunks(text, maxChars = MAX_CHUNK_CHARS) {
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

function estimateSegmentMs(text, rate) {
  const len = normalizeReadingText(text).length
  if (!len) return 0
  const safeRate = Math.max(0.5, Math.min(2, rate))
  return Math.round((len / (CHARS_PER_SECOND * safeRate)) * 1000)
}

function resolveSegmentAtTime(segments, elapsedMs, rate) {
  if (!segments.length) return { index: 0, offsetMs: 0 }
  let acc = 0
  for (let i = 0; i < segments.length; i++) {
    const duration = estimateSegmentMs(segments[i].text, rate)
    if (elapsedMs < acc + duration) return { index: i, offsetMs: Math.max(0, elapsedMs - acc) }
    acc += duration
  }
  return { index: segments.length - 1, offsetMs: 0 }
}

const BLOCK_SELECTOR =
  '.vp-doc p, .vp-doc li, .vp-doc td, .vp-doc th, .vp-doc blockquote, .vp-doc h1, .vp-doc h2, .vp-doc h3, .vp-doc h4, .vp-doc h5, .vp-doc h6, .vp-doc .custom-block'

function hasSpeakableDescendant(block, allBlocks) {
  for (const descendant of allBlocks) {
    if (descendant.parent === block.el) return true
  }
  return false
}

function speakableBlockText(text, stripPlus = false) {
  let raw = text
  if (stripPlus) raw = raw.replace(/\s*\+\s*$/, '')
  return normalizeReadingText(raw)
}

function extractFromBlocks(blocks) {
  const segments = []
  for (const block of blocks) {
    if (hasSpeakableDescendant(block, blocks)) continue
    const chunks = splitIntoChunks(speakableBlockText(block.text, block.stripPlus))
    for (const chunk of chunks) {
      segments.push({ blockId: block.el, text: chunk })
    }
  }
  return segments
}

console.log('test-tts-extract\n')

assert(normalizeReadingText('  Hello   world.  ') === 'Hello world.', 'normalizes whitespace')
const chunks = splitIntoChunks('First sentence. Second sentence is here. Third!')
assert(chunks.length >= 1, 'splits into chunks')
assert(chunks.join(' ').includes('First sentence'), 'preserves sentence content')

const long = 'Word '.repeat(80)
const longChunks = splitIntoChunks(long)
assert(longChunks.every(c => c.length <= MAX_CHUNK_CHARS), 'respects max chunk size')

const segments = [
  { text: 'Hello world.' },
  { text: 'Another paragraph here.' },
]
const ms0 = estimateSegmentMs(segments[0].text, 1)
const at = resolveSegmentAtTime(segments, ms0 + 100, 1)
assert(at.index === 1, 'resolveSegmentAtTime finds second segment after first duration')

const nestedBlocks = [
  { el: 'blockquote', parent: null, text: 'A complete guide to Data Structures and Algorithms.' },
  { el: 'p', parent: 'blockquote', text: 'A complete guide to Data Structures and Algorithms.' },
  { el: 'p', parent: null, text: 'Tone promise: Professional but playful.' },
]
const nestedSegs = extractFromBlocks(nestedBlocks)
assert(nestedSegs.length === 2, 'blockquote+p dedupes to leaf blocks only')
assert(!nestedSegs.some(s => s.blockId === 'blockquote'), 'skips parent when child exists')
assert(speakableBlockText('Section title +', true) === 'Section title', 'strips heading + button text')

console.log(failed ? `\n${failed} check(s) failed` : '\nAll TTS extract checks passed')
process.exit(failed > 0 ? 1 : 0)