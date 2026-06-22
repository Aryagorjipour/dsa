import type { Highlight, Note } from '../composables/useStorage'
import { assignBlockIds } from './assignBlockIds'
import { ensureHighlightInDOM } from './highlightRestorer'
import { normalizePagePath } from './normalizePagePath'
import { handbookLink } from './handbookLink'

export const HIGHLIGHT_HASH_PREFIX = '#dsa-hl-'
export const PAGE_NOTE_HASH = '#dsa-page-note'

export interface ScrollToNoteOptions {
  highlights?: Highlight[]
  behavior?: ScrollBehavior
  block?: ScrollLogicalPosition
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

function findTextInDoc(snapshot: string): Element | null {
  const needle = snapshot?.trim()
  if (!needle) return null

  const doc = document.querySelector('.vp-doc')
  if (!doc) return null

  const walker = document.createTreeWalker(doc, NodeFilter.SHOW_TEXT)
  let node: Node | null
  while ((node = walker.nextNode())) {
    const text = node.textContent || ''
    const idx = text.indexOf(needle)
    if (idx < 0) continue

    const range = document.createRange()
    range.setStart(node, idx)
    range.setEnd(node, Math.min(idx + needle.length, text.length))
    const rect = range.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) continue

    return node.parentElement ?? doc
  }

  return null
}

function prepareHighlightTarget(
  highlightId: string,
  highlights: Highlight[],
): Element | null {
  assignBlockIds()

  let mark = findHighlightMark(highlightId)
  if (mark) return mark

  const highlight = findHighlightById(highlightId, highlights)
  if (!highlight) return null

  ensureHighlightInDOM(highlight)
  mark = findHighlightMark(highlightId)
  if (mark) return mark

  return findTextInDoc(highlight.textSnapshot) ?? findTextInDoc(highlight.textSnapshot.slice(0, 80))
}

function findNoteTarget(note: Note, highlights: Highlight[]): Element | null {
  if (note.anchorType === 'highlight' && note.anchorId) {
    const target = prepareHighlightTarget(note.anchorId, highlights)
    if (target) return target
    return findTextInDoc(note.title)
  }

  if (note.anchorType === 'heading' && note.anchorId) {
    return document.getElementById(note.anchorId)
  }

  if (note.anchorType === 'free') {
    return document.getElementById('dsa-page-tools')
  }

  return null
}

function findHashTarget(hash: string, highlights: Highlight[]): Element | null {
  if (!hash) return null

  if (hash.startsWith(HIGHLIGHT_HASH_PREFIX)) {
    const id = hash.slice(HIGHLIGHT_HASH_PREFIX.length)
    return prepareHighlightTarget(id, highlights)
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

  return scrollToElement(() => findNoteTarget(note, highlights), scrollOpts)
}

export function getNoteAnchorElement(
  note: Note,
  highlights: Highlight[] = [],
): Element | null {
  return findNoteTarget(note, highlights)
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