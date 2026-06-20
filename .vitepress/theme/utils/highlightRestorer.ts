import type { Highlight } from '../composables/useStorage'

function getTextNodes(element: Node): Text[] {
  const nodes: Text[] = []
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
  let node: Node | null
  while ((node = walker.nextNode())) {
    if (node.textContent?.trim()) nodes.push(node as Text)
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

export function applyHighlightToDOM(highlight: Highlight): boolean {
  const block = document.querySelector(`[data-dsa-block="${highlight.blockId}"]`)
  if (!block) return false

  let start = highlight.startOffset
  let end = highlight.endOffset

  let pos = findOffsetPosition(block, start, end)
  if (!pos) {
    const fuzzy = fuzzyFindSnapshot(block, highlight.textSnapshot)
    if (!fuzzy) return false
    start = fuzzy.start
    end = fuzzy.end
    pos = findOffsetPosition(block, start, end)
    if (!pos) return false
  }

  const range = document.createRange()
  range.setStart(pos.startNode, pos.startOff)
  range.setEnd(pos.endNode, pos.endOff)

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

export function removeHighlightFromDOM(id: string) {
  const mark = document.querySelector(`mark[data-highlight-id="${id}"]`)
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
  if (!sel || sel.isCollapsed || !sel.rangeCount) return null

  const range = sel.getRangeAt(0)
  const doc = document.querySelector('.vp-doc')
  if (!doc?.contains(range.commonAncestorContainer)) return null

  const block = (range.startContainer as Element).closest?.('[data-dsa-block]')
    ?? (range.startContainer.parentElement)?.closest?.('[data-dsa-block]')
  if (!block) return null

  const preRange = document.createRange()
  preRange.selectNodeContents(block)
  preRange.setEnd(range.startContainer, range.startOffset)
  const startOffset = preRange.toString().length
  const endOffset = startOffset + range.toString().length
  const textSnapshot = range.toString()

  if (!textSnapshot.trim()) return null

  return {
    blockId: block.getAttribute('data-dsa-block') || '',
    startOffset,
    endOffset,
    textSnapshot,
  }
}