import type { Router } from 'vitepress'
import type { Highlight } from '../composables/useStorage'
import { assignBlockIds } from './assignBlockIds'
import { ensureHighlightInDOM, sortHighlightsForRestore } from './highlightRestorer'
import { getHighlightsForPath } from './highlightPaths'
import { pageKeyFromRelativePath } from './pagePathKey'

export { getHighlightsForPath } from './highlightPaths'

export interface AnnotationRestoreContext {
  getAllHighlights: () => Highlight[]
  getPageKey: () => string
  isVisible: () => boolean
}

type RestoreListener = () => void

let context: AnnotationRestoreContext | null = null
let debounceTimer = 0
let applying = false
const restoreListeners = new Set<RestoreListener>()

function clearExistingMarks(): void {
  document.querySelectorAll('mark.dsa-hl').forEach(el => {
    const parent = el.parentNode
    if (!parent) return
    while (el.firstChild) parent.insertBefore(el.firstChild, el)
    parent.removeChild(el)
    parent.normalize()
  })
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

export function bindAnnotationRestore(ctx: AnnotationRestoreContext): void {
  context = ctx
}

export function onAnnotationsRestored(listener: RestoreListener): () => void {
  restoreListeners.add(listener)
  return () => restoreListeners.delete(listener)
}

/** Paint all highlights for the active VitePress page (uses page.relativePath). */
export function restoreHighlightsNow(): void {
  if (!context || typeof document === 'undefined' || applying) return
  if (!context.isVisible()) return

  const pageKey = context.getPageKey()
  if (!pageKey || pageKey === '/') return

  const highlights = getHighlightsForPath(context.getAllHighlights(), pageKey)
  if (!highlights.length) return

  const doc = document.querySelector('.vp-doc')
  if (!doc?.querySelector('p, h1, h2, h3, h4, li, td, th, blockquote, .custom-block')) {
    return
  }

  applying = true
  try {
    assignBlockIds()
    const ordered = sortHighlightsForRestore(highlights)
    for (const hl of ordered) {
      ensureHighlightInDOM(hl)
    }
    notifyRestored()
  } finally {
    applying = false
  }
}

export function scheduleAnnotationRestore(): void {
  if (!context || typeof document === 'undefined') return
  if (debounceTimer) window.clearTimeout(debounceTimer)
  debounceTimer = window.setTimeout(() => {
    debounceTimer = 0
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        restoreHighlightsNow()
      })
    })
  }, 0)
}

export function onPageContentUpdated(): void {
  scheduleAnnotationRestore()
}

export function setupAnnotationRouter(router: Router): void {
  const previousBefore = router.onBeforeRouteChange
  router.onBeforeRouteChange = async href => {
    if ((await previousBefore?.(href)) === false) return false
    if (typeof document === 'undefined') return
    clearExistingMarks()
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', () => {
      clearExistingMarks()
    })
  }
}

/** @deprecated Use pageKeyFromRelativePath — kept for scripts/tests importing from here. */
export function relativePathToPageKey(relativePath: string): string {
  return pageKeyFromRelativePath(relativePath)
}