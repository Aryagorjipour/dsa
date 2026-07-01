import { get, set } from 'idb-keyval'
import { sliceTextAtOffset } from '../utils/extractReadingSegments'
import type { ReadingSegment } from '../utils/extractReadingSegments'
import type { PreparedSegment } from './preparedSegment'
import { ensureOrtWasmConfigured, getPiperWasmPaths } from './piperWasmPaths'
import {
  buildEstimatedDurations,
  totalDurationMs,
} from './segmentTiming'
import { prepareSpeechText, displayWordFromSpoken } from './speechPrep'
import { getGlossaryVersion } from './glossary/glossaryStore'
import { charWeightsForText, spokenWordAtOffset } from './wordTiming'
import {
  blockSpanAtChar,
  spokenCharOffset,
  targetMsForBlockSkip,
} from './offlineDocument'
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

function cacheKey(voiceId: string, spokenText: string): string {
  return `piper-audio:${getGlossaryVersion()}:${voiceId}:${hashText(spokenText)}`
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

function prepareDocument(raw: ReadingSegment[]): PreparedSegment | null {
  const seg = raw[0]
  if (!seg) return null
  const speech = prepareSpeechText(seg.text)
  return {
    ...seg,
    speech,
    phonemeWeights: charWeightsForText(speech.spokenText),
  }
}

function spokenTextFor(seg: PreparedSegment): string {
  return seg.speech?.spokenText ?? seg.text
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
  let document: PreparedSegment | null = null
  let durationMs = 0
  let resumeOffsetMs = 0
  let playingSession = 0

  function spokenLength(): number {
    return spokenTextFor(document ?? { text: '' }).length
  }

  function currentElapsedMs(): number {
    if (audio) return (audio.currentTime * 1000) / rate
    return resumeOffsetMs
  }

  function contentDurationMs(): number {
    return durationMs > 0 ? durationMs / rate : 0
  }

  function reportProgress(): void {
    if (!document) return
    const total = contentDurationMs()
    const elapsed = Math.min(currentElapsedMs(), total)
    callbacks.onProgress(elapsed, total)

    const spoken = spokenTextFor(document)
    const charOffset = spokenCharOffset(elapsed, total, spoken.length)
    const block = blockSpanAtChar(document.blockSpans ?? [], charOffset)
    if (block) callbacks.onHighlight(block.blockId, 0)

    if (callbacks.onWordHighlight && document.speech) {
      const weights = document.phonemeWeights ?? charWeightsForText(spoken)
      const spokenIdx = spokenWordAtOffset(elapsed, total, weights)
      const displayIdx = displayWordFromSpoken(document.speech.alignment, spokenIdx)
      callbacks.onWordHighlight(block?.blockId ?? document.blockId, displayIdx)
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
      audio.ontimeupdate = null
      audio.onended = null
      audio.onerror = null
      audio.pause()
      audio.src = ''
      audio = null
    }
    revokeObjectUrl()
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

  async function synthesizeDocument(
    seg: PreparedSegment,
    fromOffsetMs = 0,
  ): Promise<{ blob: Blob; durationMs: number }> {
    let spoken = spokenTextFor(seg)
    if (fromOffsetMs > 0) {
      spoken = sliceTextAtOffset(spoken, fromOffsetMs * rate, rate)
      if (!spoken) throw new Error('Nothing left to read')
      seg = {
        ...seg,
        speech: prepareSpeechText(spoken),
        phonemeWeights: charWeightsForText(prepareSpeechText(spoken).spokenText),
      }
      spoken = spokenTextFor(seg)
    }

    const key = cacheKey(voiceId, spoken)
    const cached = await get<Blob>(key)
    if (cached) {
      const cachedDuration = (await get<number>(`${key}:dur`)) ?? (await blobDurationMs(cached))
      const weights = (await get<number[]>(`${key}:weights`)) ?? seg.phonemeWeights
      if (weights) seg.phonemeWeights = weights
      return { blob: cached, durationMs: cachedDuration }
    }

    const active = await ensureSession()
    const blob = await active.predict(spoken)
    const blobMs = await blobDurationMs(blob)
    const weights = seg.phonemeWeights ?? charWeightsForText(spoken)
    await set(key, blob)
    await set(`${key}:dur`, blobMs)
    await set(`${key}:weights`, weights)
    return { blob, durationMs: blobMs }
  }

  async function startPlayback(sessionId: number, fromOffsetMs = 0): Promise<void> {
    if (sessionId !== playingSession || !document) return

    let synthTimer: ReturnType<typeof setTimeout> | null = setTimeout(() => {
      if (sessionId === playingSession) callbacks.onStatus('synthesizing')
    }, 200)

    try {
      const { blob, durationMs: blobMs } = await synthesizeDocument(document, fromOffsetMs)
      if (synthTimer) clearTimeout(synthTimer)
      synthTimer = null
      if (sessionId !== playingSession) return

      durationMs = blobMs
      resumeOffsetMs = fromOffsetMs
      cleanupAudio()

      objectUrl = URL.createObjectURL(blob)
      audio = new Audio(objectUrl)
      audio.playbackRate = rate

      audio.onended = () => {
        if (sessionId !== playingSession) return
        callbacks.onFinish()
      }

      audio.onerror = () => {
        if (sessionId !== playingSession) return
        callbacks.onError('Playback failed')
      }

      bindAudioProgress(sessionId)
      await audio.play()
      if (sessionId !== playingSession) return

      callbacks.onStatus('playing')
      reportProgress()
    } catch (err) {
      if (synthTimer) clearTimeout(synthTimer)
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
      document = prepareDocument(nextSegments)
      if (!document) return

      durationMs = buildEstimatedDurations([document], rate)[0] ?? 0
      resumeOffsetMs = 0
      playingSession += 1
      const sessionId = playingSession
      cleanupAudio()
      await startPlayback(sessionId, 0)
    },

    pause() {
      if (!audio || audio.paused) return
      resumeOffsetMs = currentElapsedMs()
      audio.pause()
      reportProgress()
      callbacks.onStatus('paused')
    },

    async resume() {
      if (!document) return

      if (audio && audio.paused && audio.src) {
        await audio.play()
        callbacks.onStatus('playing')
        return
      }

      playingSession += 1
      const sessionId = playingSession
      cleanupAudio()
      await startPlayback(sessionId, resumeOffsetMs)
    },

    stop() {
      playingSession += 1
      cleanupAudio()
      document = null
      durationMs = 0
      resumeOffsetMs = 0
      callbacks.onClearHighlight()
      callbacks.onStatus('idle')
      callbacks.onProgress(0, 0)
    },

    skip(deltaMs) {
      if (!document || !durationMs) return
      const total = durationMs / rate
      const target = Math.max(0, Math.min(total - 1, currentElapsedMs() + deltaMs))
      this.seekTo(target)
    },

    skipSegment(deltaBlocks) {
      if (!document?.blockSpans?.length || !durationMs) return
      const target = targetMsForBlockSkip(
        document.blockSpans,
        currentElapsedMs(),
        contentDurationMs(),
        spokenLength(),
        deltaBlocks,
      )
      if (target === null) return
      this.seekTo(target)
    },

    seekTo(targetMs) {
      if (!document || !durationMs) return
      const total = contentDurationMs()
      const target = Math.max(0, Math.min(total - 1, targetMs))

      if (audio && !audio.paused) {
        audio.currentTime = (target * rate) / 1000
        resumeOffsetMs = target
        reportProgress()
        return
      }

      resumeOffsetMs = target
      reportProgress()
      const block = blockSpanAtChar(
        document.blockSpans ?? [],
        spokenCharOffset(target, contentDurationMs(), spokenLength()),
      )
      if (block) callbacks.onHighlight(block.blockId, 0)
    },

    setRate(next) {
      const prevRate = rate
      rate = Math.max(0.5, Math.min(2, next))
      if (audio) {
        const contentPos = (audio.currentTime * 1000) / prevRate
        audio.playbackRate = rate
        audio.currentTime = (contentPos * rate) / 1000
        resumeOffsetMs = contentPos
      }
      if (audio && !audio.paused) reportProgress()
    },

    setVoice(nextVoiceId) {
      if (voiceId === nextVoiceId) return
      voiceId = nextVoiceId
      session = null
      resetPiperSessionSingleton()
      this.reloadVoice()
    },

    reloadVoice() {
      if (!document) return
      const wasPlaying = !!(audio && !audio.paused)
      resumeOffsetMs = currentElapsedMs()
      playingSession += 1
      cleanupAudio()
      if (wasPlaying) {
        const sessionId = playingSession
        callbacks.onStatus('playing')
        void startPlayback(sessionId, resumeOffsetMs)
      }
    },

    destroy() {
      this.stop()
      session = null
      resetPiperSessionSingleton()
    },
  }
}