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

function findSegmentWordOffset(blockText, segmentText, priorSegmentTexts) {
  const norm = normalizeReadingText(blockText)
  let searchFrom = 0
  for (const prior of priorSegmentTexts) {
    const piece = normalizeReadingText(prior)
    const idx = norm.indexOf(piece, searchFrom)
    if (idx >= 0) searchFrom = idx + piece.length
  }
  const seg = normalizeReadingText(segmentText)
  const idx = norm.indexOf(seg, searchFrom)
  const charOffset = idx >= 0 ? idx : searchFrom
  return tokenizeWords(norm.slice(0, charOffset)).length
}

function blockWordIndexForSegment(segments, segmentIndex, segmentDisplayWordIndex) {
  const seg = segments[segmentIndex]
  if (!seg) return segmentDisplayWordIndex
  const blockSegs = segments.filter(s => s.blockId === seg.blockId)
  const blockText = normalizeReadingText(blockSegs.map(s => s.text).join(''))
  const segIdxInBlock = blockSegs.indexOf(seg)
  const priorTexts = blockSegs.slice(0, segIdxInBlock).map(s => s.text)
  return findSegmentWordOffset(blockText, seg.text, priorTexts) + segmentDisplayWordIndex
}

function alignSpeakableToDomIndices(speakable, dom) {
  const result = new Array(speakable.length).fill(-1)
  let domIdx = 0
  for (let speakIdx = 0; speakIdx < speakable.length; speakIdx++) {
    const target = speakable[speakIdx]
    let searchFrom = domIdx
    while (searchFrom < dom.length && dom[searchFrom] !== target) searchFrom++
    if (searchFrom < dom.length) {
      result[speakIdx] = searchFrom
      domIdx = searchFrom + 1
    }
  }
  return result
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

const anchorDom = ['#', 'Section', 'title', 'here']
const anchorSpeak = ['Section', 'title', 'here']
const anchorMap = alignSpeakableToDomIndices(anchorSpeak, anchorDom)
assert('skips header anchor in dom', anchorMap[0] === 1)
assert('maps third speakable word', anchorMap[2] === 3)

const codeDom = ['The', 'algorithm', 'runs', 'fast']
const codeSpeak = ['The', 'O(n)', 'algorithm', 'runs', 'fast']
const codeMap = alignSpeakableToDomIndices(codeSpeak, codeDom)
assert('speakable-only token unmapped', codeMap[1] === -1)
assert('resyncs after skipped token', codeMap[2] === 1)
assert('last token maps correctly', codeMap[4] === 3)

if (failed) {
  console.error(`\n${failed} test(s) failed`)
  process.exit(1)
}

console.log('\nAll TTS word tests passed')