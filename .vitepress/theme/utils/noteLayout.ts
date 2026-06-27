import type { Highlight, Note } from '../composables/useStorage'
import { getNoteAnchor } from './scrollToNote'

export type PlacementMode = 'margin' | 'adjacent' | 'pinned'

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
  manual: boolean
  pinned?: boolean
  placementMode?: PlacementMode
}

export const MARGIN_NOTES_MOBILE_MAX = 960

const CARD_WIDTH = 220
const SECTION_CARD_WIDTH = 200
const CARD_GAP = 8
const CARD_EST_HEIGHT = 88
const VIEWPORT_PAD = 8
const MARGIN_GAP = 12
const SECTION_GAP = 10

export interface LayoutBounds {
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
  const layoutTop = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--vp-layout-top-height') || '0',
    10,
  )
  const offlineBanner = document.querySelector('.offline-banner')
  const bannerH =
    offlineBanner instanceof HTMLElement ? offlineBanner.getBoundingClientRect().height : 0
  return navH + layoutTop + bannerH + VIEWPORT_PAD
}

function contentColumnRect(): DOMRect | null {
  const el =
    document.querySelector('.VPDoc .content-container') ||
    document.querySelector('.VPDoc .content') ||
    document.querySelector('.vp-doc')
  return el?.getBoundingClientRect() ?? null
}

export function layoutBounds(): LayoutBounds | null {
  const contentRect = contentColumnRect()
  if (!contentRect) return null

  const navSidebar = document.querySelector('.VPSidebar')
  const docAside = document.querySelector('.VPDoc .aside')

  const navSidebarRight = navSidebar?.getBoundingClientRect().right ?? VIEWPORT_PAD
  const asideRect = docAside?.getBoundingClientRect()
  const asideLeft =
    asideRect && asideRect.width > 0 ? asideRect.left : window.innerWidth

  let leftX = contentRect.left - CARD_WIDTH - MARGIN_GAP
  let rightX = contentRect.right + MARGIN_GAP

  let hasLeft = leftX >= navSidebarRight + VIEWPORT_PAD && leftX + CARD_WIDTH <= contentRect.left - 4
  let hasRight = rightX + CARD_WIDTH <= asideLeft - VIEWPORT_PAD && rightX >= contentRect.right + 4

  if (!hasLeft && !hasRight) {
    rightX = window.innerWidth - CARD_WIDTH - VIEWPORT_PAD
    hasRight = rightX >= contentRect.right - 8
    if (!hasRight) {
      rightX = Math.max(VIEWPORT_PAD, contentRect.right - CARD_WIDTH - 8)
      hasRight = true
    }
    hasLeft = false
    leftX = Math.max(VIEWPORT_PAD, contentRect.left - CARD_WIDTH - MARGIN_GAP)
  }

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

const LINE_TOLERANCE_PX = 6

export interface NoteSortKey {
  y: number
  x: number
}

export function docToViewportTop(docTop: number, scrollY: number): number {
  return docTop - scrollY
}

export function viewportToDocTop(viewportTop: number, scrollY: number): number {
  return viewportTop + scrollY
}

export function viewportToDocLeft(viewportLeft: number, scrollX: number): number {
  return viewportLeft + scrollX
}

export function clampHorizontalLeft(
  rawLeft: number,
  width: number,
  viewportWidth: number,
): number {
  return Math.max(VIEWPORT_PAD, Math.min(rawLeft, viewportWidth - width - VIEWPORT_PAD))
}

/**
 * Keep cards below the navbar without sticking when scrolled off-screen.
 * Returns null when the card would sit entirely above the nav band.
 */
export function clampNoteTopBelowNav(
  rawTop: number,
  height: number,
  bounds: LayoutBounds,
  viewportHeight: number,
): number | null {
  const maxTop = viewportHeight - height - VIEWPORT_PAD
  if (rawTop + height <= bounds.navBottom) return null
  const top = Math.min(Math.max(rawTop, bounds.navBottom), maxTop)
  if (!isBoxInView(top, height, bounds.navBottom)) return null
  return top
}

/** Page notes stick under the navbar; only horizontal position is user-controlled. */
export function applyPageNoteStickyLayout(
  note: Note,
  bounds: LayoutBounds,
  height: number,
  scrollX: number,
  viewportWidth: number,
  stackedTop: number,
): { top: number; left: number; side: 'left' | 'right' } {
  let side: 'left' | 'right' = bounds.hasRight ? 'right' : 'left'
  if (side === 'right' && !bounds.hasRight) side = 'left'
  if (side === 'left' && !bounds.hasLeft) side = 'right'

  let left = sideX(side, bounds)
  if (note.marginLayout) {
    left = clampHorizontalLeft(note.marginLayout.docLeft - scrollX, CARD_WIDTH, viewportWidth)
    const contentCenter = bounds.contentRect.left + bounds.contentRect.width / 2
    side = left + CARD_WIDTH / 2 < contentCenter ? 'left' : 'right'
  }

  const top = Math.max(bounds.navBottom, stackedTop)
  return { top, left, side }
}

export function applyManualLayout(
  note: Note,
  bounds: LayoutBounds,
  height: number,
  scrollY: number,
  scrollX: number,
  viewportHeight: number,
  viewportWidth: number,
): { top: number; left: number; side: 'left' | 'right' } | null {
  if (!note.marginLayout) return null
  if (note.anchorType === 'free') return null

  const rawTop = docToViewportTop(note.marginLayout.docTop, scrollY)
  const rawLeft = note.marginLayout.docLeft - scrollX

  const top = clampNoteTopBelowNav(rawTop, height, bounds, viewportHeight)
  if (top === null) return null

  const left = clampHorizontalLeft(rawLeft, CARD_WIDTH, viewportWidth)

  const contentCenter = bounds.contentRect.left + bounds.contentRect.width / 2
  const side: 'left' | 'right' = left + CARD_WIDTH / 2 < contentCenter ? 'left' : 'right'

  return { top, left, side }
}

export function getNoteSortKey(note: Note, highlights: Highlight[]): NoteSortKey {
  const anchor = getNoteAnchor(note, highlights)
  if (!anchor) return { y: Number.POSITIVE_INFINITY, x: Number.POSITIVE_INFINITY }
  return {
    y: anchor.rect.top + window.scrollY,
    x: anchor.rect.left + window.scrollX,
  }
}

export function getNoteDocumentY(note: Note, highlights: Highlight[]): number {
  return getNoteSortKey(note, highlights).y
}

function compareNoteSortKeys(a: NoteSortKey, b: NoteSortKey): number {
  if (Math.abs(a.y - b.y) > LINE_TOLERANCE_PX) return a.y - b.y
  return a.x - b.x
}

function pickSide(anchorRect: DOMRect, bounds: LayoutBounds): 'left' | 'right' {
  if (bounds.hasLeft && !bounds.hasRight) return 'left'
  if (bounds.hasRight && !bounds.hasLeft) return 'right'

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

function buildPlacement(
  note: Note,
  anchor: NonNullable<ReturnType<typeof getNoteAnchor>>,
  top: number,
  left: number,
  height: number,
  side: 'left' | 'right',
  manual: boolean,
  options: { pinned?: boolean; placementMode?: PlacementMode; width?: number } = {},
): NotePlacement {
  const width = options.width ?? CARD_WIDTH
  const anchorRect = anchor.rect
  const anchorY = anchorRect.top + anchorRect.height / 2
  const anchorX = side === 'left' ? anchorRect.left : anchorRect.right
  const cardAnchorX = side === 'left' ? left + width : left
  const cardAnchorY = top + height / 2
  const pinned = options.pinned ?? false
  const placementMode = options.placementMode ?? (pinned ? 'pinned' : 'margin')

  return {
    note,
    top,
    left,
    width,
    height,
    side,
    anchorX,
    anchorY,
    cardAnchorX,
    cardAnchorY,
    manual,
    pinned,
    placementMode,
  }
}

function layoutAdjacentHeading(
  note: Note,
  anchor: NonNullable<ReturnType<typeof getNoteAnchor>>,
  bounds: LayoutBounds,
  height: number,
  lastBottom: Record<'left' | 'right', number>,
): NotePlacement | null {
  const anchorRect = anchor.rect
  if (!isAnchorInView(anchorRect, bounds.navBottom)) return null

  let side: 'left' | 'right' = 'right'
  let left = anchorRect.right + SECTION_GAP

  if (left + SECTION_CARD_WIDTH > window.innerWidth - VIEWPORT_PAD) {
    side = 'left'
    left = anchorRect.left - SECTION_CARD_WIDTH - SECTION_GAP
  }

  if (left < VIEWPORT_PAD) {
    side = bounds.hasRight ? 'right' : 'left'
    left = side === 'right' ? bounds.rightX : bounds.leftX
  }

  let top = anchorRect.top + anchorRect.height / 2 - height / 2
  if (lastBottom[side] > -Infinity && top < lastBottom[side] + CARD_GAP) {
    top = lastBottom[side] + CARD_GAP
  }

  top = Math.max(
    bounds.navBottom,
    Math.min(top, window.innerHeight - height - VIEWPORT_PAD),
  )

  if (!isBoxInView(top, height, bounds.navBottom)) return null

  lastBottom[side] = top + height

  return buildPlacement(note, anchor, top, left, height, side, false, {
    placementMode: 'adjacent',
    width: SECTION_CARD_WIDTH,
  })
}

export function sortNotesByPagePosition(notes: Note[], highlights: Highlight[]): Note[] {
  return [...notes].sort((a, b) =>
    compareNoteSortKeys(getNoteSortKey(a, highlights), getNoteSortKey(b, highlights)),
  )
}

export function layoutMarginNotes(
  notes: Note[],
  highlights: Highlight[],
  heights: Record<string, number> = {},
): NotePlacement[] {
  if (isMarginNotesMobile()) return []

  const bounds = layoutBounds()
  if (!bounds) return []

  const scrollY = window.scrollY
  const scrollX = window.scrollX

  const items = sortNotesByPagePosition(notes, highlights)
    .map(note => ({
      note,
      anchor: getNoteAnchor(note, highlights),
    }))
    .filter((item): item is typeof item & { anchor: NonNullable<typeof item.anchor> } => !!item.anchor)

  const placements: NotePlacement[] = []
  const lastBottom: Record<'left' | 'right', number> = { left: -Infinity, right: -Infinity }

  const pinnedItems = items.filter(item => item.note.anchorType === 'free')
  const regularItems = items.filter(item => item.note.anchorType !== 'free')

  for (const { note, anchor } of pinnedItems) {
    const height = heights[note.id] || CARD_EST_HEIGHT
    let side: 'left' | 'right' = bounds.hasRight ? 'right' : 'left'
    if (side === 'right' && !bounds.hasRight) side = 'left'
    if (side === 'left' && !bounds.hasLeft) side = 'right'

    let stackedTop = bounds.navBottom
    if (lastBottom[side] > -Infinity && stackedTop < lastBottom[side] + CARD_GAP) {
      stackedTop = lastBottom[side] + CARD_GAP
    }

    const sticky = applyPageNoteStickyLayout(
      note,
      bounds,
      height,
      scrollX,
      window.innerWidth,
      stackedTop,
    )

    lastBottom[sticky.side] = sticky.top + height
    placements.push(
      buildPlacement(note, anchor, sticky.top, sticky.left, height, sticky.side, !!note.marginLayout, {
        pinned: true,
        placementMode: 'pinned',
      }),
    )
  }

  const autoItems = regularItems.filter(item => !item.note.marginLayout)
  const manualItems = regularItems.filter(item => item.note.marginLayout)
  const headingAutoItems = autoItems.filter(item => item.note.anchorType === 'heading')
  const marginAutoItems = autoItems.filter(item => item.note.anchorType !== 'heading')

  for (const { note, anchor } of manualItems) {
    const height = heights[note.id] || CARD_EST_HEIGHT
    const manual = applyManualLayout(
      note,
      bounds,
      height,
      scrollY,
      scrollX,
      window.innerHeight,
      window.innerWidth,
    )
    if (!manual) continue

    placements.push(
      buildPlacement(note, anchor, manual.top, manual.left, height, manual.side, true, {
        placementMode: note.anchorType === 'heading' ? 'adjacent' : 'margin',
      }),
    )
  }

  for (const { note, anchor } of headingAutoItems) {
    const height = heights[note.id] || CARD_EST_HEIGHT
    const placement = layoutAdjacentHeading(note, anchor, bounds, height, lastBottom)
    if (placement) placements.push(placement)
  }

  for (const { note, anchor } of marginAutoItems) {
    const anchorRect = anchor.rect
    if (!isAnchorInView(anchorRect, bounds.navBottom)) continue

    const height = heights[note.id] || CARD_EST_HEIGHT
    const idealTop = anchorRect.top + anchorRect.height / 2 - height / 2

    let side = pickSide(anchorRect, bounds)
    if (side === 'left' && !bounds.hasLeft) side = 'right'
    if (side === 'right' && !bounds.hasRight) side = 'left'

    let top = idealTop
    if (lastBottom[side] > -Infinity && top < lastBottom[side] + CARD_GAP) {
      top = lastBottom[side] + CARD_GAP
    }

    const clampedTop = clampNoteTopBelowNav(top, height, bounds, window.innerHeight)
    if (clampedTop === null) continue
    top = clampedTop

    lastBottom[side] = top + height

    const left = sideX(side, bounds)
    placements.push(
      buildPlacement(note, anchor, top, left, height, side, false, { placementMode: 'margin' }),
    )
  }

  return placements
}

export function connectorPath(placement: NotePlacement): string {
  const { cardAnchorX, cardAnchorY, anchorX, anchorY } = placement
  const midX = cardAnchorX + (anchorX - cardAnchorX) * 0.5
  return `M ${cardAnchorX} ${cardAnchorY} Q ${midX} ${cardAnchorY} ${anchorX} ${anchorY}`
}