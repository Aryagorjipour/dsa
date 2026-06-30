import type { ReadingSegment } from '../utils/extractReadingSegments'

export type TtsStatus = 'idle' | 'playing' | 'paused' | 'synthesizing'

export interface TtsEngineCallbacks {
  onStatus: (status: TtsStatus) => void
  onProgress: (elapsedMs: number, totalMs: number) => void
  onHighlight: (blockId: string, segmentIndex: number) => void
  /** wordIndex is display-word index within the active block */
  onWordHighlight?: (blockId: string, displayWordIndex: number) => void
  onClearHighlight: () => void
  onFinish: () => void
  onError: (message: string) => void
}

export interface TtsEngine {
  ensureReady: (onModelProgress?: (percent: number) => void) => Promise<boolean>
  isVoiceCached: () => Promise<boolean>
  play: (segments: ReadingSegment[], pageTitle: string) => Promise<void>
  pause: () => void
  resume: () => Promise<void>
  stop: () => void
  skip: (deltaMs: number) => void
  skipSegment: (deltaSegments: number) => void
  seekTo: (elapsedMs: number) => void
  setRate: (rate: number) => void
  setVoice: (voiceId: string) => void
  /** Re-synthesize from current position (e.g. after cloud voice/model change). */
  reloadVoice: () => void
  destroy: () => void
}