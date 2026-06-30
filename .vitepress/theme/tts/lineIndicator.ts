import { domWordForSpeakableIndex } from './wordHighlight'

const LINE_TOLERANCE_PX = 6

/** Lines this short stay fully visible in focus mode. */
export const SHORT_LINE_MAX_WORDS = 4

function shouldDimInactiveLines(): boolean {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('focus-mode')
}

/** Group word indices into visual lines (for unit tests). */
export function groupIndicesByLine(tops: number[], tolerance = LINE_TOLERANCE_PX): number[][] {
  const order = tops.map((_, i) => i).sort((a, b) => tops[a] - tops[b] || a - b)
  const lines: number[][] = []
  for (const idx of order) {
    const top = tops[idx]
    let line = lines.find(l => Math.abs(tops[l[0]!] - top) <= tolerance)
    if (!line) {
      line = []
      lines.push(line)
    }
    line.push(idx)
  }
  lines.sort((a, b) => tops[a[0]!]! - tops[b[0]!]!)
  return lines
}

export function shouldMuteLineInFocus(
  lineIdx: number,
  lineWordCount: number,
  activeLineIdx: number,
): boolean {
  if (lineIdx === activeLineIdx) return false
  if (lineWordCount <= SHORT_LINE_MAX_WORDS) return false
  if (lineIdx === activeLineIdx + 1) return false
  return true
}

interface WordLineGroup {
  top: number
  words: HTMLElement[]
}

function groupWordsByLine(words: HTMLElement[], tolerance = LINE_TOLERANCE_PX): WordLineGroup[] {
  const sorted = [...words].sort((a, b) => {
    const ra = a.getBoundingClientRect()
    const rb = b.getBoundingClientRect()
    const dy = ra.top - rb.top
    if (Math.abs(dy) > tolerance) return dy
    return ra.left - rb.left
  })
  const lines: WordLineGroup[] = []
  for (const w of sorted) {
    const top = w.getBoundingClientRect().top
    let line = lines.find(l => Math.abs(l.top - top) <= tolerance)
    if (!line) {
      line = { top, words: [] }
      lines.push(line)
    } else {
      line.top = Math.min(line.top, top)
    }
    line.words.push(w)
  }
  lines.sort((a, b) => a.top - b.top)
  return lines
}

function wordsOnSameLine(anchor: HTMLElement, words: HTMLElement[], tolerance = LINE_TOLERANCE_PX): HTMLElement[] {
  const lineTopPx = anchor.getBoundingClientRect().top
  return words.filter(w => Math.abs(w.getBoundingClientRect().top - lineTopPx) <= tolerance)
}

export function clearLinePointer(blockEl: HTMLElement): void {
  blockEl.querySelector('.dsa-tts-line-pointer')?.remove()
  blockEl.classList.remove('dsa-tts-has-pointer')
  blockEl.querySelectorAll('.dsa-tts-word').forEach(el => {
    el.classList.remove('dsa-tts-word-on-active-line', 'dsa-tts-word-muted')
  })
}

export function setLinePointer(blockEl: HTMLElement, speakableWordIndex: number): void {
  const words = [...blockEl.querySelectorAll('.dsa-tts-word')] as HTMLElement[]
  const wordEl = domWordForSpeakableIndex(blockEl, speakableWordIndex)

  if (!wordEl) {
    clearLinePointer(blockEl)
    return
  }

  const blockRect = blockEl.getBoundingClientRect()
  const lineWords = wordsOnSameLine(wordEl, words)
  if (!lineWords.length) {
    clearLinePointer(blockEl)
    return
  }

  const lineGroups = groupWordsByLine(words)
  const activeLineIdx = lineGroups.findIndex(group => group.words.includes(wordEl))
  if (activeLineIdx < 0) {
    clearLinePointer(blockEl)
    return
  }

  const dimInactive = shouldDimInactiveLines()
  const lineIndexByWord = new Map<HTMLElement, number>()
  lineGroups.forEach((group, lineIdx) => {
    for (const w of group.words) lineIndexByWord.set(w, lineIdx)
  })

  for (const w of words) {
    const lineIdx = lineIndexByWord.get(w) ?? 0
    const lineWordCount = lineGroups[lineIdx]?.words.length ?? 0
    const onActiveLine = lineIdx === activeLineIdx
    const mute =
      dimInactive && shouldMuteLineInFocus(lineIdx, lineWordCount, activeLineIdx)
    w.classList.toggle('dsa-tts-word-on-active-line', dimInactive && onActiveLine)
    w.classList.toggle('dsa-tts-word-muted', mute)
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
  const indices = tops
    .map((t, i) => (Math.abs(t - top) <= tolerance ? i : -1))
    .filter(i => i >= 0)
  const lineTop = Math.min(...indices.map(i => tops[i]))
  const lineBottom = Math.max(...indices.map(i => tops[i] + (heights[i] ?? 0)))
  return { top: lineTop, height: Math.max(4, lineBottom - lineTop) }
}