#!/usr/bin/env node
/**
 * Unit tests for chunk-aware char offset (mirrors offlineDocument.ts).
 */

const CHARS_PER_SECOND = 12

function estimateSegmentMs(text, rate) {
  const len = text.replace(/\s+/g, ' ').trim().length
  if (!len) return 0
  const safeRate = Math.max(0.5, Math.min(2, rate))
  return Math.round((len / (CHARS_PER_SECOND * safeRate)) * 1000)
}

function charOffsetForElapsed(elapsedMs, plan, chunkDurationMs, rate) {
  if (!plan.length) return 0
  let acc = 0
  for (let i = 0; i < plan.length; i++) {
    const chunk = plan[i]
    const dur = chunkDurationMs[i] || estimateSegmentMs(chunk.text, rate)
    if (elapsedMs < acc + dur) {
      const charLen = Math.max(1, chunk.charEnd - chunk.charStart)
      const localRatio = dur > 0 ? Math.max(0, Math.min(1, (elapsedMs - acc) / dur)) : 0
      return chunk.charStart + Math.min(charLen - 1, Math.floor(localRatio * charLen))
    }
    acc += dur
  }
  return plan[plan.length - 1].charEnd - 1
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

const plan = [
  { text: 'Hello world.', charStart: 0, charEnd: 12 },
  { text: 'Second chunk here.', charStart: 13, charEnd: 31 },
]
const durations = [1000, 2000]

assert('start of doc', charOffsetForElapsed(0, plan, durations, 1) === 0)
assert('mid first chunk', charOffsetForElapsed(500, plan, durations, 1) >= 5)
assert('second chunk start', charOffsetForElapsed(1000, plan, durations, 1) === 13)
assert('mid second chunk', charOffsetForElapsed(1500, plan, durations, 1) >= 13)

if (failed) {
  console.error(`\n${failed} test(s) failed`)
  process.exit(1)
}

console.log('\nAll TTS char offset tests passed')