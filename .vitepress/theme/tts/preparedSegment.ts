import type { ReadingSegment } from '../utils/extractReadingSegments'
import type { SpeechPrepResult } from './speechPrep'

export type PreparedSegment = ReadingSegment & {
  speech?: SpeechPrepResult
  phonemeWeights?: number[]
}