import { sliceTextAtOffset } from '../utils/extractReadingSegments'
import type { ReadingSegment } from '../utils/extractReadingSegments'
import type { PreparedSegment } from './preparedSegment'
import {
  buildPlaybackChunks,
  segmentIndexAtOffsetInChunk,
  splitDurationByWeights,
  type PlaybackChunk,
} from './cloudChunkPlan'
import { getProviderAdapter, isLikelyCorsError } from './providers'
import {
  buildEstimatedDurations,
  mergeDurations,
  resolveSegmentAtDurations,
  totalDurationMs,
} from './segmentTiming'
import { prepareSpeechText, displayWordFromSpoken } from './speechPrep'
import { charWeightsForText, spokenWordAtOffset } from './wordTiming'
import { blockWordIndexForSegment } from './wordHighlight'
import { targetSegmentForBlockSkip } from './blockNavigation'
import { getCloudApiKey, loadCloudTtsConfig } from './ttsSecretStore'
import type { TtsEngine, TtsEngineCallbacks } from './types'

interface ChunkAudio {
  blob: Blob
  durationMs: number
  segmentDurations: number[]
}

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
  let chunks: PlaybackChunk[] = []
  let currentChunkIdx = 0
  let currentIndex = 0
  let contentOffsetMs = 0
  let chunkSegmentDurations: number[] = []
  let estimatedDurations: number[] = []
  let actualDurations: Array<number | undefined> = []
  let playingSession = 0
  let chunkCache = new Map<number, Promise<ChunkAudio>>()
  const chunkReady = new Set<number>()

  const SYNTH_UI_DELAY_MS = 200
  const PREFETCH_AHEAD = 2
  const PREFETCH_WHEN_REMAINING_S = 12

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
        let offsetInSeg = 0
        if (audio && chunkSegmentDurations.length) {
          const audioMs = (audio.currentTime * 1000) / rate
          const chunk = chunks[currentChunkIdx]
          const local = segmentIndexAtOffsetInChunk(audioMs, chunkSegmentDurations)
          const globalIdx = chunk?.segmentIndices[local.index] ?? currentIndex
          if (globalIdx !== currentIndex) {
            currentIndex = globalIdx
            const active = segments[currentIndex]
            if (active) callbacks.onHighlight(active.blockId, currentIndex)
          }
          offsetInSeg = local.offsetMs
        } else if (audio) {
          offsetInSeg = (audio.currentTime * 1000) / rate
        } else {
          offsetInSeg = contentOffsetMs
        }
        const weights = seg.phonemeWeights ?? charWeightsForText(seg.speech.spokenText)
        const spokenIdx = spokenWordAtOffset(offsetInSeg, segDuration, weights)
        const displayIdx = displayWordFromSpoken(seg.speech.alignment, spokenIdx)
        callbacks.onWordHighlight(
          seg.blockId,
          blockWordIndexForSegment(segments, currentIndex, displayIdx),
        )
      }
    }
  }

  function bindAudioProgress(sessionId: number): void {
    if (!audio) return
    audio.ontimeupdate = () => {
      if (sessionId !== playingSession) return
      const chunk = chunks[currentChunkIdx]
      if (chunk && chunkSegmentDurations.length > 1) {
        const audioMs = (audio!.currentTime * 1000) / rate
        const local = segmentIndexAtOffsetInChunk(audioMs, chunkSegmentDurations)
        const globalIdx = chunk.segmentIndices[local.index] ?? currentIndex
        if (globalIdx !== currentIndex) {
          currentIndex = globalIdx
          const seg = segments[currentIndex]
          if (seg) callbacks.onHighlight(seg.blockId, currentIndex)
        }
      }
      reportProgress()
      maybePrefetchDuringPlayback(sessionId)
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

  function clearChunkCache(): void {
    chunkCache = new Map()
    chunkReady.clear()
  }

  function prefetchChunks(sessionId: number, fromIdx: number, count = PREFETCH_AHEAD): void {
    for (let i = 0; i < count; i++) {
      const idx = fromIdx + i
      if (idx >= chunks.length) break
      ensureChunkCached(idx, sessionId).catch(() => {
        /* surfaced when playback reaches chunk */
      })
    }
  }

  function maybePrefetchDuringPlayback(sessionId: number): void {
    if (!audio || audio.paused || !Number.isFinite(audio.duration)) return
    const remaining = audio.duration - audio.currentTime
    if (remaining > PREFETCH_WHEN_REMAINING_S) return
    prefetchChunks(sessionId, currentChunkIdx + 1, PREFETCH_AHEAD + 1)
  }

  async function awaitChunkWithOptionalSynthUi(
    chunkIdx: number,
    sessionId: number,
    showSynthUi: boolean,
  ): Promise<ChunkAudio> {
    if (chunkReady.has(chunkIdx)) {
      return ensureChunkCached(chunkIdx, sessionId)
    }

    let synthTimer: ReturnType<typeof setTimeout> | null = null
    if (showSynthUi) {
      synthTimer = setTimeout(() => {
        if (sessionId === playingSession) callbacks.onStatus('synthesizing')
      }, SYNTH_UI_DELAY_MS)
    }

    try {
      return await ensureChunkCached(chunkIdx, sessionId)
    } finally {
      if (synthTimer) clearTimeout(synthTimer)
    }
  }

  async function synthesizeChunk(chunkIdx: number, sessionId: number): Promise<ChunkAudio> {
    const chunk = chunks[chunkIdx]
    if (!chunk) throw new Error('Missing chunk')

    const config = await loadCloudTtsConfig()
    const apiKey = await getCloudApiKey()
    if (!apiKey || !config.configured) {
      throw new Error('Cloud TTS not configured — open Configure in Listen panel')
    }

    const segs = chunk.segmentIndices.map(i => segments[i]).filter(Boolean) as PreparedSegment[]
    const weights = segs.map(s => spokenTextFor(s).length)
    const text = segs.map(s => spokenTextFor(s)).join(' ')

    const adapter = getProviderAdapter(config.provider)
    let blob: Blob
    try {
      blob = await adapter.synthesize({
        baseUrl: config.baseUrl,
        apiKey,
        model: config.model,
        voiceId: config.voiceId,
        text,
        rate,
      })
    } catch (err) {
      if (isLikelyCorsError(err)) {
        throw new Error('Browser blocked API call — use Custom with a CORS-enabled proxy URL')
      }
      const msg = err instanceof Error ? err.message : String(err)
      if (/grok-tts/i.test(msg) && config.provider !== 'grok') {
        throw new Error(
          'Model grok-tts only works with provider Grok + https://api.x.ai — not Custom/OpenAI speech',
        )
      }
      throw err
    }

    if (sessionId !== playingSession) throw new Error('Session cancelled')

    const durationMs = await blobDurationMs(blob)
    const segmentDurations = splitDurationByWeights(durationMs, weights)

    for (let j = 0; j < segs.length; j++) {
      const segIdx = chunk.segmentIndices[j]
      if (segIdx !== undefined) actualDurations[segIdx] = segmentDurations[j]
    }

    return { blob, durationMs, segmentDurations }
  }

  function ensureChunkCached(chunkIdx: number, sessionId: number): Promise<ChunkAudio> {
    const cached = chunkCache.get(chunkIdx)
    if (cached) return cached

    const pending = synthesizeChunk(chunkIdx, sessionId)
      .then(result => {
        chunkReady.add(chunkIdx)
        return result
      })
      .catch(err => {
        chunkCache.delete(chunkIdx)
        chunkReady.delete(chunkIdx)
        throw err
      })
    chunkCache.set(chunkIdx, pending)
    return pending
  }

  async function playChunk(sessionId: number): Promise<void> {
    if (sessionId !== playingSession) return

    const chunk = chunks[currentChunkIdx]
    if (!chunk) {
      callbacks.onFinish()
      return
    }

    const seg = segments[currentIndex]
    if (seg) callbacks.onHighlight(seg.blockId, currentIndex)

    prefetchChunks(sessionId, currentChunkIdx + 1, PREFETCH_AHEAD)

    try {
      const showSynthUi = !chunkReady.has(currentChunkIdx)
      const { blob, segmentDurations } = await awaitChunkWithOptionalSynthUi(
        currentChunkIdx,
        sessionId,
        showSynthUi,
      )
      if (sessionId !== playingSession) return

      chunkSegmentDurations = segmentDurations
      cleanupAudio()

      let startOffsetMs = 0
      if (contentOffsetMs > 0 && chunk.segmentIndices.includes(currentIndex)) {
        const localIdx = chunk.segmentIndices.indexOf(currentIndex)
        for (let i = 0; i < localIdx; i++) startOffsetMs += segmentDurations[i] ?? 0
        startOffsetMs += contentOffsetMs
      }

      objectUrl = URL.createObjectURL(blob)
      audio = new Audio(objectUrl)
      audio.playbackRate = rate
      if (startOffsetMs > 0) {
        audio.currentTime = (startOffsetMs * rate) / 1000
      }

      audio.onended = () => {
        if (sessionId !== playingSession) return
        const lastInChunk = chunk.segmentIndices[chunk.segmentIndices.length - 1]
        if (lastInChunk !== undefined) {
          currentIndex = lastInChunk + 1
        }
        currentChunkIdx += 1
        contentOffsetMs = 0
        chunkSegmentDurations = []
        if (currentChunkIdx >= chunks.length) {
          callbacks.onFinish()
          return
        }
        const nextChunk = chunks[currentChunkIdx]
        const nextSegIdx = nextChunk?.segmentIndices[0]
        if (nextSegIdx !== undefined) currentIndex = nextSegIdx
        void playChunk(sessionId)
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
      prefetchChunks(sessionId, currentChunkIdx + 1, PREFETCH_AHEAD + 1)
    } catch (err) {
      if (sessionId !== playingSession) return
      const message = err instanceof Error ? err.message : 'Cloud synthesis failed'
      console.error('[cloud-tts]', err)
      callbacks.onStatus('paused')
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
      const modelOk = config.provider === 'grok' || !!config.model
      return config.configured && !!apiKey && modelOk && !!config.voiceId
    },

    async play(nextSegments) {
      segments = prepareSegments(nextSegments)
      chunks = buildPlaybackChunks(segments, spokenTextFor)
      currentChunkIdx = 0
      currentIndex = 0
      contentOffsetMs = 0
      chunkSegmentDurations = []
      estimatedDurations = buildEstimatedDurations(
        segments.map(s => ({ ...s, text: spokenTextFor(s) })),
        rate,
      )
      actualDurations = new Array(segments.length)
      playingSession += 1
      const sessionId = playingSession
      clearChunkCache()
      cleanupAudio()
      prefetchChunks(sessionId, 0, PREFETCH_AHEAD + 1)
      await playChunk(sessionId)
    },

    pause() {
      if (!audio || audio.paused) return
      if (chunkSegmentDurations.length && chunks[currentChunkIdx]) {
        const audioMs = (audio.currentTime * 1000) / rate
        const local = segmentIndexAtOffsetInChunk(audioMs, chunkSegmentDurations)
        const globalIdx = chunks[currentChunkIdx].segmentIndices[local.index] ?? currentIndex
        currentIndex = globalIdx
        contentOffsetMs = local.offsetMs
      } else {
        contentOffsetMs = (audio.currentTime * 1000) / rate
      }
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
      await playChunk(sessionId)
    },

    stop() {
      playingSession += 1
      cleanupAudio()
      clearChunkCache()
      segments = []
      chunks = []
      currentChunkIdx = 0
      currentIndex = 0
      contentOffsetMs = 0
      chunkSegmentDurations = []
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

    skipSegment(deltaBlocks) {
      if (!segments.length) return
      const durations = effectiveDurations()
      const targetSeg = targetSegmentForBlockSkip(
        segments,
        durations,
        currentElapsedMs(),
        deltaBlocks,
      )
      if (targetSeg === null) return

      let elapsed = 0
      for (let i = 0; i < targetSeg; i++) elapsed += durations[i] ?? 0
      this.seekTo(elapsed)
    },

    seekTo(targetMs) {
      if (!segments.length) return
      const durations = effectiveDurations()
      const total = totalDurationMs(durations)
      const target = Math.max(0, Math.min(total - 1, targetMs))
      const resolved = resolveSegmentAtDurations(durations, target)
      currentIndex = resolved.index
      contentOffsetMs = resolved.offsetMs

      currentChunkIdx = chunks.findIndex(c => c.segmentIndices.includes(currentIndex))
      if (currentChunkIdx < 0) currentChunkIdx = 0

      if (!audio || audio.paused) {
        reportProgress()
        const seg = segments[currentIndex]
        if (seg) callbacks.onHighlight(seg.blockId, currentIndex)
        return
      }

      playingSession += 1
      const sessionId = playingSession
      cleanupAudio()
      void playChunk(sessionId)
    },

    setRate(next) {
      const prevRate = rate
      rate = Math.max(0.5, Math.min(2, next))
      if (audio) {
        const contentPos = (audio.currentTime * 1000) / prevRate
        audio.playbackRate = rate
        audio.currentTime = (contentPos * rate) / 1000
        if (chunkSegmentDurations.length && chunks[currentChunkIdx]) {
          const local = segmentIndexAtOffsetInChunk(contentPos, chunkSegmentDurations)
          const globalIdx = chunks[currentChunkIdx].segmentIndices[local.index] ?? currentIndex
          currentIndex = globalIdx
          contentOffsetMs = local.offsetMs
        } else {
          contentOffsetMs = contentPos
        }
      }
      if (audio && !audio.paused) reportProgress()
    },

    setVoice() {
      /* cloud voice from config store */
    },

    reloadVoice() {
      if (!segments.length) return
      const wasPlaying = !!(audio && !audio.paused)
      const elapsed = currentElapsedMs()
      clearChunkCache()
      playingSession += 1
      cleanupAudio()
      const durations = effectiveDurations()
      const resolved = resolveSegmentAtDurations(durations, elapsed)
      currentIndex = resolved.index
      contentOffsetMs = resolved.offsetMs
      currentChunkIdx = chunks.findIndex(c => c.segmentIndices.includes(currentIndex))
      if (currentChunkIdx < 0) currentChunkIdx = 0
      reportProgress()
      const seg = segments[currentIndex]
      if (seg) callbacks.onHighlight(seg.blockId, currentIndex)
      if (wasPlaying) {
        const sessionId = playingSession
        callbacks.onStatus('playing')
        void playChunk(sessionId)
      }
    },

    destroy() {
      this.stop()
    },
  }
}