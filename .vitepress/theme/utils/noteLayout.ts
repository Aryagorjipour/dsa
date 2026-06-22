import type { Highlight, Note } from '../composables/useStorage'
import { getNoteAnchor } from './scrollToNote'

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

export const MARGIN_NOTES_MOBILE_MAX = 960

const CARD_WIDTH = 220
const CARD_GAP = 8
const CARD_EST_HEIGHT = 88
const VIEWPORT_PAD = 8
const MARGIN_GAP = 12

interface LayoutBounds {
  contentRect: DOMRect
  navBottom: number
  leftX: number
  rightX: number
  hasLeft: boolean
  hasRight: boolean
}

function navBottom(): number {
  const navH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--vp-nav-height') || '64',
    10,
  )
  return navH + VIEWPORT_PAD
}

function contentColumnRect(): DOMRect | null {
  const el =
    document.querySelector('.VPDoc .content-container') ||
    document.querySelector('.VPDoc .content') ||
    document.querySelector('.vp-doc')
  return el?.getBoundingClientRect() ?? null
}

function layoutBounds(): LayoutBounds | null {
  const contentRect = contentColumnRect()
  if (!contentRect) return null

  const sidebar = document.querySelector('.VPSidebar')
  const aside = document.querySelector('.VPDocAside, .aside')

  const sidebarRight = sidebar?.getBoundingClientRect().right ?? VIEWPORT_PAD
  const asideLeft = aside?.getBoundingClientRect().left ?? window.innerWidth

  const leftX = contentRect.left - CARD_WIDTH - MARGIN_GAP
  const rightX = contentRect.right + MARGIN_GAP

  const hasLeft = leftX >= sidebarRight + VIEWPORT_PAD && leftX + CARD_WIDTH <= contentRect.left - 4
  const hasRight = rightX + CARD_WIDTH <= asideLeft - VIEWPORT_PAD && rightX >= contentRect.right + 4

  return {
    contentRect,
    navBottom: navBottom(),
    leftX,
    rightX,
    hasLeft,
    hasRight,
  }
}

export function isMarginNotesMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth <= MARGIN_NOTES_MOBILE_MAX
}

export function getNoteDocumentY(note: Note, highlights: Highlight[]): number {
  const anchor = getNoteAnchor(note, highlights)
  if (!anchor) return Number.POSITIVE_INFINITY
  return anchor.rect.top + window.scrollY
}

function pickSide(anchorRect: DOMRect, bounds: LayoutBounds): 'left' | 'right' {
  if (bounds.hasLeft && !bounds.hasRight) return 'left'
  if (bounds.hasRight && !bounds.hasLeft) return 'right'
  if (!bounds.hasLeft && !bounds.hasRight) return 'right'

  const anchorCenter = anchorRect.left + anchorRect.width / 2
  const contentCenter = bounds.contentRect.left + bounds.contentRect.width / 2
  return anchorCenter < contentCenter ? 'left' : 'right'
}

function sideX(side: 'left' | 'right', bounds: LayoutBounds): number {
  return side === 'left' ? bounds.leftX : bounds.rightX
}

function isAnchorInView(rect: DOMRect, topBound: number): boolean {
  return rect.bottom > topBound && rect.top < window.innerHeight - VIEWPORT_PAD
}

function isBoxInView(top: number, height: number, topBound: number): boolean {
  return top + height > topBound && top < window.innerHeight - VIEWPORT_PAD
}

function fitsOnSide(
  top: number,
  height: number,
  side: 'left' | 'right',
  lastBottom: Record<'left' | 'right', number>,
  topBound: number,
): boolean {
  if (!isBoxInView(top, height, topBound)) return false
  if (lastBottom[side] > -Infinity && top < lastBottom[side] + CARD_GAP) return false
  return true
}

export function sortNotesByPagePosition(notes: Note[], highlights: Highlight[]): Note[] {
  return [...notes].sort((a, b) => getNoteDocumentY(a, highlights) - getNoteDocumentY(b, highlights))
}

export function layoutMarginNotes(
  notes: Note[],
  highlights: Highlight[],
  heights: Record<string, number> = {},
): NotePlacement[] {
  if (isMarginNotesMobile()) return []

  const bounds = layoutBounds()
  if (!bounds) return []

  const items = sortNotesByPagePosition(notes, highlights)
    .map(note => ({
      note,
      anchor: getNoteAnchor(note, highlights),
    }))
    .filter((item): item is typeof item & { anchor: NonNullable<typeof item.anchor> } => !!item.anchor)

  const placements: NotePlacement[] = []
  const lastBottom: Record<'left' | 'right', number> = { left: -Infinity, right: -Infinity }

  for (const { note, anchor } of items) {
    const anchorRect = anchor.rect
    if (!isAnchorInView(anchorRect, bounds.navBottom)) continue

    const height = heights[note.id] || CARD_EST_HEIGHT
    const idealTop = anchorRect.top + anchorRect.height / 2 - height / 2

    let side = pickSide(anchorRect, bounds)
    if (side === 'left' && !bounds.hasLeft) side = 'right'
    if (side === 'right' && !bounds.hasRight) side = 'left'
    if (!bounds.hasLeft && !bounds.hasRight) continue

    let top = idealTop
    let placed = fitsOnSide(top, height, side, lastBottom, bounds.navBottom)

    if (!placed) {
      const alt: 'left' | 'right' = side === 'left' ? 'right' : 'left'
      if ((alt === 'left' && bounds.hasLeft) || (alt === 'right' && bounds.hasRight)) {
        if (fitsOnSide(idealTop, height, alt, lastBottom, bounds.navBottom)) {
          side = alt
          top = idealTop
          placed = true
        }
      }
    }

    if (!placed) {
      top = idealTop
      if (lastBottom[side] > -Infinity && top < lastBottom[side] + CARD_GAP) {
        top = lastBottom[side] + CARD_GAP
      }
      if (!isBoxInView(top, height, bounds.navBottom)) continue
    }

    lastBottom[side] = top + height

    const left = sideX(side, bounds)
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