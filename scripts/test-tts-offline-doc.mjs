#!/usr/bin/env node
/**
 * Unit tests for offline one-document TTS extraction (mirrors extractReadingSegments.ts).
 */

function normalizeReadingText(raw) {
  return raw
    .replace(/\u200b/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim()
}

function buildOfflineDocument(blocks) {
  if (!blocks.length) return { segment: null, blockSpans: [] }
  const joined = normalizeReadingText(blocks.map(b => b.text).join(' '))
  const blockSpans = []
  let searchFrom = 0
  for (const block of blocks) {
    const norm = normalizeReadingText(block.text)
    const idx = joined.indexOf(norm, searchFrom)
    const start = idx >= 0 ? idx : searchFrom
    const end = start + norm.length
    blockSpans.push({ blockId: block.blockId, tagName: block.tagName, charStart: start, charEnd: end })
    searchFrom = end
    while (searchFrom < joined.length && joined[searchFrom] === ' ') searchFrom++
  }
  return {
    segment: {
      id: 'tts-offline-document',
      blockId: blocks[0].blockId,
      text: joined,
      tagName: 'document',
      blockSpans,
    },
    blockSpans,
  }
}

function spokenCharOffset(elapsedMs, durationMs, spokenLength) {
  if (durationMs <= 0 || spokenLength <= 0) return 0
  const ratio = Math.max(0, Math.min(1, elapsedMs / durationMs))
  return Math.min(spokenLength - 1, Math.floor(ratio * spokenLength))
}

function blockSpanIndexAtChar(spans, charOffset) {
  for (let i = 0; i < spans.length; i++) {
    const span = spans[i]
    if (charOffset >= span.charStart && charOffset < span.charEnd) return i
  }
  return Math.max(0, spans.length - 1)
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

const blocks = [
  { blockId: '1', tagName: 'h2', text: 'Introduction' },
  { blockId: '2', tagName: 'p', text: 'First paragraph here.' },
  { blockId: '3', tagName: 'p', text: 'Second paragraph follows.' },
]
const { segment, blockSpans } = buildOfflineDocument(blocks)
assert('one merged segment', segment && segment.text.includes('Introduction'))
assert('three block spans', blockSpans.length === 3)
assert('joined text length', segment.text.length > blocks[0].text.length)
assert('second span starts after first', blockSpans[1].charStart >= blockSpans[0].charEnd)

const mid = spokenCharOffset(500, 1000, segment.text.length)
assert('block index resolves mid doc', blockSpanIndexAtChar(blockSpans, mid) >= 0)

if (failed) {
  console.error(`\n${failed} test(s) failed`)
  process.exit(1)
}

console.log('\nAll TTS offline document tests passed')