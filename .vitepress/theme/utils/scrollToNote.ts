import type { Note } from '../composables/useStorage'
import { normalizePagePath } from './normalizePagePath'
import { handbookLink } from './handbookLink'

export const HIGHLIGHT_HASH_PREFIX = '#dsa-hl-'
export const PAGE_NOTE_HASH = '#dsa-page-note'

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

function findNoteTarget(note: Note): Element | null {
  if (note.anchorType === 'highlight' && note.anchorId) {
    return document.querySelector(`mark[data-highlight-id="${note.anchorId}"]`)
  }
  if (note.anchorType === 'heading' && note.anchorId) {
    return document.getElementById(note.anchorId)
  }
  if (note.anchorType === 'free') {
    return document.getElementById('dsa-page-tools')
  }
  return null
}

function findHashTarget(hash: string): Element | null {
  if (!hash) return null

  if (hash.startsWith(HIGHLIGHT_HASH_PREFIX)) {
    const id = hash.slice(HIGHLIGHT_HASH_PREFIX.length)
    return document.querySelector(`mark[data-highlight-id="${id}"]`)
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

type ScrollOpts = ScrollIntoViewOptions

async function scrollToElement(
  find: () => Element | null,
  opts: ScrollOpts,
  maxAttempts = 15,
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    const el = find()
    if (el) {
      el.scrollIntoView(opts)
      flashTarget(el)
      return true
    }
    await new Promise(resolve => window.setTimeout(resolve, 80 + i * 40))
  }
  return false
}

export function scrollToNote(
  note: Note,
  opts: ScrollOpts = { behavior: 'smooth', block: 'center' },
): Promise<boolean> {
  return scrollToElement(() => findNoteTarget(note), opts)
}

export function scrollToHash(
  hash: string,
  opts: ScrollOpts = { behavior: 'smooth', block: 'center' },
): Promise<boolean> {
  return scrollToElement(() => findHashTarget(hash), opts)
}