import { get, set } from 'idb-keyval'
import {
  estimateSegmentMs,
  PIPER_SYNTH_MAX_CHARS,
  sliceTextAtOffset,
} from '../utils/extractReadingSegments'
import { concatWavBlobs } from './concatWav'
import type { ReadingSegment } from '../utils/extractReadingSegments'
import type { PreparedSegment } from './preparedSegment'
import { ensureOrtWasmConfigured, getPiperWasmPaths } from './piperWasmPaths'
import { prepareSpeechText, displayWordFromSpoken } from './speechPrep'
import { getGlossaryVersion } from './glossary/glossaryStore'
import { charWeightsForText, spokenWordAtOffset } from './wordTiming'
import {
  blockSpanAtChar,
  buildSynthChunkPlan,
  spokenCharOffset,
  targetMsForBlockSkip,
  type SynthChunkPlan,
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

const yieldToMain = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0))

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
  let voiceReady = false
  let audio: HTMLAudioElement | null = null
  let objectUrl: string | null = null
  let document: PreparedSegment | null = null
  let durationMs = 0
  let resumeOffsetMs = 0
  let playingSession = 0
  let synthPlan: SynthChunkPlan[] = []
  let chunkBlobs: (Blob | null)[] = []
  let chunkDurationMs: number[] = []
  let playingChunkIdx = -1
  let chunkBaseMs = 0
  let progressRaf = 0
  let lastHighlightBlockId: string | null = null
  let lastWordKey = ''

  function spokenLength(): number {
    return spokenTextFor(document ?? { text: '' }).length
  }

  function resolveChunkDuration(idx: number): number {
    return chunkDurationMs[idx] || estimateSegmentMs(synthPlan[idx]?.text ?? '', rate)
  }

  function contentDurationMs(): number {
    if (synthPlan.length) {
      return synthPlan.reduce((sum, _, i) => sum + resolveChunkDuration(i), 0)
    }
    return durationMs > 0 ? durationMs / rate : 0
  }

  function currentElapsedMs(): number {
    if (audio && playingChunkIdx >= 0) {
      return chunkBaseMs + (audio.currentTime * 1000) / rate
    }
    return resumeOffsetMs
  }

  function chunkAtElapsedMs(targetMs: number): { idx: number; offsetMs: number } {
    let acc = 0
    for (let i = 0; i < synthPlan.length; i++) {
      const dur = resolveChunkDuration(i)
      if (targetMs < acc + dur) return { idx: i, offsetMs: targetMs - acc }
      acc += dur
    }
    const last = Math.max(0, synthPlan.length - 1)
    return { idx: last, offsetMs: 0 }
  }

  function reportProgress(): void {
    if (!document) return
    const total = contentDurationMs()
    const elapsed = Math.min(currentElapsedMs(), total)
    callbacks.onProgress(elapsed, total)

    const spoken = spokenTextFor(document)
    const charOffset = spokenCharOffset(elapsed, total, spoken.length)
    const block = blockSpanAtChar(document.blockSpans ?? [], charOffset)
    if (block && block.blockId !== lastHighlightBlockId) {
      lastHighlightBlockId = block.blockId
      callbacks.onHighlight(block.blockId, 0)
    }

    if (callbacks.onWordHighlight && document.speech) {
      const weights = document.phonemeWeights ?? charWeightsForText(spoken)
      const spokenIdx = spokenWordAtOffset(elapsed, total, weights)
      const displayIdx = displayWordFromSpoken(document.speech.alignment, spokenIdx)
      const wordKey = `${block?.blockId ?? document.blockId}:${displayIdx}`
      if (wordKey !== lastWordKey) {
        lastWordKey = wordKey
        callbacks.onWordHighlight(block?.blockId ?? document.blockId, displayIdx)
      }
    }
  }

  function scheduleProgress(): void {
    if (progressRaf) return
    progressRaf = requestAnimationFrame(() => {
      progressRaf = 0
      reportProgress()
    })
  }

  function bindAudioProgress(sessionId: number): void {
    if (!audio) return
    audio.ontimeupdate = () => {
      if (sessionId !== playingSession) return
      scheduleProgress()
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

  async function synthChunkBlob(idx: number): Promise<Blob> {
    const existing = chunkBlobs[idx]
    if (existing) return existing

    const chunk = synthPlan[idx]
    if (!chunk) throw new Error('Missing synthesis chunk')

    const key = cacheKey(voiceId, chunk.text)
    const cached = await get<Blob>(key)
    if (cached) {
      chunkBlobs[idx] = cached
      return cached
    }

    const active = await ensureSession()
    const wav = await active.predict(chunk.text)
    await set(key, wav)
    chunkBlobs[idx] = wav
    return wav
  }

  async function measureChunkDuration(idx: number): Promise<number> {
    const known = chunkDurationMs[idx]
    if (known) return known

    const blob = chunkBlobs[idx] ?? (await synthChunkBlob(idx))
    const ms = await blobDurationMs(blob)
    chunkDurationMs[idx] = ms
    durationMs = chunkDurationMs.reduce((sum, value) => sum + value, 0)
    return ms
  }

  async function cacheMergedDocumentInBackground(
    sessionId: number,
    spoken: string,
  ): Promise<void> {
    if (sessionId !== playingSession || synthPlan.length <= 1) return
    const parts = chunkBlobs.filter((blob): blob is Blob => !!blob)
    if (parts.length !== synthPlan.length) return

    try {
      const key = cacheKey(voiceId, spoken)
      const merged = await concatWavBlobs(parts)
      await set(key, merged)
      await set(`${key}:dur`, durationMs)
      if (document?.phonemeWeights) {
        await set(`${key}:weights`, document.phonemeWeights)
      }
    } catch {
      /* optional optimization */
    }
  }

  async function prefetchRemainingChunks(sessionId: number, spoken: string): Promise<void> {
    for (let i = 1; i < synthPlan.length; i++) {
      if (sessionId !== playingSession) return
      await synthChunkBlob(i)
      await measureChunkDuration(i)
      await yieldToMain()
    }
    void cacheMergedDocumentInBackground(sessionId, spoken)
  }

  async function playChunkAt(
    sessionId: number,
    idx: number,
    offsetInChunkMs = 0,
  ): Promise<void> {
    if (sessionId !== playingSession || !document) return

    await synthChunkBlob(idx)
    if (sessionId !== playingSession) return

    await measureChunkDuration(idx)
    playingChunkIdx = idx
    chunkBaseMs = chunkDurationMs.slice(0, idx).reduce((sum, value) => sum + value, 0)

    const blob = chunkBlobs[idx]
    if (!blob) throw new Error('Chunk synthesis failed')

    cleanupAudio()
    objectUrl = URL.createObjectURL(blob)
    audio = new Audio(objectUrl)
    audio.playbackRate = rate
    if (offsetInChunkMs > 0) {
      audio.currentTime = (offsetInChunkMs * rate) / 1000
    }

    audio.onended = () => {
      if (sessionId !== playingSession) return
      const next = idx + 1
      if (next < synthPlan.length) {
        void (async () => {
          if (!chunkBlobs[next]) callbacks.onStatus('synthesizing')
          try {
            await playChunkAt(sessionId, next, 0)
          } catch (err) {
            if (sessionId !== playingSession) return
            console.error('[piper] chunk playback failed', err)
            callbacks.onError('Speech synthesis failed — try reloading the page')
          }
        })()
      } else {
        callbacks.onFinish()
      }
    }

    audio.onerror = () => {
      if (sessionId !== playingSession) return
      callbacks.onError('Playback failed')
    }

    bindAudioProgress(sessionId)
    await audio.play()
    if (sessionId !== playingSession) return

    callbacks.onStatus('playing')
    scheduleProgress()
  }

  async function startCachedPlayback(
    sessionId: number,
    blob: Blob,
    blobMs: number,
    fromOffsetMs: number,
  ): Promise<void> {
    durationMs = blobMs
    synthPlan = []
    chunkBlobs = []
    chunkDurationMs = []
    playingChunkIdx = -1
    chunkBaseMs = 0
    resumeOffsetMs = fromOffsetMs
    cleanupAudio()

    objectUrl = URL.createObjectURL(blob)
    audio = new Audio(objectUrl)
    audio.playbackRate = rate
    if (fromOffsetMs > 0) {
      audio.currentTime = (fromOffsetMs * rate) / 1000
    }

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
    scheduleProgress()
  }

  async function startStreamingPlayback(
    sessionId: number,
    spoken: string,
    fromOffsetMs: number,
  ): Promise<void> {
    synthPlan = buildSynthChunkPlan(spoken, PIPER_SYNTH_MAX_CHARS)
    chunkBlobs = new Array(synthPlan.length).fill(null)
    chunkDurationMs = new Array(synthPlan.length).fill(0)
    playingChunkIdx = -1
    durationMs = synthPlan.reduce(
      (sum, chunk) => sum + estimateSegmentMs(chunk.text, rate),
      0,
    )

    callbacks.onStatus('synthesizing')
    void prefetchRemainingChunks(sessionId, spoken)

    const { idx, offsetMs } = chunkAtElapsedMs(fromOffsetMs)
    resumeOffsetMs = fromOffsetMs
    await playChunkAt(sessionId, idx, offsetMs)
  }

  async function startPlayback(sessionId: number, fromOffsetMs = 0): Promise<void> {
    if (sessionId !== playingSession || !document) return

    try {
      let spoken = spokenTextFor(document)
      if (fromOffsetMs > 0) {
        spoken = sliceTextAtOffset(spoken, fromOffsetMs * rate, rate)
        if (!spoken) throw new Error('Nothing left to read')
        document = {
          ...document,
          speech: prepareSpeechText(spoken),
          phonemeWeights: charWeightsForText(prepareSpeechText(spoken).spokenText),
        }
        spoken = spokenTextFor(document)
        fromOffsetMs = 0
      }

      const key = cacheKey(voiceId, spoken)
      const cached = await get<Blob>(key)
      if (cached) {
        const cachedDuration =
          (await get<number>(`${key}:dur`)) ?? (await blobDurationMs(cached))
        const weights = (await get<number[]>(`${key}:weights`)) ?? document.phonemeWeights
        if (weights) document.phonemeWeights = weights
        await startCachedPlayback(sessionId, cached, cachedDuration, fromOffsetMs)
        return
      }

      await startStreamingPlayback(sessionId, spoken, fromOffsetMs)
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
      if (voiceReady && session?.voiceId === voiceId) return true

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

        if (!session || session.voiceId !== voiceId) {
          resetPiperSessionSingleton()
          session = null
          await ensureSession()
        }

        voiceReady = true
        return true
      } catch (err) {
        voiceReady = false
        session = null
        resetPiperSessionSingleton()
        console.error('[piper] init failed', err)
        return false
      }
    },

    async play(nextSegments) {
      document = prepareDocument(nextSegments)
      if (!document) return

      const spoken = spokenTextFor(document)
      durationMs = estimateSegmentMs(spoken, rate)
      resumeOffsetMs = 0
      lastHighlightBlockId = null
      lastWordKey = ''
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
      synthPlan = []
      chunkBlobs = []
      chunkDurationMs = []
      playingChunkIdx = -1
      chunkBaseMs = 0
      lastHighlightBlockId = null
      lastWordKey = ''
      callbacks.onClearHighlight()
      callbacks.onStatus('idle')
      callbacks.onProgress(0, 0)
    },

    skip(deltaMs) {
      if (!document || !durationMs) return
      const total = contentDurationMs()
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

      if (synthPlan.length && audio && !audio.paused) {
        const { idx, offsetMs } = chunkAtElapsedMs(target)
        if (idx === playingChunkIdx) {
          audio.currentTime = (offsetMs * rate) / 1000
          resumeOffsetMs = target
          scheduleProgress()
          return
        }

        resumeOffsetMs = target
        playingSession += 1
        const sessionId = playingSession
        cleanupAudio()
        void playChunkAt(sessionId, idx, offsetMs)
        return
      }

      if (audio && !audio.paused) {
        audio.currentTime = (target * rate) / 1000
        resumeOffsetMs = target
        scheduleProgress()
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
        if (playingChunkIdx >= 0) {
          chunkBaseMs = chunkDurationMs.slice(0, playingChunkIdx).reduce((sum, value) => sum + value, 0)
          resumeOffsetMs = chunkBaseMs + contentPos
        } else {
          resumeOffsetMs = contentPos
        }
      }
      if (audio && !audio.paused) scheduleProgress()
    },

    setVoice(nextVoiceId) {
      if (voiceId === nextVoiceId) return
      voiceId = nextVoiceId
      voiceReady = false
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
      voiceReady = false
      session = null
      resetPiperSessionSingleton()
    },
  }
}