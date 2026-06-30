import { normalizeReadingText } from '../utils/extractReadingSegments'

export interface WordToken {
  text: string
  start: number
  end: number
}

export function tokenizeWords(text: string): WordToken[] {
  const normalized = normalizeReadingText(text)
  const words: WordToken[] = []
  const re = /\S+/g
  let match: RegExpExecArray | null
  while ((match = re.exec(normalized)) !== null) {
    words.push({
      text: match[0],
      start: match.index,
      end: match.index + match[0].length,
    })
  }
  return words
}

export function wordIndexAtRatio(wordCount: number, ratio: number): number {
  if (wordCount <= 0) return 0
  const clamped = Math.max(0, Math.min(1, ratio))
  return Math.min(wordCount - 1, Math.floor(clamped * wordCount))
}

export function findSegmentWordOffset(
  blockText: string,
  segmentText: string,
  priorSegmentTexts: string[],
): number {
  const norm = normalizeReadingText(blockText)
  let searchFrom = 0

  for (const prior of priorSegmentTexts) {
    const piece = normalizeReadingText(prior)
    const idx = norm.indexOf(piece, searchFrom)
    if (idx >= 0) searchFrom = idx + piece.length
  }

  const seg = normalizeReadingText(segmentText)
  const idx = norm.indexOf(seg, searchFrom)
  const charOffset = idx >= 0 ? idx : searchFrom
  return tokenizeWords(norm.slice(0, charOffset)).length
}

export function wrapBlockWords(blockEl: HTMLElement): void {
  if (blockEl.dataset.ttsWordsWrapped === '1') return

  const walker = document.createTreeWalker(blockEl, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement
      if (!parent || parent.closest('pre, code, button, .dsa-heading-note-btn')) {
        return NodeFilter.FILTER_REJECT
      }
      if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    },
  })

  const textNodes: Text[] = []
  let current: Node | null
  while ((current = walker.nextNode())) {
    textNodes.push(current as Text)
  }

  let wordIndex = 0
  for (const textNode of textNodes) {
    const text = textNode.textContent || ''
    const parts = text.split(/(\s+)/)
    const frag = document.createDocumentFragment()

    for (const part of parts) {
      if (!part) continue
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part))
        continue
      }
      const span = document.createElement('span')
      span.className = 'dsa-tts-word'
      span.dataset.ttsWord = String(wordIndex++)
      span.textContent = part
      frag.appendChild(span)
    }

    textNode.parentNode?.replaceChild(frag, textNode)
  }

  blockEl.dataset.ttsWordsWrapped = '1'
}

export function unwrapBlockWords(blockEl: HTMLElement): void {
  blockEl.querySelectorAll('.dsa-tts-word').forEach(span => {
    const parent = span.parentNode
    if (!parent) return
    parent.replaceChild(document.createTextNode(span.textContent || ''), span)
    parent.normalize()
  })
  delete blockEl.dataset.ttsWordsWrapped
}

export function clearWordHighlight(blockEl: HTMLElement): void {
  blockEl.querySelectorAll('.dsa-tts-word').forEach(el => {
    el.classList.remove('dsa-tts-word-current', 'dsa-tts-word-next')
  })
}

export function setWordHighlight(blockEl: HTMLElement, currentIndex: number): void {
  const words = blockEl.querySelectorAll('.dsa-tts-word')
  words.forEach((el, i) => {
    el.classList.remove('dsa-tts-word-current', 'dsa-tts-word-next')
    if (i === currentIndex) el.classList.add('dsa-tts-word-current')
    else if (i === currentIndex + 1) el.classList.add('dsa-tts-word-next')
  })
}

export function unwrapAllWordHighlights(): void {
  document.querySelectorAll('[data-tts-words-wrapped="1"]').forEach(el => {
    if (el instanceof HTMLElement) unwrapBlockWords(el)
  })
}