#!/usr/bin/env node
/**
 * Unit tests for highlight occurrence matching (mirrors highlightMatching.ts).
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

const CONTEXT_LEN = 24

function blockMatchesHighlight(hl, blockText) {
  const snap = hl.textSnapshot?.trim()
  if (!snap) return true
  return blockText.includes(snap)
}

function computeOccurrenceIndex(blockText, snapshot, startOffset) {
  const needle = snapshot.trim()
  if (!needle) return 0
  let count = 0
  let searchFrom = 0
  while (searchFrom < startOffset) {
    const idx = blockText.indexOf(needle, searchFrom)
    if (idx < 0 || idx >= startOffset) break
    count++
    searchFrom = idx + 1
  }
  return count
}

function findSnapshotAtOccurrence(blockText, snapshot, occurrenceIndex = 0, options = {}) {
  const needle = snapshot.trim()
  if (!needle) return null
  let searchFrom = 0
  let seen = 0
  while (searchFrom <= blockText.length) {
    const idx = blockText.indexOf(needle, searchFrom)
    if (idx < 0) return null
    const end = idx + needle.length
    if (seen === occurrenceIndex) {
      if (options.prefixContext) {
        const actual = blockText.slice(Math.max(0, idx - options.prefixContext.length), idx)
        if (!actual.endsWith(options.prefixContext) && !options.prefixContext.endsWith(actual)) {
          return null
        }
      }
      if (options.suffixContext) {
        const actual = blockText.slice(end, end + options.suffixContext.length)
        if (!actual.startsWith(options.suffixContext) && !options.suffixContext.startsWith(actual)) {
          return null
        }
      }
      return { start: idx, end }
    }
    seen++
    searchFrom = idx + 1
  }
  return null
}

console.log('test-highlight-restore\n')

const blockText = 'A data structure stores data. Another data point follows.'
const firstIdx = blockText.indexOf('data')
const secondIdx = blockText.indexOf('data', firstIdx + 1)

assert(computeOccurrenceIndex(blockText, 'data', firstIdx) === 0, 'first "data" is occurrence 0')
assert(computeOccurrenceIndex(blockText, 'data', secondIdx) === 1, 'second "data" is occurrence 1')

const first = findSnapshotAtOccurrence(blockText, 'data', 0)
const second = findSnapshotAtOccurrence(blockText, 'data', 1)
assert(first?.start === firstIdx, 'occurrence 0 starts at first match')
assert(second?.start === secondIdx, 'occurrence 1 starts at second match')

const pageA = { blockId: '3', textSnapshot: 'data structure' }
const pageABlocks = [{ id: '3', text: 'A data structure is just a way to organize data.' }]
const pageBBlocks = [{ id: '3', text: 'Binary search requires a sorted array.' }]

assert(
  blockMatchesHighlight(pageA, pageABlocks[0].text),
  'snapshot matches correct page',
)
assert(
  !blockMatchesHighlight(pageA, pageBBlocks[0].text),
  'same block id wrong page rejected by snapshot',
)

const withContext = 'The word data structure appears here and data structure again.'
const mid = withContext.indexOf('data structure', 10)
const ctx = {
  prefixContext: withContext.slice(Math.max(0, mid - CONTEXT_LEN), mid),
  suffixContext: withContext.slice(mid + 'data structure'.length, mid + 'data structure'.length + CONTEXT_LEN),
}
const resolved = findSnapshotAtOccurrence(withContext, 'data structure', 1, ctx)
assert(resolved?.start === withContext.indexOf('data structure', 10), 'context + occurrence resolves second phrase')

console.log(failed ? `\n${failed} check(s) failed` : '\nAll highlight restore checks passed')
process.exit(failed > 0 ? 1 : 0)