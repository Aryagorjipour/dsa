#!/usr/bin/env node
/**
 * Unit tests for block-based paragraph skip (mirrors blockNavigation.ts).
 */

function resolveSegmentAtDurations(durations, targetMs) {
  let acc = 0
  for (let i = 0; i < durations.length; i++) {
    const d = durations[i] ?? 0
    if (targetMs < acc + d) return { index: i, offsetMs: Math.max(0, targetMs - acc) }
    acc += d
  }
  return { index: Math.max(0, durations.length - 1), offsetMs: 0 }
}

function uniqueBlockIds(segments) {
  const seen = new Set()
  const order = []
  for (const seg of segments) {
    if (!seen.has(seg.blockId)) {
      seen.add(seg.blockId)
      order.push(seg.blockId)
    }
  }
  return order
}

function blockIdAtElapsed(segments, durations, elapsedMs) {
  const resolved = resolveSegmentAtDurations(durations, elapsedMs)
  return segments[resolved.index]?.blockId ?? ''
}

function targetSegmentForBlockSkip(segments, durations, elapsedMs, deltaBlocks) {
  const order = uniqueBlockIds(segments)
  const currentBlock = blockIdAtElapsed(segments, durations, elapsedMs)
  const blockIdx = order.indexOf(currentBlock)
  if (blockIdx < 0) return null
  const nextBlock = order[blockIdx + deltaBlocks]
  if (!nextBlock) return null
  return segments.findIndex(s => s.blockId === nextBlock)
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

const segments = [
  { blockId: '0', text: 'Title chunk 1' },
  { blockId: '0', text: 'Title chunk 2' },
  { blockId: '1', text: 'Quote chunk 1' },
  { blockId: '2', text: 'Tone promise' },
  { blockId: '3', text: 'Next section' },
]
const durations = [1000, 1000, 800, 600, 500]

assert('next block from mid-chunk title', targetSegmentForBlockSkip(segments, durations, 1200, 1) === 2)
assert('next block from quote', targetSegmentForBlockSkip(segments, durations, 2500, 1) === 3)
assert('prev block from tone', targetSegmentForBlockSkip(segments, durations, 2800, -1) === 2)
assert('no skip before first', targetSegmentForBlockSkip(segments, durations, 0, -1) === null)

if (failed) {
  console.error(`\n${failed} test(s) failed`)
  process.exit(1)
}

console.log('\nAll TTS block navigation tests passed')