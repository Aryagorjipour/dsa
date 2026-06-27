import { nextTick } from 'vue'
import type { Router } from 'vitepress'
import type { Highlight } from '../composables/useStorage'
import { assignBlockIds } from './assignBlockIds'
import { ensureHighlightInDOM } from './highlightRestorer'
import { normalizePagePath } from './normalizePagePath'
import { pathsMatch } from './pagePathKey'
import { scrollToHash } from './scrollToNote'

export interface AnnotationRestoreContext {
  getAllHighlights: () => Highlight[]
  getActivePath: () => string
  getRoutePath: () => string
  isVisible: () => boolean
}

type RestoreListener = () => void

let context: AnnotationRestoreContext | null = null
let restoreToken = 0
let routerHooked = false
let debounceTimer = 0
const restoreListeners = new Set<RestoreListener>()

const MAX_ATTEMPTS = 24

/** Pure helper — filter highlights for a canonical page path. */
export function getHighlightsForPath(all: Highlight[], path: string): Highlight[] {
  return all.filter(h => pathsMatch(h.pagePath, path))
}

function escapeAttr(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value)
  }
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function isDocReady(): boolean {
  const doc = document.querySelector('.vp-doc')
  if (!doc) return false
  return !!doc.querySelector('p, h1, h2, h3, h4, li, td, th, blockquote, .custom-block')
}

/**
 * Block IDs (data-dsa-block) restart at 0 on every page. During SPA navigation the
 * previous page may still be in the DOM with the same numeric IDs — require the
 * highlight's text snapshot to appear in the candidate block before we treat the
 * page as ready.
 */
function blockMatchesHighlight(hl: Highlight): boolean {
  const block = document.querySelector(`[data-dsa-block="${escapeAttr(hl.blockId)}"]`)
  if (!block) return false
  const snap = hl.textSnapshot?.trim()
  if (!snap) return true
  return (block.textContent || '').includes(snap)
}

function pageContentReady(highlights: Highlight[]): boolean {
  if (!isDocReady()) return false
  if (!highlights.length) return true

  let matched = 0
  const threshold = Math.min(2, highlights.length)
  for (const hl of highlights) {
    if (blockMatchesHighlight(hl)) {
      matched++
      if (matched >= threshold) return true
    }
  }
  return false
}

function stampDocPagePath(path: string): void {
  const doc = document.querySelector('.vp-doc')
  if (doc) doc.setAttribute('data-dsa-page-path', path)
}

function docPagePathMatches(expectedPath: string): boolean {
  const doc = document.querySelector('.vp-doc')
  if (!doc) return false
  const stamped = doc.getAttribute('data-dsa-page-path')
  return stamped === expectedPath
}

function isRouteAndDocReady(expectedPath: string, highlights: Highlight[]): boolean {
  if (!context) return false
  if (normalizePagePath(window.location.pathname) !== expectedPath) return false
  if (normalizePagePath(context.getRoutePath()) !== expectedPath) return false
  if (!docPagePathMatches(expectedPath)) return false
  return pageContentReady(highlights)
}

function countAppliedMarks(highlights: Highlight[]): number {
  if (!highlights.length) return 0
  let count = 0
  for (const hl of highlights) {
    if (document.querySelector(`mark[data-highlight-id="${escapeAttr(hl.id)}"]`)) {
      count++
    }
  }
  return count
}

function clearExistingMarks(): void {
  document.querySelectorAll('mark.dsa-hl').forEach(el => {
    const parent = el.parentNode
    if (!parent) return
    while (el.firstChild) parent.insertBefore(el.firstChild, el)
    parent.removeChild(el)
    parent.normalize()
  })
}

function applyHighlights(highlights: Highlight[]): void {
  assignBlockIds()
  for (const hl of highlights) {
    ensureHighlightInDOM(hl)
  }
}

function scrollToNoteHash(highlights: Highlight[]): void {
  const hash = window.location.hash
  if (!hash) return
  scrollToHash(hash, highlights)
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => window.setTimeout(resolve, ms))
}

function attemptDelay(attempt: number): number {
  return Math.min(50 + attempt * 40, 350)
}

function notifyRestored(): void {
  for (const listener of restoreListeners) {
    try {
      listener()
    } catch {
      /* ignore listener errors */
    }
  }
}

function highlightsForRestore(expectedPath: string): Highlight[] {
  if (!context) return []
  return getHighlightsForPath(context.getAllHighlights(), expectedPath)
}

export function bindAnnotationRestore(ctx: AnnotationRestoreContext): void {
  context = ctx
}

export function onAnnotationsRestored(listener: RestoreListener): () => void {
  restoreListeners.add(listener)
  return () => restoreListeners.delete(listener)
}

export function cancelAnnotationRestore(): void {
  restoreToken++
  if (debounceTimer) {
    window.clearTimeout(debounceTimer)
    debounceTimer = 0
  }
}

function onNavigationStart(): void {
  cancelAnnotationRestore()
  clearExistingMarks()
  const doc = document.querySelector('.vp-doc')
  doc?.removeAttribute('data-dsa-page-path')
}

/**
 * Called when VitePress finishes mounting/updating markdown in the DOM.
 * This is the reliable restore trigger — router hooks fire before the new page vnode exists.
 */
export function onPageContentUpdated(): void {
  if (!context || typeof document === 'undefined') return
  const path = normalizePagePath(context.getRoutePath())
  stampDocPagePath(path)
  scheduleAnnotationRestore(false)
}

export function setupAnnotationRouter(router: Router): void {
  if (routerHooked) return
  routerHooked = true

  const previousBefore = router.onBeforeRouteChange
  router.onBeforeRouteChange = async href => {
    if ((await previousBefore?.(href)) === false) return false
    if (typeof document === 'undefined') return
    onNavigationStart()
  }

  const previousAfterPage = router.onAfterPageLoad
  router.onAfterPageLoad = async href => {
    await previousAfterPage?.(href)
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', () => {
      onNavigationStart()
    })
  }
}

async function runRestore(token: number, expectedPath: string, scrollHash: boolean): Promise<void> {
  let cleared = false

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (token !== restoreToken) return
    if (normalizePagePath(window.location.pathname) !== expectedPath) return

    const highlights = highlightsForRestore(expectedPath)
    const visible = context!.isVisible()

    if (!isRouteAndDocReady(expectedPath, highlights)) {
      await delay(attemptDelay(attempt))
      continue
    }

    if (visible && highlights.length > 0) {
      if (!cleared) {
        clearExistingMarks()
        cleared = true
        await delay(0)
        if (token !== restoreToken) return
      }

      applyHighlights(highlights)

      const applied = countAppliedMarks(highlights)
      if (applied < highlights.length) {
        await delay(attemptDelay(attempt))
        continue
      }
    } else if (!cleared) {
      clearExistingMarks()
      cleared = true
    }

    if (scrollHash || window.location.hash) {
      scrollToNoteHash(highlights)
    }

    notifyRestored()
    return
  }

  if (token !== restoreToken) return

  const highlights = highlightsForRestore(expectedPath)
  if (context!.isVisible() && highlights.length > 0 && isRouteAndDocReady(expectedPath, highlights)) {
    if (!cleared) clearExistingMarks()
    applyHighlights(highlights)
  }
  if (scrollHash || window.location.hash) {
    scrollToNoteHash(highlights)
  }
  notifyRestored()
}

/**
 * Restore highlights after the route page is in the DOM. Retries until marks apply
 * or attempts are exhausted — fixes SPA sidebar navigation racing ahead of .vp-doc.
 */
export function scheduleAnnotationRestore(scrollHash = false): void {
  if (!context) return

  if (debounceTimer) window.clearTimeout(debounceTimer)

  debounceTimer = window.setTimeout(() => {
    debounceTimer = 0
    const token = ++restoreToken
    const expectedPath = normalizePagePath(window.location.pathname)
    void runRestore(token, expectedPath, scrollHash)
  }, 16)
}