import {
  estimateSegmentMs,
  sliceTextAtOffset,
  type ReadingSegment,
} from '../utils/extractReadingSegments'
import {
  pickBestVoice,
  readSpeechVoices,
  waitForVoices,
  HANDBOOK_TTS_LANG,
} from '../utils/ttsVoices'
import {
  buildEstimatedDurations,
  mergeDurations,
  resolveSegmentAtDurations,
  totalDurationMs,
} from './segmentTiming'
import { prepareSpeechText, displayWordFromSpoken } from './speechPrep'
import { charWeightsForText, spokenWordAtOffset } from './wordTiming'
import type { TtsEngine, TtsEngineCallbacks } from './types'

function prepareSegments(raw: ReadingSegment[]): ReadingSegment[] {
  return raw.map(seg => {
    const speech = prepareSpeechText(seg.text)
    return { ...seg, speech, phonemeWeights: charWeightsForText(speech.spokenText) }
  })
}

function spokenTextFor(seg: ReadingSegment): string {
  return seg.speech?.spokenText ?? seg.text
}

export function createWebSpeechEngine(
  callbacks: TtsEngineCallbacks,
  initialRate: number,
): TtsEngine {
  let rate = initialRate
  let segments: ReadingSegment[] = []
  let currentIndex = 0
  let contentOffsetMs = 0
  let estimatedDurations: number[] = []
  let actualDurations: Array<number | undefined> = []
  let playingSession = 0
  let utterance: SpeechSynthesisUtterance | null = null
  let segmentStartedAt = 0
  let tickTimer = 0

  function synth(): SpeechSynthesis | null {
    return typeof window !== 'undefined' && 'speechSynthesis' in window
      ? window.speechSynthesis
      : null
  }

  function effectiveDurations(): number[] {
    return mergeDurations(estimatedDurations, actualDurations).map(d => d / rate)
  }

  function stopTick(): void {
    if (tickTimer) {
      window.clearInterval(tickTimer)
      tickTimer = 0
    }
  }

  function currentElapsedMs(): number {
    const durations = effectiveDurations()
    let elapsed = 0
    for (let i = 0; i < currentIndex; i++) elapsed += durations[i] ?? 0
    if (utterance && synth()?.speaking) {
      elapsed += performance.now() - segmentStartedAt
    } else {
      elapsed += contentOffsetMs
    }
    return elapsed
  }

  function reportProgress(): void {
    const durations = effectiveDurations()
    const total = totalDurationMs(durations)
    const elapsed = Math.min(currentElapsedMs(), total)
    callbacks.onProgress(elapsed, total)

    const seg = segments[currentIndex]
    if (callbacks.onWordHighlight && seg?.speech) {
      const segDuration = durations[currentIndex] ?? 0
      const offsetInSeg =
        utterance && synth()?.speaking
          ? performance.now() - segmentStartedAt
          : contentOffsetMs
      const weights = seg.phonemeWeights ?? charWeightsForText(seg.speech.spokenText)
      const spokenIdx = spokenWordAtOffset(offsetInSeg, segDuration, weights)
      const displayIdx = displayWordFromSpoken(seg.speech.alignment, spokenIdx)
      callbacks.onWordHighlight(seg.blockId, displayIdx)
    }
  }

  function startTick(): void {
    stopTick()
    tickTimer = window.setInterval(reportProgress, 100)
  }

  function cancelSpeech(): void {
    const s = synth()
    if (s) {
      s.cancel()
    }
    utterance = null
    stopTick()
  }

  async function speakSegment(sessionId: number): Promise<void> {
    if (sessionId !== playingSession) return

    const seg = segments[currentIndex]
    if (!seg) {
      callbacks.onFinish()
      return
    }

    callbacks.onHighlight(seg.blockId, currentIndex)

    let text = spokenTextFor(seg)
    if (contentOffsetMs > 0) {
      text = sliceTextAtOffset(text, contentOffsetMs * rate, rate)
      if (!text) {
        currentIndex += 1
        contentOffsetMs = 0
        await speakSegment(sessionId)
        return
      }
    }

    const voices = await waitForVoices(synth()!, { timeoutMs: 3000 })
    const voice = pickBestVoice(readSpeechVoices(synth()!), HANDBOOK_TTS_LANG)
    if (!voice) {
      callbacks.onError('No online voice available — switch to Piper')
      return
    }

    const u = new SpeechSynthesisUtterance(text)
    u.voice = voice
    u.rate = rate
    u.lang = HANDBOOK_TTS_LANG

    u.onboundary = ev => {
      if (sessionId !== playingSession) return
      if (ev.name !== 'word' || !seg.speech) return
      const spokenText = spokenTextFor(seg)
      const before = spokenText.slice(0, ev.charIndex)
      const spokenIdx = before.trim() ? before.trim().split(/\s+/).length : 0
      const displayIdx = displayWordFromSpoken(seg.speech.alignment, spokenIdx)
      callbacks.onWordHighlight?.(seg.blockId, displayIdx)
    }

    u.onstart = () => {
      segmentStartedAt = performance.now()
      actualDurations[currentIndex] = estimateSegmentMs(text, rate)
      callbacks.onStatus('playing')
      startTick()
      reportProgress()
    }

    u.onend = () => {
      if (sessionId !== playingSession) return
      stopTick()
      currentIndex += 1
      contentOffsetMs = 0
      utterance = null
      if (currentIndex >= segments.length) {
        callbacks.onFinish()
        return
      }
      void speakSegment(sessionId)
    }

    u.onerror = () => {
      if (sessionId !== playingSession) return
      if (currentIndex < segments.length - 1) {
        currentIndex += 1
        contentOffsetMs = 0
        void speakSegment(sessionId)
        return
      }
      callbacks.onError('Online speech failed')
    }

    utterance = u
    synth()!.speak(u)
  }

  return {
    async isVoiceCached() {
      return true
    },

    async ensureReady() {
      if (!navigator.onLine) return false
      const voices = await waitForVoices(synth()!, { timeoutMs: 3000 })
      return !!pickBestVoice(readSpeechVoices(synth()!), HANDBOOK_TTS_LANG) && voices.length > 0
    },

    async play(nextSegments) {
      segments = prepareSegments(nextSegments)
      currentIndex = 0
      contentOffsetMs = 0
      estimatedDurations = buildEstimatedDurations(
        segments.map(s => ({ ...s, text: spokenTextFor(s) })),
        rate,
      )
      actualDurations = new Array(segments.length)
      playingSession += 1
      const sessionId = playingSession
      cancelSpeech()
      callbacks.onStatus('playing')
      await speakSegment(sessionId)
    },

    pause() {
      const s = synth()
      if (!s?.speaking) return
      contentOffsetMs = performance.now() - segmentStartedAt
      s.pause()
      stopTick()
      reportProgress()
      callbacks.onStatus('paused')
    },

    async resume() {
      const s = synth()
      if (!segments.length) return
      if (s?.paused) {
        s.resume()
        segmentStartedAt = performance.now() - contentOffsetMs
        callbacks.onStatus('playing')
        startTick()
        return
      }
      playingSession += 1
      const sessionId = playingSession
      cancelSpeech()
      callbacks.onStatus('playing')
      await speakSegment(sessionId)
    },

    stop() {
      playingSession += 1
      cancelSpeech()
      segments = []
      currentIndex = 0
      contentOffsetMs = 0
      estimatedDurations = []
      actualDurations = []
      callbacks.onClearHighlight()
      callbacks.onStatus('idle')
      callbacks.onProgress(0, 0)
    },

    skip(deltaMs) {
      if (!segments.length) return
      const durations = effectiveDurations()
      const total = totalDurationMs(durations)
      const target = Math.max(0, Math.min(total - 1, currentElapsedMs() + deltaMs))
      this.seekTo(target)
    },

    seekTo(targetMs) {
      if (!segments.length) return
      const durations = effectiveDurations()
      const total = totalDurationMs(durations)
      const target = Math.max(0, Math.min(total - 1, targetMs))
      const resolved = resolveSegmentAtDurations(durations, target)
      const wasPlaying = !!synth()?.speaking
      currentIndex = resolved.index
      contentOffsetMs = resolved.offsetMs
      cancelSpeech()
      if (wasPlaying) {
        playingSession += 1
        void speakSegment(playingSession)
      } else {
        reportProgress()
      }
    },

    setRate(next) {
      rate = Math.max(0.5, Math.min(2, next))
    },

    setVoice() {
      /* online voice auto-picked */
    },

    destroy() {
      this.stop()
    },
  }
}