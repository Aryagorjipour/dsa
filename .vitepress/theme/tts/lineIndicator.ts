const LINE_TOLERANCE_PX = 6

export function clearLinePointer(blockEl: HTMLElement): void {
  blockEl.querySelector('.dsa-tts-line-pointer')?.remove()
  blockEl.classList.remove('dsa-tts-has-pointer')
}

export function setLinePointer(blockEl: HTMLElement, displayWordIndex: number): void {
  const words = [...blockEl.querySelectorAll('.dsa-tts-word')] as HTMLElement[]
  const wordEl = words.find(w => w.dataset.ttsWord === String(displayWordIndex)) ?? null

  if (!wordEl) {
    clearLinePointer(blockEl)
    return
  }

  const blockRect = blockEl.getBoundingClientRect()
  const lineTopPx = wordEl.getBoundingClientRect().top

  const lineWords = words.filter(
    w => Math.abs(w.getBoundingClientRect().top - lineTopPx) <= LINE_TOLERANCE_PX,
  )
  if (!lineWords.length) {
    clearLinePointer(blockEl)
    return
  }

  const tops = lineWords.map(w => w.getBoundingClientRect().top - blockRect.top)
  const bottoms = lineWords.map(w => w.getBoundingClientRect().bottom - blockRect.top)
  const lineTop = Math.min(...tops)
  const lineBottom = Math.max(...bottoms)
  const lineHeight = Math.max(4, lineBottom - lineTop)

  let pointer = blockEl.querySelector('.dsa-tts-line-pointer') as HTMLElement | null
  if (!pointer) {
    pointer = document.createElement('span')
    pointer.className = 'dsa-tts-line-pointer'
    pointer.setAttribute('aria-hidden', 'true')
    blockEl.appendChild(pointer)
  }

  blockEl.classList.add('dsa-tts-has-pointer')
  pointer.style.top = `${lineTop}px`
  pointer.style.height = `${lineHeight}px`
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

export function lineBoundsForWord(
  tops: number[],
  heights: number[],
  wordIndex: number,
  tolerance = LINE_TOLERANCE_PX,
): { top: number; height: number } | null {
  const top = tops[wordIndex]
  if (top === undefined) return null
  const lineTops = tops.filter((t, i) => Math.abs(t - top) <= tolerance)
  const indices = tops
    .map((t, i) => (Math.abs(t - top) <= tolerance ? i : -1))
    .filter(i => i >= 0)
  const lineTop = Math.min(...indices.map(i => tops[i]))
  const lineBottom = Math.max(...indices.map(i => tops[i] + (heights[i] ?? 0)))
  return { top: lineTop, height: Math.max(4, lineBottom - lineTop) }
}