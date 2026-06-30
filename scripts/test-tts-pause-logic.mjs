#!/usr/bin/env node
/**
 * Unit tests for engine-agnostic TTS pause/skip timing (mirrors segmentTiming.ts).
 */

function resolveSegmentAtDurations(durationsMs, elapsedMs) {
  if (!durationsMs.length) return { index: 0, offsetMs: 0 }

  let acc = 0
  for (let i = 0; i < durationsMs.length; i++) {
    const duration = durationsMs[i] ?? 0
    if (elapsedMs < acc + duration) {
      return { index: i, offsetMs: Math.max(0, elapsedMs - acc) }
    }
    acc += duration
  }

  return { index: durationsMs.length - 1, offsetMs: 0 }
}

function mergeDurations(estimated, actual) {
  return estimated.map((est, i) => actual[i] ?? est)
}

function accumulatePauseOffset(currentOffsetMs, playedMs) {
  return currentOffsetMs + playedMs
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

const durations = [5000, 8000, 3000]

assert('start resolves to segment 0', resolveSegmentAtDurations(durations, 0).index === 0)
assert('mid segment 1', resolveSegmentAtDurations(durations, 6000).index === 1)
assert('offset within segment 1', resolveSegmentAtDurations(durations, 5500).offsetMs === 500)
assert('last segment tail', resolveSegmentAtDurations(durations, 15999).index === 2)

const merged = mergeDurations([1000, 2000], [1500, undefined])
assert('merge prefers actual duration', merged[0] === 1500)
assert('merge keeps estimate when actual missing', merged[1] === 2000)

assert('pause offset accumulates', accumulatePauseOffset(1200, 800) === 2000)
assert('skip clamp at end', resolveSegmentAtDurations(durations, 20000).index === 2)

if (failed) {
  console.error(`\n${failed} test(s) failed`)
  process.exit(1)
}

console.log('\nAll TTS pause logic tests passed')