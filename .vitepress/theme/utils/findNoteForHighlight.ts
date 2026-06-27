import type { Highlight, Note } from '../composables/useStorage'
import { pathsMatch } from './pagePathKey'

export interface NoteLookupContext {
  notes: Note[]
  highlights: Highlight[]
  pagePath: string
}

function onPage(note: Note, pagePath: string): boolean {
  return pathsMatch(note.pagePath, pagePath)
}

function normalizeSnap(value: string | undefined): string {
  return value?.trim().replace(/\s+/g, ' ') ?? ''
}

function snapshotsMatch(a: string | undefined, b: string | undefined): boolean {
  const left = normalizeSnap(a)
  const right = normalizeSnap(b)
  if (!left || !right) return false
  return left === right || left.includes(right) || right.includes(left)
}

/**
 * Find the note linked to a highlight mark. Matches by anchorId, highlight.noteId,
 * or same-passage text snapshot (handles duplicate highlights on identical text).
 */
export function findNoteForHighlight(
  highlightId: string | null | undefined,
  ctx: NoteLookupContext,
): Note | undefined {
  if (!highlightId) return undefined

  const { notes, highlights, pagePath } = ctx

  const direct = notes.find(
    n => onPage(n, pagePath) && n.anchorType === 'highlight' && n.anchorId === highlightId,
  )
  if (direct) return direct

  const clicked = highlights.find(h => h.id === highlightId)

  if (clicked?.noteId) {
    const viaNoteId = notes.find(n => n.id === clicked.noteId && onPage(n, pagePath))
    if (viaNoteId) return viaNoteId
  }

  const snap = normalizeSnap(clicked?.textSnapshot)
  const quote = normalizeSnap(clicked?.textSnapshot)

  if (snap || quote) {
    for (const note of notes) {
      if (!onPage(note, pagePath) || note.anchorType !== 'highlight' || !note.anchorId) continue
      if (note.anchorId === highlightId) return note

      const anchorHl = highlights.find(h => h.id === note.anchorId)
      if (!anchorHl) continue

      if (
        snapshotsMatch(anchorHl.textSnapshot, snap) ||
        snapshotsMatch(note.title, quote) ||
        snapshotsMatch(note.title, snap)
      ) {
        return note
      }
    }
  }

  return undefined
}