import type { Highlight, Note } from '../composables/useStorage'
import { getNoteAnchorElement } from './scrollToNote'

export interface NotePlacement {
  note: Note
  top: number
  left: number
  width: number
  height: number
  side: 'left' | 'right'
  anchorX: number
  anchorY: number
  cardAnchorX: number
  cardAnchorY: number
}

const CARD_WIDTH = 220
const CARD_GAP = 8
const CARD_EST_HEIGHT = 88
const VIEWPORT_PAD = 8
const MARGIN_GAP = 10

function contentColumnRect(): DOMRect | null {
  const el =
    document.querySelector('.vp-doc .content-container') ||
    document.querySelector('.vp-doc .content') ||
    document.querySelector('.vp-doc')
  return el?.getBoundingClientRect() ?? null
}

export function getNoteDocumentY(note: Note, highlights: Highlight[]): number {
  const el = getNoteAnchorElement(note, highlights)
  if (!el) return Number.POSITIVE_INFINITY
  const rect = el.getBoundingClientRect()
  return rect.top + window.scrollY
}

function marginLeft(contentRect: DOMRect): number {
  return contentRect.left - CARD_WIDTH - MARGIN_GAP
}

function marginRight(contentRect: DOMRect): number {
  return contentRect.right + MARGIN_GAP
}

function hasLeftRoom(contentRect: DOMRect): boolean {
  return marginLeft(contentRect) >= VIEWPORT_PAD
}

function hasRightRoom(contentRect: DOMRect): boolean {
  return marginRight(contentRect) + CARD_WIDTH <= window.innerWidth - VIEWPORT_PAD
}

function pickSide(anchorRect: DOMRect, contentRect: DOMRect): 'left' | 'right' {
  const leftOk = hasLeftRoom(contentRect)
  const rightOk = hasRightRoom(contentRect)
  if (leftOk && !rightOk) return 'left'
  if (rightOk && !leftOk) return 'right'
  if (!leftOk && !rightOk) return 'right'

  const anchorCenter = anchorRect.left + anchorRect.width / 2
  const contentCenter = contentRect.left + contentRect.width / 2
  return anchorCenter < contentCenter ? 'left' : 'right'
}

export function sortNotesByPagePosition(notes: Note[], highlights: Highlight[]): Note[] {
  return [...notes].sort((a, b) => getNoteDocumentY(a, highlights) - getNoteDocumentY(b, highlights))
}

export function layoutMarginNotes(
  notes: Note[],
  highlights: Highlight[],
  heights: Record<string, number> = {},
): NotePlacement[] {
  const contentRect = contentColumnRect()
  if (!contentRect) return []

  const navBottom = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--vp-nav-height') || '64',
    10,
  ) + VIEWPORT_PAD

  const items = sortNotesByPagePosition(notes, highlights)
    .map(note => ({
      note,
      anchorEl: getNoteAnchorElement(note, highlights),
    }))
    .filter((item): item is typeof item & { anchorEl: Element } => !!item.anchorEl)

  const placements: NotePlacement[] = []
  const lastBottom: Record<'left' | 'right', number> = { left: navBottom, right: navBottom }

  for (const { note, anchorEl } of items) {
    const anchorRect = anchorEl.getBoundingClientRect()
    const height = heights[note.id] || CARD_EST_HEIGHT
    const side = pickSide(anchorRect, contentRect)

    let top = anchorRect.top + anchorRect.height / 2 - height / 2
    top = Math.max(navBottom, top)
    if (top < lastBottom[side] + CARD_GAP) top = lastBottom[side] + CARD_GAP

    const maxTop = window.innerHeight - height - VIEWPORT_PAD
    top = Math.min(top, maxTop)

    lastBottom[side] = top + height

    const left = side === 'left' ? marginLeft(contentRect) : marginRight(contentRect)
    const anchorY = anchorRect.top + anchorRect.height / 2
    const anchorX = side === 'left' ? anchorRect.left : anchorRect.right
    const cardAnchorX = side === 'left' ? left + CARD_WIDTH : left
    const cardAnchorY = top + height / 2

    placements.push({
      note,
      top,
      left,
      width: CARD_WIDTH,
      height,
      side,
      anchorX,
      anchorY,
      cardAnchorX,
      cardAnchorY,
    })
  }

  return placements
}

export function connectorPath(placement: NotePlacement): string {
  const { cardAnchorX, cardAnchorY, anchorX, anchorY } = placement
  const midX = cardAnchorX + (anchorX - cardAnchorX) * 0.5
  return `M ${cardAnchorX} ${cardAnchorY} Q ${midX} ${cardAnchorY} ${anchorX} ${anchorY}`
}