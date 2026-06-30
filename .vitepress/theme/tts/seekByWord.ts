import { estimateSegmentMs } from '../utils/extractReadingSegments'
import type { ReadingSegment } from '../utils/extractReadingSegments'
import { prepareSpeechText, spokenWordFromDisplay } from './speechPrep'
import { charWeightsForText, offsetMsForSpokenWord } from './wordTiming'
import type { PreparedSegment } from './preparedSegment'

export function prepareAllSegments(segments: ReadingSegment[]): PreparedSegment[] {
  return segments.map(seg => {
    const speech = prepareSpeechText(seg.text)
    return { ...seg, speech, phonemeWeights: charWeightsForText(speech.spokenText) }
  })
}

export function elapsedMsForDisplayWord(
  prepared: PreparedSegment[],
  blockId: string,
  displayWordIndex: number,
  rate: number,
): number {
  let acc = 0

  for (const seg of prepared) {
    const speech = seg.speech ?? prepareSpeechText(seg.text)
    const weights = seg.phonemeWeights ?? charWeightsForText(speech.spokenText)
    const duration = estimateSegmentMs(speech.spokenText, rate)

    if (seg.blockId !== blockId) {
      acc += duration
      continue
    }

    const inSegment = speech.alignment.some(a => a.displayWordIndex === displayWordIndex)
    if (inSegment) {
      const spokenStart = spokenWordFromDisplay(speech.alignment, displayWordIndex)
      return acc + offsetMsForSpokenWord(spokenStart, duration, weights)
    }

    acc += duration
  }

  return acc
}