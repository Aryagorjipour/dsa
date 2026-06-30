import type { PreparedSegment } from './preparedSegment'

/** First chunk covers ~this fraction of document characters (one API call). */
export const PRIORITY_CHAR_RATIO = 0.12

/** Max spoken characters per batched API call after the priority chunk. */
export const BATCH_MAX_CHARS = 2800

export interface PlaybackChunk {
  segmentIndices: number[]
}

export function spokenLength(seg: PreparedSegment, spokenTextFor: (s: PreparedSegment) => string): number {
  return spokenTextFor(seg).length
}

export function buildPlaybackChunks(
  segments: PreparedSegment[],
  spokenTextFor: (s: PreparedSegment) => string,
): PlaybackChunk[] {
  if (!segments.length) return []

  const totalChars = segments.reduce((sum, seg) => sum + spokenLength(seg, spokenTextFor), 0)
  const priorityTarget = Math.max(180, Math.floor(totalChars * PRIORITY_CHAR_RATIO))

  const chunks: PlaybackChunk[] = []
  let i = 0

  const priority: number[] = []
  let acc = 0
  while (i < segments.length) {
    priority.push(i)
    acc += spokenLength(segments[i], spokenTextFor)
    i++
    if (acc >= priorityTarget) break
  }
  chunks.push({ segmentIndices: priority })

  while (i < segments.length) {
    const batch: number[] = []
    let batchChars = 0
    while (i < segments.length) {
      const len = spokenLength(segments[i], spokenTextFor)
      if (batch.length > 0 && batchChars + len > BATCH_MAX_CHARS) break
      batch.push(i)
      batchChars += len
      i++
    }
    chunks.push({ segmentIndices: batch })
  }

  return chunks
}

export function splitDurationByWeights(totalMs: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0)
  if (sum <= 0) return weights.map(() => Math.round(totalMs / Math.max(1, weights.length)))
  const raw = weights.map(w => (totalMs * w) / sum)
  const rounded = raw.map(v => Math.round(v))
  const drift = totalMs - rounded.reduce((a, b) => a + b, 0)
  if (rounded.length && drift !== 0) rounded[rounded.length - 1] += drift
  return rounded
}

export function segmentIndexAtOffsetInChunk(
  offsetMs: number,
  segmentDurations: number[],
): { index: number; offsetMs: number } {
  let remaining = Math.max(0, offsetMs)
  for (let i = 0; i < segmentDurations.length; i++) {
    const dur = segmentDurations[i] ?? 0
    if (remaining < dur) return { index: i, offsetMs: remaining }
    remaining -= dur
  }
  const last = Math.max(0, segmentDurations.length - 1)
  return { index: last, offsetMs: 0 }
}