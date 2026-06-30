import type { ReadingSegment } from '../utils/extractReadingSegments'

export type TtsStatus = 'idle' | 'playing' | 'paused'

export interface TtsEngineCallbacks {
  onStatus: (status: TtsStatus) => void
  onProgress: (elapsedMs: number, totalMs: number) => void
  onHighlight: (blockId: string) => void
  onClearHighlight: () => void
  onFinish: () => void
  onError: (message: string) => void
}

export interface TtsEngine {
  ensureReady: (onModelProgress?: (percent: number) => void) => Promise<boolean>
  play: (segments: ReadingSegment[], pageTitle: string) => Promise<void>
  pause: () => void
  resume: () => Promise<void>
  stop: () => void
  skip: (deltaMs: number) => void
  setRate: (rate: number) => void
  setVoice: (voiceId: string) => void
  destroy: () => void
}