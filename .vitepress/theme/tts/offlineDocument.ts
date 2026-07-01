import {
  estimateSegmentMs,
  PIPER_SYNTH_MAX_CHARS,
  splitIntoChunks,
  type BlockSpan,
} from '../utils/extractReadingSegments'
import { spokenWordIndexAtChar } from './wordTiming'

export interface SynthChunkPlan {
  text: string
  charStart: number
  charEnd: number
}

/** Map Piper synthesis batches back to positions in the merged offline document. */
export function buildSynthChunkPlan(
  spoken: string,
  maxChars = PIPER_SYNTH_MAX_CHARS,
): SynthChunkPlan[] {
  const parts = splitIntoChunks(spoken, maxChars)
  const plan: SynthChunkPlan[] = []
  let searchFrom = 0
  for (const text of parts) {
    const idx = spoken.indexOf(text, searchFrom)
    const charStart = idx >= 0 ? idx : searchFrom
    plan.push({ text, charStart, charEnd: charStart + text.length })
    searchFrom = charStart + text.length
  }
  return plan
}

export function spokenCharOffset(
  elapsedMs: number,
  durationMs: number,
  spokenLength: number,
): number {
  if (durationMs <= 0 || spokenLength <= 0) return 0
  const ratio = Math.max(0, Math.min(1, elapsedMs / durationMs))
  return Math.min(spokenLength - 1, Math.floor(ratio * spokenLength))
}

/** Map playback clock to document char offset using per-chunk measured durations. */
export function charOffsetForElapsed(
  elapsedMs: number,
  plan: SynthChunkPlan[],
  chunkDurationMs: number[],
  fallbackRate: number,
): number {
  if (!plan.length) return 0

  let acc = 0
  for (let i = 0; i < plan.length; i++) {
    const chunk = plan[i]!
    const dur = chunkDurationMs[i] || estimateSegmentMs(chunk.text, fallbackRate)
    if (elapsedMs < acc + dur) {
      const charLen = Math.max(1, chunk.charEnd - chunk.charStart)
      const localRatio = dur > 0 ? Math.max(0, Math.min(1, (elapsedMs - acc) / dur)) : 0
      return chunk.charStart + Math.min(charLen - 1, Math.floor(localRatio * charLen))
    }
    acc += dur
  }

  const last = plan[plan.length - 1]!
  return Math.max(0, last.charEnd - 1)
}

export function spokenWordIndexForElapsed(
  spoken: string,
  elapsedMs: number,
  plan: SynthChunkPlan[],
  chunkDurationMs: number[],
  fallbackRate: number,
): number {
  const charOffset = charOffsetForElapsed(elapsedMs, plan, chunkDurationMs, fallbackRate)
  return spokenWordIndexAtChar(spoken, charOffset)
}

export function blockSpanAtChar(spans: BlockSpan[], charOffset: number): BlockSpan | null {
  if (!spans.length) return null
  for (const span of spans) {
    if (charOffset >= span.charStart && charOffset < span.charEnd) return span
  }
  return spans[spans.length - 1] ?? null
}

export function blockSpanIndexAtChar(spans: BlockSpan[], charOffset: number): number {
  for (let i = 0; i < spans.length; i++) {
    const span = spans[i]!
    if (charOffset >= span.charStart && charOffset < span.charEnd) return i
  }
  return Math.max(0, spans.length - 1)
}

export function msForBlockSpan(
  span: BlockSpan,
  durationMs: number,
  spokenLength: number,
): number {
  if (durationMs <= 0 || spokenLength <= 0) return 0
  return Math.round((span.charStart / spokenLength) * durationMs)
}

export function targetMsForBlockSkip(
  spans: BlockSpan[],
  elapsedMs: number,
  durationMs: number,
  spokenLength: number,
  deltaBlocks: number,
): number | null {
  if (!spans.length) return null
  const charOffset = spokenCharOffset(elapsedMs, durationMs, spokenLength)
  const blockIdx = blockSpanIndexAtChar(spans, charOffset)
  const target = spans[blockIdx + deltaBlocks]
  if (!target) return null
  return msForBlockSpan(target, durationMs, spokenLength)
}