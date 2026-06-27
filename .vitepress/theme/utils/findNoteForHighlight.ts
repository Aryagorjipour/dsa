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

/**
 * Find the note linked to a highlight mark by anchorId or highlight.noteId.
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

  return undefined
}