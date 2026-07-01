import type { BlockSpan } from '../utils/extractReadingSegments'

export function spokenCharOffset(
  elapsedMs: number,
  durationMs: number,
  spokenLength: number,
): number {
  if (durationMs <= 0 || spokenLength <= 0) return 0
  const ratio = Math.max(0, Math.min(1, elapsedMs / durationMs))
  return Math.min(spokenLength - 1, Math.floor(ratio * spokenLength))
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