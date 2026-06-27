import type { Highlight } from '../composables/useStorage'

const CONTEXT_LEN = 24

export function blockMatchesHighlight(hl: Highlight, blockText: string): boolean {
  const snap = hl.textSnapshot?.trim()
  if (!snap) return true
  return blockText.includes(snap)
}

export function computeOccurrenceIndex(blockText: string, snapshot: string, startOffset: number): number {
  const needle = snapshot.trim()
  if (!needle) return 0

  let count = 0
  let searchFrom = 0
  while (searchFrom < startOffset) {
    const idx = blockText.indexOf(needle, searchFrom)
    if (idx < 0 || idx >= startOffset) break
    count++
    searchFrom = idx + 1
  }
  return count
}

export function extractContext(blockText: string, start: number, end: number): {
  prefixContext: string
  suffixContext: string
} {
  return {
    prefixContext: blockText.slice(Math.max(0, start - CONTEXT_LEN), start),
    suffixContext: blockText.slice(end, Math.min(blockText.length, end + CONTEXT_LEN)),
  }
}

function contextMatches(
  blockText: string,
  start: number,
  end: number,
  prefix?: string,
  suffix?: string,
): boolean {
  if (prefix) {
    const actual = blockText.slice(Math.max(0, start - prefix.length), start)
    if (!actual.endsWith(prefix) && !prefix.endsWith(actual)) return false
  }
  if (suffix) {
    const actual = blockText.slice(end, end + suffix.length)
    if (!actual.startsWith(suffix) && !suffix.startsWith(actual)) return false
  }
  return true
}

export function findSnapshotAtOccurrence(
  blockText: string,
  snapshot: string,
  occurrenceIndex = 0,
  options: { prefixContext?: string; suffixContext?: string } = {},
): { start: number; end: number } | null {
  const needle = snapshot.trim()
  if (!needle) return null

  let searchFrom = 0
  let seen = 0

  while (searchFrom <= blockText.length) {
    const idx = blockText.indexOf(needle, searchFrom)
    if (idx < 0) return null

    const end = idx + needle.length
    if (seen === occurrenceIndex) {
      if (
        contextMatches(blockText, idx, end, options.prefixContext, options.suffixContext)
      ) {
        return { start: idx, end }
      }
      return null
    }

    seen++
    searchFrom = idx + 1
  }

  return null
}