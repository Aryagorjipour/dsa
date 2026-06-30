import {
  estimateSegmentMs,
  type ReadingSegment,
} from '../utils/extractReadingSegments'

export function resolveSegmentAtDurations(
  durationsMs: number[],
  elapsedMs: number,
): { index: number; offsetMs: number } {
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

export function totalDurationMs(durationsMs: number[]): number {
  return durationsMs.reduce((sum, ms) => sum + ms, 0)
}

export function buildEstimatedDurations(segments: ReadingSegment[], rate: number): number[] {
  return segments.map(s => estimateSegmentMs(s.text, rate))
}

export function mergeDurations(
  estimated: number[],
  actual: Array<number | undefined>,
): number[] {
  return estimated.map((est, i) => actual[i] ?? est)
}