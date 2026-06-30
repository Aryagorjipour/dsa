import { BLOCK_SELECTOR } from './assignBlockIds'

const SKIP_ANCESTOR =
  'pre, code, .vp-code-group, .language-, .quiz-section, .chapter-nav, .page-tools, .dsa-breadcrumbs'

/** ~12 chars/sec at rate 1.0 — keeps Chrome utterances under ~14s limit */
export const MAX_CHUNK_CHARS = 160
export const CHARS_PER_SECOND = 12

export interface ReadingSegment {
  id: string
  blockId: string
  text: string
  tagName: string
}

export function normalizeReadingText(raw: string): string {
  return raw
    .replace(/\u200b/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim()
}

export function splitIntoChunks(text: string, maxChars = MAX_CHUNK_CHARS): string[] {
  const normalized = normalizeReadingText(text)
  if (!normalized) return []
  if (normalized.length <= maxChars) return [normalized]

  const sentences = normalized.split(/(?<=[.!?])\s+/).filter(Boolean)
  const chunks: string[] = []
  let buffer = ''

  for (const sentence of sentences) {
    const piece = buffer ? `${buffer} ${sentence}` : sentence
    if (piece.length <= maxChars) {
      buffer = piece
      continue
    }
    if (buffer) chunks.push(buffer)
    if (sentence.length <= maxChars) {
      buffer = sentence
      continue
    }
    buffer = ''
    for (let i = 0; i < sentence.length; i += maxChars) {
      chunks.push(sentence.slice(i, i + maxChars).trim())
    }
  }

  if (buffer) chunks.push(buffer)
  return chunks.filter(Boolean)
}

export function estimateSegmentMs(text: string, rate: number): number {
  const len = normalizeReadingText(text).length
  if (!len) return 0
  const safeRate = Math.max(0.5, Math.min(2, rate))
  return Math.round((len / (CHARS_PER_SECOND * safeRate)) * 1000)
}

export function sliceTextAtOffset(text: string, offsetMs: number, rate: number): string {
  const normalized = normalizeReadingText(text)
  if (!normalized || offsetMs <= 0) return normalized

  const totalMs = estimateSegmentMs(normalized, rate)
  if (offsetMs >= totalMs) return ''

  const ratio = offsetMs / totalMs
  let charOffset = Math.floor(normalized.length * ratio)
  const space = normalized.indexOf(' ', charOffset)
  if (space > charOffset && space - charOffset < 24) charOffset = space + 1

  return normalized.slice(charOffset).trim() || normalized
}

function shouldSkipBlock(el: Element): boolean {
  if (el.closest(SKIP_ANCESTOR)) return true
  if (el.closest('pre, code')) return true
  const text = normalizeReadingText(el.textContent || '')
  if (!text) return true
  if (text === '​') return true
  return false
}

/** Extract speakable segments from handbook `.vp-doc` content only. */
export function extractReadingSegments(root?: ParentNode | null): ReadingSegment[] {
  if (typeof document === 'undefined' && !root) return []

  const doc =
    root instanceof Element && root.classList.contains('vp-doc')
      ? root
      : (root ?? document).querySelector?.('.vp-doc') ?? null

  if (!doc) return []

  const segments: ReadingSegment[] = []
  let counter = 0

  doc.querySelectorAll(BLOCK_SELECTOR).forEach(el => {
    if (!(el instanceof Element)) return
    if (shouldSkipBlock(el)) return

    const blockId = el.getAttribute('data-dsa-block') || `block-${counter}`
    const tagName = el.tagName.toLowerCase()
    const chunks = splitIntoChunks(el.textContent || '')

    for (const text of chunks) {
      segments.push({
        id: `tts-${counter++}`,
        blockId,
        text,
        tagName,
      })
    }
  })

  return segments
}

export function totalEstimatedMs(segments: ReadingSegment[], rate: number): number {
  return segments.reduce((sum, s) => sum + estimateSegmentMs(s.text, rate), 0)
}

export function resolveSegmentAtTime(
  segments: ReadingSegment[],
  elapsedMs: number,
  rate: number,
): { index: number; offsetMs: number } {
  if (!segments.length) return { index: 0, offsetMs: 0 }

  let acc = 0
  for (let i = 0; i < segments.length; i++) {
    const duration = estimateSegmentMs(segments[i].text, rate)
    if (elapsedMs < acc + duration) {
      return { index: i, offsetMs: Math.max(0, elapsedMs - acc) }
    }
    acc += duration
  }

  return { index: segments.length - 1, offsetMs: 0 }
}