import type { Highlight, Note } from '../composables/useStorage'
import { assignBlockIds } from './assignBlockIds'
import { buildHighlightRange, ensureHighlightInDOM } from './highlightRestorer'
import { normalizePagePath } from './normalizePagePath'
import { handbookLink } from './handbookLink'

export const HIGHLIGHT_HASH_PREFIX = '#dsa-hl-'
export const PAGE_NOTE_HASH = '#dsa-page-note'

export interface ScrollToNoteOptions {
  highlights?: Highlight[]
  behavior?: ScrollBehavior
  block?: ScrollLogicalPosition
}

export interface NoteAnchor {
  rect: DOMRect
  element: Element
}

function escapeAttr(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value)
  }
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

export function noteHash(note: Note): string {
  if (note.anchorType === 'highlight' && note.anchorId) {
    return `${HIGHLIGHT_HASH_PREFIX}${note.anchorId}`
  }
  if (note.anchorType === 'heading' && note.anchorId) {
    return `#${note.anchorId}`
  }
  if (note.anchorType === 'free') {
    return PAGE_NOTE_HASH
  }
  return `#dsa-note-${note.id}`
}

export function notePageLink(note: Note): string {
  return handbookLink(normalizePagePath(note.pagePath)) + noteHash(note)
}

function findHighlightMark(id: string): HTMLElement | null {
  return document.querySelector(`mark[data-highlight-id="${escapeAttr(id)}"]`)
}

function findHighlightById(id: string, highlights: Highlight[]): Highlight | undefined {
  return highlights.find(h => h.id === id)
}

function mergeRangeRects(range: Range): DOMRect | null {
  const rects = [...range.getClientRects()]
  if (!rects.length) {
    const box = range.getBoundingClientRect()
    return box.width > 0 || box.height > 0 ? box : null
  }

  let top = Infinity
  let left = Infinity
  let bottom = -Infinity
  let right = -Infinity
  for (const r of rects) {
    if (r.width === 0 && r.height === 0) continue
    top = Math.min(top, r.top)
    left = Math.min(left, r.left)
    bottom = Math.max(bottom, r.bottom)
    right = Math.max(right, r.right)
  }

  if (!Number.isFinite(top)) return null
  return new DOMRect(left, top, right - left, bottom - top)
}

function findTextRangeInDoc(
  snapshot: string,
  options: { blockId?: string } = {},
): Range | null {
  const needle = snapshot?.trim()
  if (!needle) return null

  const doc = document.querySelector('.vp-doc')
  if (!doc) return null

  const blocks: Element[] = options.blockId
    ? [...doc.querySelectorAll(`[data-dsa-block="${escapeAttr(options.blockId)}"]`)]
    : [...doc.querySelectorAll('[data-dsa-block]')]

  if (!blocks.length && !options.blockId) blocks.push(doc)

  for (const block of blocks) {
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT)
    let node: Node | null
    while ((node = walker.nextNode())) {
      const text = node.textContent || ''
      const idx = text.indexOf(needle)
      if (idx < 0) continue

      const range = document.createRange()
      range.setStart(node, idx)
      range.setEnd(node, Math.min(idx + needle.length, text.length))
      if (mergeRangeRects(range)) return range
    }
  }

  return null
}

function anchorFromRange(range: Range, fallback: Element): NoteAnchor | null {
  const rect = mergeRangeRects(range)
  if (!rect) return null
  return { rect, element: fallback }
}

function prepareHighlightAnchor(
  highlightId: string,
  highlights: Highlight[],
): NoteAnchor | null {
  assignBlockIds()

  let mark = findHighlightMark(highlightId)
  if (mark) {
    const rect = mergeRangeRects(rangeFromElement(mark)) ?? mark.getBoundingClientRect()
    return { rect, element: mark }
  }

  const highlight = findHighlightById(highlightId, highlights)
  if (!highlight) return null

  ensureHighlightInDOM(highlight)
  mark = findHighlightMark(highlightId)
  if (mark) {
    const rect = mergeRangeRects(rangeFromElement(mark)) ?? mark.getBoundingClientRect()
    return { rect, element: mark }
  }

  const range = buildHighlightRange(highlight)
  if (range) {
    const anchor = anchorFromRange(range, document.body)
    if (anchor) return anchor
  }

  const textRange = findTextRangeInDoc(highlight.textSnapshot, { blockId: highlight.blockId })
  if (textRange) {
    return anchorFromRange(textRange, document.body)
  }

  return null
}

function rangeFromElement(el: Element): Range | null {
  const range = document.createRange()
  try {
    range.selectNodeContents(el)
    return range
  } catch {
    return null
  }
}

function findNoteAnchor(note: Note, highlights: Highlight[]): NoteAnchor | null {
  if (note.anchorType === 'highlight' && note.anchorId) {
    const anchor = prepareHighlightAnchor(note.anchorId, highlights)
    if (anchor) return anchor

    const highlight = findHighlightById(note.anchorId, highlights)
    if (highlight) {
      const range = findTextRangeInDoc(highlight.textSnapshot, { blockId: highlight.blockId })
      if (range) return anchorFromRange(range, document.body)
    }

    const fallback = findTextRangeInDoc(note.title)
    if (fallback) return anchorFromRange(fallback, document.body)
    return null
  }

  if (note.anchorType === 'heading' && note.anchorId) {
    const el = document.getElementById(note.anchorId)
    if (!el) return null
    return { rect: el.getBoundingClientRect(), element: el }
  }

  if (note.anchorType === 'free') {
    const el = document.getElementById('dsa-page-tools')
    if (!el) return null
    return { rect: el.getBoundingClientRect(), element: el }
  }

  return null
}

function findHashTarget(hash: string, highlights: Highlight[]): Element | null {
  if (!hash) return null

  if (hash.startsWith(HIGHLIGHT_HASH_PREFIX)) {
    const id = hash.slice(HIGHLIGHT_HASH_PREFIX.length)
    return prepareHighlightAnchor(id, highlights)?.element ?? null
  }

  if (hash === PAGE_NOTE_HASH) {
    return document.getElementById('dsa-page-tools')
  }

  const id = hash.startsWith('#') ? hash.slice(1) : hash
  if (!id) return null
  return document.getElementById(id)
}

export function flashTarget(el: Element) {
  el.classList.add('dsa-note-flash')
  window.setTimeout(() => el.classList.remove('dsa-note-flash'), 2000)
}

function scrollAndFlash(el: Element, opts: ScrollIntoViewOptions): void {
  el.scrollIntoView(opts)
  flashTarget(el)
}

function scrollToAnchor(anchor: NoteAnchor, opts: ScrollIntoViewOptions): void {
  const el = anchor.element
  if (el instanceof HTMLElement && el.isConnected && el !== document.body) {
    scrollAndFlash(el, opts)
    return
  }

  const targetTop =
    anchor.rect.top + window.scrollY - window.innerHeight / 2 + anchor.rect.height / 2
  window.scrollTo({ top: Math.max(0, targetTop), behavior: opts.behavior ?? 'smooth' })
}

async function scrollToAnchorWithRetry(
  find: () => NoteAnchor | null,
  opts: ScrollIntoViewOptions,
  maxAttempts = 20,
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    const anchor = find()
    if (anchor) {
      scrollToAnchor(anchor, opts)
      return true
    }
    await new Promise(resolve => window.setTimeout(resolve, 60 + i * 35))
  }
  return false
}

async function scrollToElement(
  find: () => Element | null,
  opts: ScrollIntoViewOptions,
  maxAttempts = 20,
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    const el = find()
    if (el) {
      scrollAndFlash(el, opts)
      return true
    }
    await new Promise(resolve => window.setTimeout(resolve, 60 + i * 35))
  }
  return false
}

export function scrollToNote(
  note: Note,
  options: ScrollToNoteOptions = {},
): Promise<boolean> {
  const highlights = options.highlights ?? []
  const scrollOpts: ScrollIntoViewOptions = {
    behavior: options.behavior ?? 'smooth',
    block: options.block ?? 'center',
  }

  return scrollToAnchorWithRetry(() => findNoteAnchor(note, highlights), scrollOpts)
}

export function getNoteAnchor(
  note: Note,
  highlights: Highlight[] = [],
): NoteAnchor | null {
  return findNoteAnchor(note, highlights)
}

/** @deprecated Use getNoteAnchor — returns the scroll target element. */
export function getNoteAnchorElement(
  note: Note,
  highlights: Highlight[] = [],
): Element | null {
  return getNoteAnchor(note, highlights)?.element ?? null
}

export function scrollToHash(
  hash: string,
  highlights: Highlight[] = [],
  options: Omit<ScrollToNoteOptions, 'highlights'> = {},
): Promise<boolean> {
  const scrollOpts: ScrollIntoViewOptions = {
    behavior: options.behavior ?? 'smooth',
    block: options.block ?? 'center',
  }

  return scrollToElement(() => findHashTarget(hash, highlights), scrollOpts)
}