const LINE_TOLERANCE_PX = 4

export function clearLinePointer(blockEl: HTMLElement): void {
  blockEl.querySelector('.dsa-tts-line-pointer')?.remove()
}

export function setLinePointer(blockEl: HTMLElement, displayWordIndex: number): void {
  const wordEl = blockEl.querySelector(
    `.dsa-tts-word[data-tts-word="${displayWordIndex}"]`,
  ) as HTMLElement | null

  if (!wordEl) {
    clearLinePointer(blockEl)
    return
  }

  const blockRect = blockEl.getBoundingClientRect()
  const wordRect = wordEl.getBoundingClientRect()
  const lineTop = wordRect.top - blockRect.top

  let pointer = blockEl.querySelector('.dsa-tts-line-pointer') as HTMLElement | null
  if (!pointer) {
    pointer = document.createElement('span')
    pointer.className = 'dsa-tts-line-pointer'
    pointer.setAttribute('aria-hidden', 'true')
    blockEl.appendChild(pointer)
  }

  const pointerHeight = pointer.offsetHeight || 8
  pointer.style.top = `${lineTop + (wordRect.height - pointerHeight) / 2}px`
}

export function lineTopForWordIndex(
  wordTops: number[],
  displayWordIndex: number,
): number | null {
  if (!wordTops.length || displayWordIndex < 0 || displayWordIndex >= wordTops.length) {
    return null
  }
  return wordTops[displayWordIndex]
}

/** Cluster word top offsets into distinct lines (for unit tests). */
export function clusterLineTops(tops: number[], tolerance = LINE_TOLERANCE_PX): number[] {
  const sorted = [...tops].sort((a, b) => a - b)
  const lines: number[] = []
  for (const top of sorted) {
    const existing = lines.find(l => Math.abs(l - top) <= tolerance)
    if (existing === undefined) lines.push(top)
  }
  return lines
}

export function lineIndexForWord(tops: number[], wordIndex: number, tolerance = LINE_TOLERANCE_PX): number {
  const lines = clusterLineTops(tops, tolerance)
  const top = tops[wordIndex]
  if (top === undefined) return 0
  const idx = lines.findIndex(l => Math.abs(l - top) <= tolerance)
  return idx >= 0 ? idx : 0
}