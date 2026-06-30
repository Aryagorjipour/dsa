#!/usr/bin/env node
/**
 * Unit tests for cloud TTS chunk planning (mirrors cloudChunkPlan.ts).
 */

const PRIORITY_CHAR_RATIO = 0.12
const BATCH_MAX_CHARS = 900

function buildPlaybackChunks(segments, spokenTextFor) {
  if (!segments.length) return []

  const totalChars = segments.reduce((sum, seg) => sum + spokenTextFor(seg).length, 0)
  const priorityTarget = Math.max(180, Math.floor(totalChars * PRIORITY_CHAR_RATIO))

  const chunks = []
  let i = 0

  const priority = []
  let acc = 0
  while (i < segments.length) {
    priority.push(i)
    acc += spokenTextFor(segments[i]).length
    i++
    if (acc >= priorityTarget) break
  }
  chunks.push({ segmentIndices: priority })

  while (i < segments.length) {
    const batch = []
    let batchChars = 0
    while (i < segments.length) {
      const len = spokenTextFor(segments[i]).length
      if (batch.length > 0 && batchChars + len > BATCH_MAX_CHARS) break
      batch.push(i)
      batchChars += len
      i++
    }
    chunks.push({ segmentIndices: batch })
  }

  return chunks
}

function splitDurationByWeights(totalMs, weights) {
  const sum = weights.reduce((a, b) => a + b, 0)
  if (sum <= 0) return weights.map(() => Math.round(totalMs / Math.max(1, weights.length)))
  const raw = weights.map(w => (totalMs * w) / sum)
  const rounded = raw.map(v => Math.round(v))
  const drift = totalMs - rounded.reduce((a, b) => a + b, 0)
  if (rounded.length && drift !== 0) rounded[rounded.length - 1] += drift
  return rounded
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

const segments = Array.from({ length: 20 }, (_, i) => ({ text: 'word '.repeat(40 + i * 5) }))
const spoken = seg => seg.text

const chunks = buildPlaybackChunks(segments, spoken)
assert('creates at least two chunks', chunks.length >= 2)
assert('first chunk is priority slice', chunks[0].segmentIndices.length >= 1)
assert('all segments covered', chunks.flatMap(c => c.segmentIndices).length === segments.length)
assert('no duplicate segment indices', new Set(chunks.flatMap(c => c.segmentIndices)).size === segments.length)

const durations = splitDurationByWeights(1000, [100, 200, 300])
assert('splits duration by weight', durations.reduce((a, b) => a + b, 0) === 1000)
assert('proportional split', durations[2] > durations[0])

if (failed) {
  console.error(`\n${failed} test(s) failed`)
  process.exit(1)
}

console.log('\nAll TTS cloud chunk tests passed')