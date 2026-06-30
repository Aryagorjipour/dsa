#!/usr/bin/env node
/**
 * Unit tests for TTS line indicator clustering (mirrors lineIndicator.ts).
 */

const LINE_TOLERANCE_PX = 6

function clusterLineTops(tops, tolerance = LINE_TOLERANCE_PX) {
  const sorted = [...tops].sort((a, b) => a - b)
  const lines = []
  for (const top of sorted) {
    const existing = lines.find(l => Math.abs(l - top) <= tolerance)
    if (existing === undefined) lines.push(top)
  }
  return lines
}

function lineIndexForWord(tops, wordIndex, tolerance = LINE_TOLERANCE_PX) {
  const lines = clusterLineTops(tops, tolerance)
  const top = tops[wordIndex]
  if (top === undefined) return 0
  const idx = lines.findIndex(l => Math.abs(l - top) <= tolerance)
  return idx >= 0 ? idx : 0
}

function lineBoundsForWord(tops, heights, wordIndex, tolerance = LINE_TOLERANCE_PX) {
  const top = tops[wordIndex]
  if (top === undefined) return null
  const indices = tops
    .map((t, i) => (Math.abs(t - top) <= tolerance ? i : -1))
    .filter(i => i >= 0)
  const lineTop = Math.min(...indices.map(i => tops[i]))
  const lineBottom = Math.max(...indices.map(i => tops[i] + (heights[i] ?? 0)))
  return { top: lineTop, height: Math.max(4, lineBottom - lineTop) }
}

function lineTopForWordIndex(wordTops, displayWordIndex) {
  if (!wordTops.length || displayWordIndex < 0 || displayWordIndex >= wordTops.length) {
    return null
  }
  return wordTops[displayWordIndex]
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

const tops = [0, 0, 0, 22, 22, 44, 44, 44]
assert('cluster finds three lines', clusterLineTops(tops).length === 3)
assert('word on first line', lineIndexForWord(tops, 1) === 0)
assert('word on second line', lineIndexForWord(tops, 4) === 1)
assert('word on third line', lineIndexForWord(tops, 6) === 2)
assert('line top for valid index', lineTopForWordIndex(tops, 4) === 22)
assert('line top null for invalid', lineTopForWordIndex(tops, 99) === null)

const heights = tops.map(() => 18)
const bounds = lineBoundsForWord(tops, heights, 4)
assert('line bounds span multiple words', bounds && bounds.height >= 18)
assert('line bounds on second line', bounds && bounds.top === 22)

if (failed) {
  console.error(`\n${failed} test(s) failed`)
  process.exit(1)
}

console.log('\nAll TTS line indicator tests passed')