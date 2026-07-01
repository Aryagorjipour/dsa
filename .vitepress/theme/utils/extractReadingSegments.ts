import { BLOCK_SELECTOR } from './assignBlockIds'

const SKIP_ANCESTOR =
  'pre, code, .vp-code-group, .language-, .quiz-section, .chapter-nav, .page-tools, .dsa-breadcrumbs'

/** ~12 chars/sec at rate 1.0 — keeps Chrome utterances under ~14s limit */
export const MAX_CHUNK_CHARS = 160

/** Piper ONNX phoneme tensors overflow on full handbook pages — synth in batches, play as one. */
export const PIPER_SYNTH_MAX_CHARS = 480
export const CHARS_PER_SECOND = 12

export interface BlockSpan {
  blockId: string
  tagName: string
  /** Inclusive start in joined page speakable text */
  charStart: number
  /** Exclusive end in joined page speakable text */
  charEnd: number
}

export interface ReadingSegment {
  id: string
  blockId: string
  text: string
  tagName: string
  /** Offline Piper: block boundaries inside merged `text` */
  blockSpans?: BlockSpan[]
}

export type ReadingExtractMode = 'cloud' | 'offline'

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

/** Decorative / UI nodes excluded from spoken text and word-wrap indexing. */
export const TTS_NON_SPEAKABLE_SELECTORS =
  '.dsa-heading-note-btn, .dsa-code-action, .header-anchor, button, svg, [aria-hidden="true"]'

const SKIP_UI_SELECTORS = TTS_NON_SPEAKABLE_SELECTORS

/** Parent containers (blockquote, custom-block) duplicate child block text if both are extracted. */
function hasSpeakableDescendant(el: Element): boolean {
  for (const descendant of el.querySelectorAll(BLOCK_SELECTOR)) {
    if (descendant !== el) return true
  }
  return false
}

export function speakableBlockText(el: Element): string {
  const clone = el.cloneNode(true) as HTMLElement
  clone.querySelectorAll(SKIP_UI_SELECTORS).forEach(node => node.remove())
  return normalizeReadingText(clone.textContent || '')
}

function shouldSkipBlock(el: Element): boolean {
  if (el.closest(SKIP_ANCESTOR)) return true
  if (el.closest('pre, code')) return true
  if (hasSpeakableDescendant(el)) return true
  const text = speakableBlockText(el)
  if (!text) return true
  if (text === '​') return true
  return false
}

function resolveVpDoc(root?: ParentNode | null): Element | null {
  if (typeof document === 'undefined' && !root) return null
  return root instanceof Element && root.classList.contains('vp-doc')
    ? root
    : ((root ?? document).querySelector?.('.vp-doc') ?? null)
}

/** One speakable segment per content block — no character splitting (offline Piper). */
export function extractBlockSegments(root?: ParentNode | null): ReadingSegment[] {
  const doc = resolveVpDoc(root)
  if (!doc) return []

  const segments: ReadingSegment[] = []
  let counter = 0

  doc.querySelectorAll(BLOCK_SELECTOR).forEach(el => {
    if (!(el instanceof Element)) return
    if (shouldSkipBlock(el)) return

    const text = speakableBlockText(el)
    if (!text) return

    const blockId = el.getAttribute('data-dsa-block') || `block-${counter}`
    segments.push({
      id: `tts-${counter++}`,
      blockId,
      text,
      tagName: el.tagName.toLowerCase(),
    })
  })

  return segments
}

/** Merge block segments into one continuous document for offline one-shot playback. */
export function buildOfflineDocument(blocks: ReadingSegment[]): {
  segment: ReadingSegment | null
  blockSpans: BlockSpan[]
} {
  if (!blocks.length) return { segment: null, blockSpans: [] }

  const joined = normalizeReadingText(blocks.map(b => b.text).join(' '))
  if (!joined) return { segment: null, blockSpans: [] }

  const blockSpans: BlockSpan[] = []
  let searchFrom = 0

  for (const block of blocks) {
    const norm = normalizeReadingText(block.text)
    if (!norm) continue
    const idx = joined.indexOf(norm, searchFrom)
    const start = idx >= 0 ? idx : searchFrom
    const end = start + norm.length
    blockSpans.push({
      blockId: block.blockId,
      tagName: block.tagName,
      charStart: start,
      charEnd: end,
    })
    searchFrom = end
    while (searchFrom < joined.length && joined[searchFrom] === ' ') searchFrom++
  }

  return {
    segment: {
      id: 'tts-offline-document',
      blockId: blocks[0]!.blockId,
      text: joined,
      tagName: 'document',
      blockSpans,
    },
    blockSpans,
  }
}

export function extractOfflineDocument(root?: ParentNode | null): {
  segment: ReadingSegment | null
  blockSpans: BlockSpan[]
} {
  return buildOfflineDocument(extractBlockSegments(root))
}

/**
 * Extract speakable segments from handbook `.vp-doc` content.
 * - `offline`: entire page as one segment (Piper reads in one take).
 * - `cloud`: 160-char sub-chunks per block for API token batching.
 */
export function extractReadingSegments(
  root?: ParentNode | null,
  mode: ReadingExtractMode = 'cloud',
): ReadingSegment[] {
  if (mode === 'offline') {
    const { segment } = extractOfflineDocument(root)
    return segment ? [segment] : []
  }

  const doc = resolveVpDoc(root)
  if (!doc) return []

  const segments: ReadingSegment[] = []
  let counter = 0

  doc.querySelectorAll(BLOCK_SELECTOR).forEach(el => {
    if (!(el instanceof Element)) return
    if (shouldSkipBlock(el)) return

    const blockId = el.getAttribute('data-dsa-block') || `block-${counter}`
    const tagName = el.tagName.toLowerCase()
    const chunks = splitIntoChunks(speakableBlockText(el))

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