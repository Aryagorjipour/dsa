#!/usr/bin/env node
/**
 * Pure-logic tests for margin note layout helpers.
 * Mirrors .vitepress/theme/utils/noteLayout.ts and annotationLifecycle.ts.
 */

function normalizePagePath(path) {
  const base = '/dsa/'
  let normalized = path
  if (base !== '/') {
    const basePath = base.replace(/\/$/, '')
    if (normalized.startsWith(basePath)) {
      normalized = normalized.slice(basePath.length) || '/'
    }
  }
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }
  if (!normalized.startsWith('/')) normalized = `/${normalized}`
  return normalized
}

function pathsMatch(stored, current) {
  return normalizePagePath(stored) === normalizePagePath(current)
}

function getHighlightsForPath(all, path) {
  return all.filter(h => pathsMatch(h.pagePath, path))
}

function docToViewportTop(docTop, scrollY) {
  return docTop - scrollY
}

function viewportToDocTop(viewportTop, scrollY) {
  return viewportTop + scrollY
}

function applyManualLayout(note, bounds, height, scrollY, scrollX, viewportHeight, viewportWidth) {
  const CARD_WIDTH = 220
  const VIEWPORT_PAD = 8
  if (!note.marginLayout) return null

  const rawTop = docToViewportTop(note.marginLayout.docTop, scrollY)
  const rawLeft = note.marginLayout.docLeft - scrollX

  const top = Math.max(
    bounds.navBottom,
    Math.min(rawTop, viewportHeight - height - VIEWPORT_PAD),
  )
  const left = Math.max(
    VIEWPORT_PAD,
    Math.min(rawLeft, viewportWidth - CARD_WIDTH - VIEWPORT_PAD),
  )

  const contentCenter = bounds.contentRect.left + bounds.contentRect.width / 2
  const side = left + CARD_WIDTH / 2 < contentCenter ? 'left' : 'right'

  return { top, left, side }
}

let passed = 0
let failed = 0

function assert(condition, message) {
  if (condition) {
    passed++
  } else {
    failed++
    console.error(`FAIL: ${message}`)
  }
}

// getHighlightsForPath
const highlights = [
  { id: '1', pagePath: '/algorithms/07-binary-search' },
  { id: '2', pagePath: '/dsa/algorithms/08-pseudocode-binary-search' },
  { id: '3', pagePath: '/data-structures/01-array' },
]

assert(
  getHighlightsForPath(highlights, '/dsa/algorithms/07-binary-search').length === 1,
  'filters highlights for base-prefixed path',
)
assert(
  getHighlightsForPath(highlights, '/algorithms/08-pseudocode-binary-search')[0]?.id === '2',
  'normalizes /dsa prefix on stored path',
)
assert(
  getHighlightsForPath(highlights, '/other').length === 0,
  'returns empty for unrelated path',
)

// coordinate conversion
assert(docToViewportTop(500, 200) === 300, 'docToViewportTop')
assert(viewportToDocTop(300, 200) === 500, 'viewportToDocTop roundtrip')
assert(
  viewportToDocTop(docToViewportTop(1200, 450), 450) === 1200,
  'roundtrip preserves docTop',
)

// applyManualLayout
const bounds = {
  contentRect: { left: 300, width: 700 },
  navBottom: 72,
  leftX: 60,
  rightX: 1020,
  hasLeft: true,
  hasRight: true,
}
const note = {
  id: 'n1',
  marginLayout: { docTop: 800, docLeft: 1050, updatedAt: 1 },
}
const manual = applyManualLayout(note, bounds, 90, 400, 0, 900, 1400)
assert(manual !== null, 'manual layout returns result')
assert(manual.top === 400, 'converts docTop to viewport top')
assert(manual.left === 1050, 'preserves docLeft at scrollX=0')
assert(manual.side === 'right', 'picks right side for far-right card')

const clamped = applyManualLayout(
  { id: 'n2', marginLayout: { docTop: 50, docLeft: 5, updatedAt: 1 } },
  bounds,
  90,
  0,
  0,
  900,
  1400,
)
assert(clamped.top === bounds.navBottom, 'clamps top to nav bottom')

// blockMatchesHighlight logic — same-page block IDs must match text snapshot
function blockMatchesHighlight(hl, blocks) {
  const block = blocks.find(b => b.id === hl.blockId)
  if (!block) return false
  const snap = hl.textSnapshot?.trim()
  if (!snap) return true
  return block.text.includes(snap)
}

const pageABlocks = [
  { id: '3', text: 'A data structure is just a way to organize data.' },
  { id: '5', text: 'Think of it like this:' },
]
const pageBBlocks = [
  { id: '3', text: 'Binary search requires a sorted array.' },
  { id: '5', text: 'The algorithm runs in O(log n).' },
]
const highlightForPageA = {
  blockId: '3',
  textSnapshot: 'data structure',
}

assert(
  blockMatchesHighlight(highlightForPageA, pageABlocks),
  'snapshot matches correct page blocks',
)
assert(
  !blockMatchesHighlight(highlightForPageA, pageBBlocks),
  'same block id on wrong page does not match snapshot',
)

// findNoteForHighlight logic (mirror of findNoteForHighlight.ts)
function findNoteForHighlight(highlightId, ctx) {
  if (!highlightId) return undefined
  const { notes, highlights, pagePath } = ctx
  const onPage = n => pathsMatch(n.pagePath, pagePath)

  const direct = notes.find(
    n => onPage(n) && n.anchorType === 'highlight' && n.anchorId === highlightId,
  )
  if (direct) return direct

  const clicked = highlights.find(h => h.id === highlightId)
  if (clicked?.noteId) {
    const via = notes.find(n => n.id === clicked.noteId && onPage(n))
    if (via) return via
  }

  const snap = (clicked?.textSnapshot || '').trim()
  if (snap) {
    for (const note of notes) {
      if (!onPage(note) || note.anchorType !== 'highlight' || !note.anchorId) continue
      const anchorHl = highlights.find(h => h.id === note.anchorId)
      if (anchorHl?.textSnapshot?.trim() === snap) return note
    }
  }
  return undefined
}

const noteFixtures = [
  { id: 'n1', pagePath: '/fundamentals/00-what-is-a-data-structure', anchorType: 'highlight', anchorId: 'h1', title: 'data structure', body: 'This is dsa' },
]
const hlFixtures = [
  { id: 'h1', pagePath: '/fundamentals/00-what-is-a-data-structure', textSnapshot: 'data structure', color: 'green' },
  { id: 'h2', pagePath: '/fundamentals/00-what-is-a-data-structure', textSnapshot: 'data structure', color: 'yellow' },
]
const fixturePage = '/fundamentals/00-what-is-a-data-structure'

assert(
  findNoteForHighlight('h1', { notes: noteFixtures, highlights: hlFixtures, pagePath: fixturePage })?.body === 'This is dsa',
  'direct anchorId lookup',
)
assert(
  findNoteForHighlight('h2', { notes: noteFixtures, highlights: hlFixtures, pagePath: fixturePage })?.body === 'This is dsa',
  'snapshot fallback finds note on duplicate highlight id',
)
assert(
  findNoteForHighlight('h9', { notes: noteFixtures, highlights: hlFixtures, pagePath: fixturePage }) === undefined,
  'unknown highlight returns undefined',
)

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)