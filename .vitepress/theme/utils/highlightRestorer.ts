import type { Highlight } from '../composables/useStorage'
import { assignBlockIds, ensureBlockId, findContentBlock } from './assignBlockIds'

const CODE_BLOCK_SELECTOR = 'pre, .vp-code-group, .language-'

function escapeAttr(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value)
  }
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function findHighlightMark(id: string): HTMLElement | null {
  return document.querySelector(`mark[data-highlight-id="${escapeAttr(id)}"]`)
}

function isInlineCodeElement(el: Element | null): boolean {
  if (!el || el.tagName !== 'CODE') return false
  return !el.closest(CODE_BLOCK_SELECTOR)
}

function nodeInsideInlineCode(node: Node | null): boolean {
  if (!node) return false
  const el = node instanceof Element ? node : node.parentElement
  return isInlineCodeElement(el?.closest('code') ?? null)
}

/** True when the range touches inline `code` (not fenced code blocks). */
export function rangeTouchesInlineCode(range: Range): boolean {
  if (nodeInsideInlineCode(range.startContainer) || nodeInsideInlineCode(range.endContainer)) {
    return true
  }

  const ancestor = range.commonAncestorContainer
  const root =
    ancestor instanceof Element ? ancestor : ancestor.parentElement
  if (!root) return false

  const codes = root.querySelectorAll('code')
  for (const code of codes) {
    if (!isInlineCodeElement(code)) continue
    try {
      if (range.intersectsNode(code)) return true
    } catch {
      /* intersectsNode throws for detached nodes */
    }
  }

  return false
}

/** Remove empty inline code/mark shells left by broken highlight DOM ops. */
export function cleanupHighlightArtifacts(root: ParentNode = document): void {
  const scope = root instanceof Document ? root.querySelector('.vp-doc') : root
  if (!scope) return

  scope.querySelectorAll('code').forEach(code => {
    if (!isInlineCodeElement(code)) return
    const hasContent = (code.textContent || '').length > 0
    const hasMark = code.querySelector('mark.dsa-hl')
    if (!hasContent && !hasMark) code.remove()
  })

  scope.querySelectorAll('mark.dsa-hl').forEach(mark => {
    if (!(mark.textContent || '').length && !mark.children.length) mark.remove()
  })
}

function resolveBlock(highlight: Highlight): Element | null {
  const matches = document.querySelectorAll(`[data-dsa-block="${escapeAttr(highlight.blockId)}"]`)
  if (matches.length === 0) return null
  if (matches.length === 1) return matches[0]

  const snap = highlight.textSnapshot
  for (const el of matches) {
    if (snap && (el.textContent || '').includes(snap)) return el
  }
  return matches[0]
}

function getTextNodes(element: Node): Text[] {
  const nodes: Text[] = []
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
  let node: Node | null
  while ((node = walker.nextNode())) {
    if (node.textContent?.length) nodes.push(node as Text)
  }
  return nodes
}

function findOffsetPosition(
  block: Element,
  startOffset: number,
  endOffset: number
): { startNode: Text; startOff: number; endNode: Text; endOff: number } | null {
  const textNodes = getTextNodes(block)
  let pos = 0

  let startNode: Text | null = null
  let startOff = 0
  let endNode: Text | null = null
  let endOff = 0

  for (const node of textNodes) {
    const len = node.textContent?.length ?? 0
    if (!startNode && pos + len > startOffset) {
      startNode = node
      startOff = startOffset - pos
    }
    if (!endNode && pos + len >= endOffset) {
      endNode = node
      endOff = endOffset - pos
      break
    }
    pos += len
  }

  if (startNode && endNode) return { startNode, startOff, endNode, endOff }
  return null
}

function fuzzyFindSnapshot(block: Element, snapshot: string): { start: number; end: number } | null {
  const text = block.textContent || ''
  const idx = text.indexOf(snapshot)
  if (idx >= 0) return { start: idx, end: idx + snapshot.length }
  return null
}

function resolveHighlightOffsets(
  highlight: Highlight,
  block: Element,
): { start: number; end: number; pos: NonNullable<ReturnType<typeof findOffsetPosition>> } | null {
  let start = highlight.startOffset
  let end = highlight.endOffset

  let pos = findOffsetPosition(block, start, end)
  if (!pos) {
    const fuzzy = fuzzyFindSnapshot(block, highlight.textSnapshot)
    if (!fuzzy) return null
    start = fuzzy.start
    end = fuzzy.end
    pos = findOffsetPosition(block, start, end)
    if (!pos) return null
  }

  return { start, end, pos }
}

/** Build a DOM Range for a stored highlight without mutating the document. */
export function buildHighlightRange(highlight: Highlight): Range | null {
  assignBlockIds()
  const block = resolveBlock(highlight)
  if (!block) return null

  const resolved = resolveHighlightOffsets(highlight, block)
  if (!resolved) return null

  const range = document.createRange()
  range.setStart(resolved.pos.startNode, resolved.pos.startOff)
  range.setEnd(resolved.pos.endNode, resolved.pos.endOff)

  if (rangeTouchesInlineCode(range) && range.startContainer !== range.endContainer) {
    return null
  }

  return range
}

/**
 * Wrap a range with a mark using text-node splits only when possible.
 * Avoids extractContents/surroundContents across inline code boundaries.
 */
function wrapRangeWithMark(range: Range, mark: HTMLElement): boolean {
  if (range.collapsed) return false
  if (rangeTouchesInlineCode(range) && range.startContainer !== range.endContainer) {
    return false
  }

  if (range.startContainer === range.endContainer && range.startContainer.nodeType === Node.TEXT_NODE) {
    const text = range.startContainer as Text
    const parent = text.parentNode
    if (!parent) return false

    let segment = text
    if (range.startOffset > 0) segment = text.splitText(range.startOffset)
    segment.splitText(range.endOffset - range.startOffset)
    parent.insertBefore(mark, segment)
    mark.appendChild(segment)
    return true
  }

  if (rangeTouchesInlineCode(range)) return false

  try {
    range.surroundContents(mark)
    return true
  } catch {
    return false
  }
}

export function ensureHighlightInDOM(highlight: Highlight): boolean {
  assignBlockIds()
  if (findHighlightMark(highlight.id)) return true
  return applyHighlightToDOM(highlight)
}

export function applyHighlightToDOM(highlight: Highlight): boolean {
  const range = buildHighlightRange(highlight)
  if (!range) return false

  const mark = document.createElement('mark')
  mark.className = `dsa-hl dsa-hl-${highlight.color}`
  mark.dataset.highlightId = highlight.id

  const ok = wrapRangeWithMark(range, mark)
  if (ok) cleanupHighlightArtifacts()
  return ok
}

export function removeHighlightFromDOM(id: string) {
  const mark = findHighlightMark(id)
  if (!mark?.parentNode) return
  const parent = mark.parentNode
  while (mark.firstChild) parent.insertBefore(mark.firstChild, mark)
  parent.removeChild(mark)
  parent.normalize()
  cleanupHighlightArtifacts()
}

export function getSelectionAnchor(): {
  blockId: string
  startOffset: number
  endOffset: number
  textSnapshot: string
} | null {
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null

  let range: Range
  try {
    range = sel.getRangeAt(0)
  } catch {
    return null
  }

  const doc = document.querySelector('.vp-doc')
  if (!doc?.contains(range.commonAncestorContainer)) return null

  if (rangeTouchesInlineCode(range)) return null

  const block = findContentBlock(range.startContainer)
  if (!block) return null

  const blockId = ensureBlockId(block)

  const preRange = document.createRange()
  preRange.selectNodeContents(block)
  preRange.setEnd(range.startContainer, range.startOffset)
  const startOffset = preRange.toString().length
  const endOffset = startOffset + range.toString().length
  const textSnapshot = range.toString()

  if (!textSnapshot.trim()) return null

  return {
    blockId,
    startOffset,
    endOffset,
    textSnapshot,
  }
}