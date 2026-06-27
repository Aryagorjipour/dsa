import { normalizePagePath } from './normalizePagePath'

/** Canonical page key for annotations (matches sidebar / quiz registry paths). */
export function pagePathKey(path: string): string {
  return normalizePagePath(path)
}

export function pathsMatch(stored: string, current: string): boolean {
  return pagePathKey(stored) === pagePathKey(current)
}

/** Convert VitePress `page.relativePath` (e.g. `fundamentals/00-foo.md`) to annotation page key. */
export function pageKeyFromRelativePath(relativePath: string): string {
  let normalized = relativePath.replace(/(?:(^|\/)index)?\.md$/i, '$1')
  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`
  }
  return normalizePagePath(normalized)
}