import { normalizeReadingText } from '../utils/extractReadingSegments'
import { tokenizeWords } from './wordHighlight'
import { mergeGlossaryRules, type GlossaryRule } from './glossary/glossaryStore'

export interface WordAlignment {
  displayWordIndex: number
  spokenWordStart: number
  spokenWordEnd: number
}

export interface SpeechPrepResult {
  displayText: string
  spokenText: string
  alignment: WordAlignment[]
  spokenWordCount: number
  displayWordCount: number
}

interface MatchSpan {
  start: number
  end: number
  spoken: string
  priority: number
}

type TextPart =
  | { kind: 'literal'; display: string }
  | { kind: 'replace'; display: string; spoken: string }

function findMatches(text: string, rules: GlossaryRule[]): MatchSpan[] {
  const spans: MatchSpan[] = []

  for (const rule of rules) {
    if (rule.isRegex) {
      const re = new RegExp(rule.match, 'gi')
      let m: RegExpExecArray | null
      while ((m = re.exec(text)) !== null) {
        spans.push({
          start: m.index,
          end: m.index + m[0].length,
          spoken: rule.spoken,
          priority: rule.priority ?? 50,
        })
      }
    } else {
      let from = 0
      const lower = text.toLowerCase()
      const needle = rule.match.toLowerCase()
      while (from < text.length) {
        const idx = lower.indexOf(needle, from)
        if (idx < 0) break
        const before = idx > 0 ? text[idx - 1] : ' '
        const after = idx + rule.match.length < text.length ? text[idx + rule.match.length] : ' '
        const wordBoundary =
          !/\w/.test(before) && !/\w/.test(after) ||
          rule.match.includes('#') ||
          rule.match.includes('.')
        if (wordBoundary) {
          spans.push({
            start: idx,
            end: idx + rule.match.length,
            spoken: rule.spoken,
            priority: rule.priority ?? 50,
          })
        }
        from = idx + 1
      }
    }
  }

  spans.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start
    const lenA = a.end - a.start
    const lenB = b.end - b.start
    if (lenB !== lenA) return lenB - lenA
    return a.priority - b.priority
  })

  const picked: MatchSpan[] = []
  let cursor = 0
  for (const span of spans) {
    if (span.start < cursor) continue
    picked.push(span)
    cursor = span.end
  }
  return picked
}

function buildParts(display: string, rules: GlossaryRule[]): TextPart[] {
  const matches = findMatches(display, rules)
  if (!matches.length) return [{ kind: 'literal', display }]

  const parts: TextPart[] = []
  let pos = 0
  for (const m of matches) {
    if (m.start > pos) {
      parts.push({ kind: 'literal', display: display.slice(pos, m.start) })
    }
    parts.push({
      kind: 'replace',
      display: display.slice(m.start, m.end),
      spoken: m.spoken,
    })
    pos = m.end
  }
  if (pos < display.length) {
    parts.push({ kind: 'literal', display: display.slice(pos) })
  }
  return parts
}

function alignPartTokens(displayChunk: string, spokenChunk: string, displayOffset: number, spokenOffset: number): WordAlignment[] {
  const displayWords = tokenizeWords(displayChunk)
  const spokenWords = tokenizeWords(spokenChunk)
  const alignments: WordAlignment[] = []

  if (!displayWords.length) return alignments

  if (!spokenWords.length) {
    for (let i = 0; i < displayWords.length; i++) {
      alignments.push({
        displayWordIndex: displayOffset + i,
        spokenWordStart: spokenOffset,
        spokenWordEnd: spokenOffset,
      })
    }
    return alignments
  }

  for (let d = 0; d < displayWords.length; d++) {
    const spokenStart = spokenOffset + Math.floor((d / displayWords.length) * spokenWords.length)
    const spokenEnd =
      spokenOffset + Math.floor(((d + 1) / displayWords.length) * spokenWords.length)
    alignments.push({
      displayWordIndex: displayOffset + d,
      spokenWordStart: spokenStart,
      spokenWordEnd: Math.max(spokenStart + 1, spokenEnd),
    })
  }

  const last = alignments[alignments.length - 1]
  if (last) last.spokenWordEnd = spokenOffset + spokenWords.length

  return alignments
}

export function prepareSpeechText(
  rawDisplay: string,
  rules: GlossaryRule[] = mergeGlossaryRules(),
): SpeechPrepResult {
  const displayText = normalizeReadingText(rawDisplay)
  const parts = buildParts(displayText, rules)

  let spokenText = ''
  const alignment: WordAlignment[] = []
  let displayWordOffset = 0
  let spokenWordOffset = 0

  for (const part of parts) {
    if (part.kind === 'literal') {
      spokenText += part.display
      const dWords = tokenizeWords(part.display)
      for (let i = 0; i < dWords.length; i++) {
        alignment.push({
          displayWordIndex: displayWordOffset + i,
          spokenWordStart: spokenWordOffset + i,
          spokenWordEnd: spokenWordOffset + i + 1,
        })
      }
      displayWordOffset += dWords.length
      spokenWordOffset += dWords.length
    } else {
      const gap = spokenText.length > 0 && part.spoken[0] !== ' ' && !spokenText.endsWith(' ') ? ' ' : ''
      if (gap) spokenText += gap
      spokenText += part.spoken
      alignment.push(
        ...alignPartTokens(part.display, part.spoken, displayWordOffset, spokenWordOffset),
      )
      displayWordOffset += tokenizeWords(part.display).length
      spokenWordOffset += tokenizeWords(part.spoken).length
    }
  }

  spokenText = normalizeReadingText(spokenText)

  return {
    displayText,
    spokenText,
    alignment,
    spokenWordCount: tokenizeWords(spokenText).length,
    displayWordCount: tokenizeWords(displayText).length,
  }
}

export function displayWordFromSpoken(
  alignment: WordAlignment[],
  spokenWordIndex: number,
): number {
  for (const row of alignment) {
    if (spokenWordIndex >= row.spokenWordStart && spokenWordIndex < row.spokenWordEnd) {
      return row.displayWordIndex
    }
  }
  if (alignment.length) return alignment[alignment.length - 1].displayWordIndex
  return 0
}

export function spokenWordFromDisplay(
  alignment: WordAlignment[],
  displayWordIndex: number,
): number {
  const row = alignment.find(a => a.displayWordIndex === displayWordIndex)
  return row?.spokenWordStart ?? displayWordIndex
}