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

function blockWordIndexForSegment(segments, segmentIndex, segmentDisplayWordIndex) {
  const seg = segments[segmentIndex]
  if (!seg) return segmentDisplayWordIndex
  let offset = 0
  for (let i = 0; i < segmentIndex; i++) {
    if (segments[i].blockId === seg.blockId) {
      offset += tokenizeWords(segments[i].text).length
    }
  }
  return offset + segmentDisplayWordIndex
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

const segments = [
  { blockId: '1', text: 'one two three four five' },
  { blockId: '1', text: 'six seven eight nine ten' },
  { blockId: '2', text: 'other block words' },
]
assert('second chunk offsets by five', blockWordIndexForSegment(segments, 1, 0) === 5)
assert('second chunk local index maps globally', blockWordIndexForSegment(segments, 1, 2) === 7)
assert('other block has no offset', blockWordIndexForSegment(segments, 2, 1) === 1)

if (failed) {
  console.error(`\n${failed} test(s) failed`)
  process.exit(1)
}

console.log('\nAll TTS word tests passed')