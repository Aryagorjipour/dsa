import { sliceTextAtOffset } from '../utils/extractReadingSegments'
import type { ReadingSegment } from '../utils/extractReadingSegments'
import type { PreparedSegment } from './preparedSegment'
import { getProviderAdapter, isLikelyCorsError } from './providers'
import {
  buildEstimatedDurations,
  mergeDurations,
  resolveSegmentAtDurations,
  totalDurationMs,
} from './segmentTiming'
import { prepareSpeechText, displayWordFromSpoken } from './speechPrep'
import { charWeightsForText, spokenWordAtOffset } from './wordTiming'
import { getCloudApiKey, loadCloudTtsConfig } from './ttsSecretStore'
import type { TtsEngine, TtsEngineCallbacks } from './types'

function prepareSegments(raw: ReadingSegment[]): PreparedSegment[] {
  return raw.map(seg => {
    const speech = prepareSpeechText(seg.text)
    return {
      ...seg,
      speech,
      phonemeWeights: charWeightsForText(speech.spokenText),
    }
  })
}

function spokenTextFor(seg: PreparedSegment): string {
  return seg.speech?.spokenText ?? seg.text
}

async function blobDurationMs(blob: Blob): Promise<number> {
  const url = URL.createObjectURL(blob)
  try {
    return await new Promise<number>((resolve, reject) => {
      const probe = new Audio()
      probe.addEventListener('loadedmetadata', () => {
        resolve(Math.round((probe.duration || 0) * 1000))
      })
      probe.addEventListener('error', () => reject(new Error('Audio decode failed')))
      probe.src = url
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function createApiTtsEngine(
  callbacks: TtsEngineCallbacks,
  initialRate: number,
): TtsEngine {
  let rate = initialRate
  let audio: HTMLAudioElement | null = null
  let objectUrl: string | null = null
  let segments: PreparedSegment[] = []
  let currentIndex = 0
  let contentOffsetMs = 0
  let estimatedDurations: number[] = []
  let actualDurations: Array<number | undefined> = []
  let playingSession = 0

  function effectiveDurations(): number[] {
    return mergeDurations(estimatedDurations, actualDurations).map(d => d / rate)
  }

  function detachAudioListeners(): void {
    if (!audio) return
    audio.ontimeupdate = null
    audio.onended = null
    audio.onerror = null
  }

  function currentElapsedMs(): number {
    const durations = effectiveDurations()
    let elapsed = 0
    for (let i = 0; i < currentIndex; i++) elapsed += durations[i] ?? 0
    if (audio) {
      elapsed += (audio.currentTime * 1000) / rate
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

    if (callbacks.onWordHighlight) {
      const seg = segments[currentIndex]
      if (seg?.speech) {
        const segDuration = durations[currentIndex] ?? 0
        const offsetInSeg = audio
          ? (audio.currentTime * 1000) / rate
          : contentOffsetMs
        const weights = seg.phonemeWeights ?? charWeightsForText(seg.speech.spokenText)
        const spokenIdx = spokenWordAtOffset(offsetInSeg, segDuration, weights)
        const displayIdx = displayWordFromSpoken(seg.speech.alignment, spokenIdx)
        callbacks.onWordHighlight(seg.blockId, displayIdx)
      }
    }
  }

  function bindAudioProgress(sessionId: number): void {
    if (!audio) return
    audio.ontimeupdate = () => {
      if (sessionId !== playingSession) return
      reportProgress()
    }
  }

  function revokeObjectUrl(): void {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
      objectUrl = null
    }
  }

  function cleanupAudio(): void {
    if (audio) {
      detachAudioListeners()
      audio.pause()
      audio.src = ''
      audio = null
    }
    revokeObjectUrl()
  }

  async function synthesize(seg: PreparedSegment): Promise<{ blob: Blob; durationMs: number }> {
    const config = await loadCloudTtsConfig()
    const apiKey = await getCloudApiKey()
    if (!apiKey || !config.configured) {
      throw new Error('Cloud TTS not configured — open Configure in Listen panel')
    }

    const adapter = getProviderAdapter(config.provider)
    const spoken = spokenTextFor(seg)
    let blob: Blob
    try {
      blob = await adapter.synthesize({
        baseUrl: config.baseUrl,
        apiKey,
        model: config.model,
        voiceId: config.voiceId,
        text: spoken,
        rate,
      })
    } catch (err) {
      if (isLikelyCorsError(err)) {
        throw new Error('Browser blocked API call — use Custom with a CORS-enabled proxy URL')
      }
      throw err
    }

    const durationMs = await blobDurationMs(blob)
    return { blob, durationMs }
  }

  async function playSegment(sessionId: number): Promise<void> {
    if (sessionId !== playingSession) return

    const seg = segments[currentIndex]
    if (!seg) {
      callbacks.onFinish()
      return
    }

    callbacks.onHighlight(seg.blockId, currentIndex)

    let spoken = spokenTextFor(seg)
    if (contentOffsetMs > 0) {
      spoken = sliceTextAtOffset(spoken, contentOffsetMs * rate, rate)
      if (!spoken) {
        currentIndex += 1
        contentOffsetMs = 0
        await playSegment(sessionId)
        return
      }
    }

    try {
      const playSeg: PreparedSegment =
        spoken !== spokenTextFor(seg)
          ? {
              ...seg,
              speech: prepareSpeechText(spoken),
              phonemeWeights: charWeightsForText(prepareSpeechText(spoken).spokenText),
            }
          : seg

      const { blob, durationMs } = await synthesize(playSeg)
      if (sessionId !== playingSession) return

      actualDurations[currentIndex] = durationMs
      cleanupAudio()

      objectUrl = URL.createObjectURL(blob)
      audio = new Audio(objectUrl)
      audio.playbackRate = rate
      if (contentOffsetMs > 0) {
        audio.currentTime = (contentOffsetMs * rate) / 1000
      }

      audio.onended = () => {
        if (sessionId !== playingSession) return
        currentIndex += 1
        contentOffsetMs = 0
        if (currentIndex >= segments.length) {
          callbacks.onFinish()
          return
        }
        void playSegment(sessionId)
      }

      audio.onerror = () => {
        if (sessionId !== playingSession) return
        callbacks.onError('Cloud playback failed')
      }

      bindAudioProgress(sessionId)
      await audio.play()
      if (sessionId !== playingSession) return

      callbacks.onStatus('playing')
      reportProgress()
    } catch (err) {
      if (sessionId !== playingSession) return
      const message = err instanceof Error ? err.message : 'Cloud synthesis failed'
      console.error('[cloud-tts]', err)
      callbacks.onError(message)
    }
  }

  return {
    async isVoiceCached() {
      return false
    },

    async ensureReady() {
      const config = await loadCloudTtsConfig()
      const apiKey = await getCloudApiKey()
      return config.configured && !!apiKey && !!config.model && !!config.voiceId
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
      cleanupAudio()
      callbacks.onStatus('playing')
      await playSegment(sessionId)
    },

    pause() {
      if (!audio || audio.paused) return
      contentOffsetMs = (audio.currentTime * 1000) / rate
      audio.pause()
      reportProgress()
      callbacks.onStatus('paused')
    },

    async resume() {
      if (!segments.length) return
      if (audio && audio.paused && audio.src) {
        await audio.play()
        callbacks.onStatus('playing')
        return
      }
      playingSession += 1
      const sessionId = playingSession
      cleanupAudio()
      callbacks.onStatus('playing')
      await playSegment(sessionId)
    },

    stop() {
      playingSession += 1
      cleanupAudio()
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
      currentIndex = resolved.index
      contentOffsetMs = resolved.offsetMs

      if (!audio || audio.paused) {
        reportProgress()
        return
      }

      playingSession += 1
      const sessionId = playingSession
      cleanupAudio()
      void playSegment(sessionId)
    },

    setRate(next) {
      const prevRate = rate
      rate = Math.max(0.5, Math.min(2, next))
      if (audio) {
        const contentPos = (audio.currentTime * 1000) / prevRate
        audio.playbackRate = rate
        audio.currentTime = (contentPos * rate) / 1000
        contentOffsetMs = contentPos
      }
      if (audio && !audio.paused) reportProgress()
    },

    setVoice() {
      /* cloud voice from config store */
    },

    destroy() {
      this.stop()
    },
  }
}