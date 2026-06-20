/**
 * Normalize VitePress route.path to handbook-relative paths used in
 * quizzes/registry.ts and sidebar links (e.g. /data-structures/01-array).
 *
 * In the browser with base='/dsa/', route.path is /dsa/data-structures/01-array.
 * Registry keys omit the base prefix.
 */
export function normalizePagePath(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  let normalized = path

  if (base !== '/') {
    const basePath = base.replace(/\/$/, '') // '/dsa'
    if (normalized.startsWith(basePath)) {
      normalized = normalized.slice(basePath.length) || '/'
    }
  }

  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }

  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`
  }

  return normalized
}