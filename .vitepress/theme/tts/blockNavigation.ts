import type { ReadingSegment } from '../utils/extractReadingSegments'
import { resolveSegmentAtDurations } from './segmentTiming'

export function uniqueBlockIds(segments: ReadingSegment[]): string[] {
  const seen = new Set<string>()
  const order: string[] = []
  for (const seg of segments) {
    if (!seen.has(seg.blockId)) {
      seen.add(seg.blockId)
      order.push(seg.blockId)
    }
  }
  return order
}

export function blockIdAtElapsed(
  segments: ReadingSegment[],
  durations: number[],
  elapsedMs: number,
): string {
  const resolved = resolveSegmentAtDurations(durations, elapsedMs)
  return segments[resolved.index]?.blockId ?? segments[0]?.blockId ?? ''
}

export function segmentIndexForBlock(segments: ReadingSegment[], blockId: string): number {
  return segments.findIndex(s => s.blockId === blockId)
}

/** Next/prev paragraph = next/prev unique content block in document order. */
export function targetSegmentForBlockSkip(
  segments: ReadingSegment[],
  durations: number[],
  elapsedMs: number,
  deltaBlocks: number,
): number | null {
  if (!segments.length) return null

  const order = uniqueBlockIds(segments)
  const currentBlock = blockIdAtElapsed(segments, durations, elapsedMs)
  const blockIdx = order.indexOf(currentBlock)
  if (blockIdx < 0) return null

  const nextBlock = order[blockIdx + deltaBlocks]
  if (!nextBlock) return null

  const segIdx = segmentIndexForBlock(segments, nextBlock)
  return segIdx >= 0 ? segIdx : null
}