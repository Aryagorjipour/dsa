import type { Note } from '../composables/useStorage'
import { pathsMatch } from './pagePathKey'

function onPage(note: Note, pagePath: string): boolean {
  return pathsMatch(note.pagePath, pagePath)
}

export function findNoteForHeading(
  headingId: string,
  pagePath: string,
  notes: Note[],
): Note | undefined {
  return notes.find(
    n => onPage(n, pagePath) && n.anchorType === 'heading' && n.anchorId === headingId,
  )
}

/** Most recently updated free (page-level) note on this page. */
export function findPageNote(pagePath: string, notes: Note[]): Note | undefined {
  const matches = notes.filter(n => onPage(n, pagePath) && n.anchorType === 'free')
  if (!matches.length) return undefined
  return matches.sort((a, b) => b.updatedAt - a.updatedAt)[0]
}