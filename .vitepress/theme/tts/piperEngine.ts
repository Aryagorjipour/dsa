import { get, set } from 'idb-keyval'
import { sliceTextAtOffset } from '../utils/extractReadingSegments'
import type { ReadingSegment } from '../utils/extractReadingSegments'
import { ensureOrtWasmConfigured, getPiperWasmPaths } from './piperWasmPaths'
import {
  buildEstimatedDurations,
  mergeDurations,
  resolveSegmentAtDurations,
  totalDurationMs,
} from './segmentTiming'
import { tokenizeWords, wordIndexAtRatio } from './wordHighlight'
import type { TtsEngine, TtsEngineCallbacks } from './types'

type PiperModule = typeof import('@mintplex-labs/piper-tts-web')
type TtsSession = import('@mintplex-labs/piper-tts-web').TtsSession

let piperModule: PiperModule | null = null

async function loadPiper(): Promise<PiperModule> {
  if (!piperModule) {
    piperModule = await import('@mintplex-labs/piper-tts-web')
  }
  return piperModule
}

function resetPiperSessionSingleton(): void {
  const piper = piperModule as PiperModule & {
    TtsSession?: { _instance?: TtsSession | null }
  }
  if (piper?.TtsSession) {
    piper.TtsSession._instance = null
  }
}

function hashText(text: string): string {
  let h = 0
  for (let i = 0; i < text.length; i++) {
    h = (Math.imul(31, h) + text.charCodeAt(i)) | 0
  }
  return (h >>> 0).toString(36)
}

function cacheKey(voiceId: string, text: string): string {
  return `piper-audio:${voiceId}:${hashText(text)}`
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

export function createPiperEngine(
  callbacks: TtsEngineCallbacks,
  initialVoiceId: string,
  initialRate: number,
): TtsEngine {
  let voiceId = initialVoiceId
  let rate = initialRate
  let session: TtsSession | null = null
  let audio: HTMLAudioElement | null = null
  let objectUrl: string | null = null
  let segments: ReadingSegment[] = []
  let currentIndex = 0
  let contentOffsetMs = 0
  let estimatedDurations: number[] = []
  let actualDurations: Array<number | undefined> = []
  let playingSession = 0
  let tickTimer = 0
  let prefetchIndex = -1
  let prefetchPromise: Promise<{ blob: Blob; durationMs: number }> | null = null

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
    for (let i = 0; i < currentIndex; i++) {
      elapsed += durations[i] ?? 0
    }
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
      if (seg) {
        const segDuration = durations[currentIndex] ?? 0
        let offsetInSeg = 0
        if (audio) {
          offsetInSeg = (audio.currentTime * 1000) / rate
        } else {
          offsetInSeg = contentOffsetMs
        }
        const ratio = segDuration > 0 ? offsetInSeg / segDuration : 0
        const words = tokenizeWords(seg.text)
        const wordIdx = wordIndexAtRatio(words.length, ratio)
        callbacks.onWordHighlight(seg.blockId, wordIdx)
      }
    }
  }

  function startTick(): void {
    stopTick()
    tickTimer = window.setInterval(reportProgress, 250)
  }

  function revokeObjectUrl(): void {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
      objectUrl = null
    }
  }

  function cleanupAudio(): void {
    if (audio) {
      audio.pause()
      audio.onended = null
      audio.onerror = null
      audio.src = ''
      audio = null
    }
    revokeObjectUrl()
    prefetchPromise = null
    prefetchIndex = -1
  }

  async function ensureSession(): Promise<TtsSession> {
    await ensureOrtWasmConfigured()
    const piper = await loadPiper()
    const wasmPaths = getPiperWasmPaths()
    if (!session || session.voiceId !== voiceId) {
      session = await piper.TtsSession.create({ voiceId, wasmPaths })
    }
    return session
  }

  async function synthesize(text: string): Promise<{ blob: Blob; durationMs: number }> {
    const key = cacheKey(voiceId, text)
    const cached = await get<Blob>(key)
    if (cached) {
      const durationMs = (await get<number>(`${key}:dur`)) ?? (await blobDurationMs(cached))
      return { blob: cached, durationMs }
    }

    const active = await ensureSession()
    const blob = await active.predict(text)
    const durationMs = await blobDurationMs(blob)
    await set(key, blob)
    await set(`${key}:dur`, durationMs)
    return { blob, durationMs }
  }

  function prefetchNext(sessionId: number): void {
    const nextIndex = currentIndex + 1
    if (nextIndex >= segments.length || prefetchIndex === nextIndex) return
    const seg = segments[nextIndex]
    if (!seg) return
    prefetchIndex = nextIndex
    prefetchPromise = synthesize(seg.text)
  }

  async function getSegmentAudio(index: number): Promise<{ blob: Blob; durationMs: number }> {
    if (prefetchIndex === index && prefetchPromise) {
      const result = await prefetchPromise
      prefetchPromise = null
      prefetchIndex = -1
      return result
    }
    const seg = segments[index]
    if (!seg) throw new Error('Missing segment')
    return synthesize(seg.text)
  }

  async function playSegment(sessionId: number): Promise<void> {
    if (sessionId !== playingSession) return

    const seg = segments[currentIndex]
    if (!seg) {
      callbacks.onFinish()
      return
    }

    callbacks.onHighlight(seg.blockId, currentIndex)

    let text = seg.text
    if (contentOffsetMs > 0) {
      text = sliceTextAtOffset(seg.text, contentOffsetMs * rate, rate)
      if (!text) {
        currentIndex += 1
        contentOffsetMs = 0
        await playSegment(sessionId)
        return
      }
    }

    try {
      const { blob, durationMs } = await getSegmentAudio(currentIndex)
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
        if (currentIndex < segments.length - 1) {
          currentIndex += 1
          contentOffsetMs = 0
          void playSegment(sessionId)
          return
        }
        callbacks.onError('Playback failed')
      }

      await audio.play()
      if (sessionId !== playingSession) return

      callbacks.onStatus('playing')
      startTick()
      reportProgress()
      prefetchNext(sessionId)
    } catch (err) {
      if (sessionId !== playingSession) return
      console.error('[piper] synthesis failed', err)
      callbacks.onError('Speech synthesis failed — try reloading the page')
    }
  }

  return {
    async isVoiceCached() {
      try {
        const piper = await loadPiper()
        const stored = await piper.stored()
        return stored.includes(voiceId)
      } catch {
        return false
      }
    },

    async ensureReady(onModelProgress) {
      try {
        await ensureOrtWasmConfigured()
        const piper = await loadPiper()

        const stored = await piper.stored()
        if (!stored.includes(voiceId)) {
          await piper.download(voiceId, progress => {
            if (onModelProgress && progress.total > 0) {
              onModelProgress(Math.round((progress.loaded / progress.total) * 100))
            }
          })
        }

        session = null
        resetPiperSessionSingleton()
        await ensureSession()
        return true
      } catch (err) {
        session = null
        resetPiperSessionSingleton()
        console.error('[piper] init failed', err)
        return false
      }
    },

    async play(nextSegments) {
      segments = nextSegments
      currentIndex = 0
      contentOffsetMs = 0
      estimatedDurations = buildEstimatedDurations(segments, rate)
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
      stopTick()
      reportProgress()
      callbacks.onStatus('paused')
    },

    async resume() {
      if (!segments.length) return

      if (audio && audio.paused && audio.src) {
        await audio.play()
        callbacks.onStatus('playing')
        startTick()
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
      stopTick()
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
      if (audio && !audio.paused) {
        reportProgress()
      }
    },

    setVoice(nextVoiceId) {
      if (voiceId === nextVoiceId) return
      voiceId = nextVoiceId
      session = null
      resetPiperSessionSingleton()
      if (audio && !audio.paused) {
        playingSession += 1
        const sessionId = playingSession
        cleanupAudio()
        void playSegment(sessionId)
      }
    },

    destroy() {
      this.stop()
      session = null
      resetPiperSessionSingleton()
    },
  }
}