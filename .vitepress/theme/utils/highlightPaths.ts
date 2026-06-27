import type { Highlight } from '../composables/useStorage'
import { pathsMatch } from './pagePathKey'

/** Pure helper — filter highlights for a canonical page path. */
export function getHighlightsForPath(all: Highlight[], path: string): Highlight[] {
  return all.filter(h => pathsMatch(h.pagePath, path))
}