import { tokenizeWords } from './wordHighlight'

/** Map playback offset within a segment to a spoken-word index using phoneme weights. */
export function spokenWordAtOffset(
  offsetMs: number,
  durationMs: number,
  phonemeWeights: number[],
): number {
  if (!phonemeWeights.length || durationMs <= 0) return 0
  const ratio = Math.max(0, Math.min(1, offsetMs / durationMs))
  const total = phonemeWeights.reduce((s, w) => s + w, 0)
  if (total <= 0) return 0

  const target = ratio * total
  let acc = 0
  for (let i = 0; i < phonemeWeights.length; i++) {
    acc += phonemeWeights[i]
    if (target <= acc) return i
  }
  return phonemeWeights.length - 1
}

function syllableWeight(word: string): number {
  const s = word.toLowerCase().replace(/[^a-z]/g, '')
  if (!s) return 1
  const groups = s.match(/[aeiouy]+/g)
  return Math.max(1, groups?.length ?? 1)
}

/** Syllable-based weights — closer to speech duration than uniform word count. */
export function charWeightsForText(text: string): number[] {
  return tokenizeWords(text).map(w => syllableWeight(w.text))
}

export function offsetMsForSpokenWord(
  wordIndex: number,
  durationMs: number,
  phonemeWeights: number[],
): number {
  if (!phonemeWeights.length || durationMs <= 0) return 0
  const total = phonemeWeights.reduce((s, w) => s + w, 0)
  if (total <= 0) return 0

  let acc = 0
  for (let i = 0; i < wordIndex && i < phonemeWeights.length; i++) {
    acc += phonemeWeights[i]
  }
  return (acc / total) * durationMs
}