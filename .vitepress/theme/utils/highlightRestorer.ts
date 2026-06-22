import type { Highlight } from '../composables/useStorage'
import { assignBlockIds, ensureBlockId, findContentBlock } from './assignBlockIds'

function escapeAttr(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value)
  }
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function findHighlightMark(id: string): HTMLElement | null {
  return document.querySelector(`mark[data-highlight-id="${escapeAttr(id)}"]`)
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
  return range
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

  try {
    range.surroundContents(mark)
    return true
  } catch {
    try {
      const fragment = range.extractContents()
      mark.appendChild(fragment)
      range.insertNode(mark)
      return true
    } catch {
      return false
    }
  }
}

const HIGHLIGHT_COLOR_CLASSES = ['dsa-hl-yellow', 'dsa-hl-green', 'dsa-hl-blue', 'dsa-hl-pink'] as const

export function updateHighlightColorInDOM(id: string, color: Highlight['color']): void {
  const mark = findHighlightMark(id)
  if (!mark) return
  mark.classList.remove(...HIGHLIGHT_COLOR_CLASSES)
  mark.classList.add(`dsa-hl-${color}`)
}

export function removeHighlightFromDOM(id: string) {
  const mark = findHighlightMark(id)
  if (!mark?.parentNode) return
  const parent = mark.parentNode
  while (mark.firstChild) parent.insertBefore(mark.firstChild, mark)
  parent.removeChild(mark)
  parent.normalize()
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