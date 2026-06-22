import type { Router } from 'vitepress'
import type { Highlight } from '../composables/useStorage'
import { assignBlockIds } from './assignBlockIds'
import { ensureHighlightInDOM } from './highlightRestorer'
import { normalizePagePath } from './normalizePagePath'
import { scrollToHash } from './scrollToNote'

export interface AnnotationRestoreContext {
  getHighlights: () => Highlight[]
  isVisible: () => boolean
}

let context: AnnotationRestoreContext | null = null
let restoreToken = 0
let routerHooked = false

const MAX_ATTEMPTS = 28

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
  return Math.min(40 + attempt * 30, 350)
}

export function bindAnnotationRestore(ctx: AnnotationRestoreContext): void {
  context = ctx
}

export function setupAnnotationRouter(router: Router): void {
  if (routerHooked) return
  routerHooked = true

  // onAfterPageLoad runs before route.data updates; onAfterRouteChange runs after.
  const previous = router.onAfterRouteChange ?? router.onAfterRouteChanged
  router.onAfterRouteChange = async href => {
    await previous?.(href)
    scheduleAnnotationRestore(true)
  }
}

/**
 * Restore highlights after the route page is in the DOM. Retries until marks apply
 * or attempts are exhausted — fixes SPA sidebar navigation racing ahead of .vp-doc.
 */
export function scheduleAnnotationRestore(scrollHash = false): void {
  if (!context) return

  const token = ++restoreToken
  const expectedPath = normalizePagePath(window.location.pathname)

  void (async () => {
    await delay(0)

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      if (token !== restoreToken) return

      if (normalizePagePath(window.location.pathname) !== expectedPath) return

      const highlights = context!.getHighlights()
      const visible = context!.isVisible()

      if (!isDocReady()) {
        await delay(attemptDelay(attempt))
        continue
      }

      clearExistingMarks()
      await delay(0)
      if (token !== restoreToken) return

      if (visible && highlights.length > 0) {
        applyHighlights(highlights)

        const applied = countAppliedMarks(highlights)
        if (applied < highlights.length) {
          await delay(attemptDelay(attempt))
          continue
        }
      }

      if (scrollHash || window.location.hash) {
        scrollToNoteHash(highlights)
      }
      return
    }

    if (token !== restoreToken) return
    const highlights = context!.getHighlights()
    if (context!.isVisible() && highlights.length > 0) {
      applyHighlights(highlights)
    }
    if (scrollHash || window.location.hash) {
      scrollToNoteHash(highlights)
    }
  })()
}