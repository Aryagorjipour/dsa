import { ref, computed, watch, onUnmounted } from 'vue'
import { useRoute, useData } from 'vitepress'
import { assignBlockIds } from '../utils/assignBlockIds'
import { extractReadingSegments, totalEstimatedMs } from '../utils/extractReadingSegments'
import {
  canUsePiperTts,
  loadStoredPiperVoice,
  loadStoredRate,
  PIPER_VOICES_CURATED,
  saveStoredPiperVoice,
  saveStoredRate,
} from '../utils/ttsVoices'
import { showToast } from './useToast'
import { createPiperEngine } from '../tts/piperEngine'
import {
  findSegmentWordOffset,
  setWordHighlight,
  tokenizeWords,
  unwrapAllWordHighlights,
  wrapBlockWords,
} from '../tts/wordHighlight'
import { buildEstimatedDurations, mergeDurations } from '../tts/segmentTiming'
import type { TtsEngine, TtsEngineCallbacks, TtsStatus } from '../tts/types'

export type { TtsStatus }

const SKIP_MS = 10_000

const status = ref<TtsStatus>('idle')
const rate = ref(loadStoredRate())
const segments = ref<ReturnType<typeof extractReadingSegments>>([])
const elapsedMs = ref(0)
const totalMs = ref(0)
const panelOpen = ref(false)
const piperVoiceId = ref(loadStoredPiperVoice())
const modelLoading = ref(false)
const modelProgress = ref(0)
const modelCached = ref(false)
const activeSegmentIndex = ref(0)

let piperEngine: TtsEngine | null = null
let wordClickBound = false

function clearHighlight(): void {
  document.querySelectorAll('.dsa-tts-active').forEach(el => {
    el.classList.remove('dsa-tts-active')
  })
  unwrapAllWordHighlights()
}

function escapeAttr(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value)
  }
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function highlightBlock(blockId: string, segmentIndex: number): void {
  clearHighlight()
  const el = document.querySelector(`[data-dsa-block="${escapeAttr(blockId)}"]`)
  if (el instanceof HTMLElement) {
    el.classList.add('dsa-tts-active')
    wrapBlockWords(el)
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }
  activeSegmentIndex.value = segmentIndex
}

function blockWordIndex(blockId: string, segmentIndex: number, segmentWordIdx: number): number {
  const el = document.querySelector(`[data-dsa-block="${escapeAttr(blockId)}"]`)
  const blockText = el?.textContent || ''
  const seg = segments.value[segmentIndex]
  if (!seg) return segmentWordIdx

  const priorTexts = segments.value
    .slice(0, segmentIndex)
    .filter(s => s.blockId === blockId)
    .map(s => s.text)

  return findSegmentWordOffset(blockText, seg.text, priorTexts) + segmentWordIdx
}

function handleWordClick(e: MouseEvent): void {
  const target = e.target
  if (!(target instanceof HTMLElement)) return
  const wordEl = target.closest('.dsa-tts-word')
  if (!(wordEl instanceof HTMLElement)) return

  const blockEl = wordEl.closest('[data-dsa-block]')
  if (!(blockEl instanceof HTMLElement)) return

  const blockId = blockEl.dataset.dsaBlock
  const wordIndex = Number(wordEl.dataset.ttsWord)
  if (!blockId || Number.isNaN(wordIndex)) return

  if (!segments.value.length && !loadSegments()) return
  if (status.value === 'idle') {
    panelOpen.value = true
    return
  }

  const blockText = blockEl.textContent || ''
  const estimated = buildEstimatedDurations(segments.value, rate.value)
  const durations = mergeDurations(estimated, []).map(d => d / rate.value)

  let targetMs = 0
  let found = false

  for (let i = 0; i < segments.value.length; i++) {
    const s = segments.value[i]
    if (s.blockId !== blockId) {
      targetMs += durations[i] ?? 0
      continue
    }

    const priorTexts = segments.value
      .slice(0, i)
      .filter(seg => seg.blockId === blockId)
      .map(seg => seg.text)
    const segWordOffset = findSegmentWordOffset(blockText, s.text, priorTexts)
    const segWordCount = tokenizeWords(s.text).length

    if (wordIndex >= segWordOffset && wordIndex < segWordOffset + segWordCount) {
      const localWordIdx = wordIndex - segWordOffset
      const ratio = segWordCount > 0 ? localWordIdx / segWordCount : 0
      targetMs += ratio * (durations[i] ?? 0)
      found = true
      break
    }

    targetMs += durations[i] ?? 0
  }

  if (!found) return
  getPiperEngine().seekTo(targetMs)
}

function bindWordClickDelegate(): void {
  if (wordClickBound || typeof document === 'undefined') return
  document.addEventListener('click', handleWordClick)
  wordClickBound = true
}

function unbindWordClickDelegate(): void {
  if (!wordClickBound || typeof document === 'undefined') return
  document.removeEventListener('click', handleWordClick)
  wordClickBound = false
}

function engineCallbacks(): TtsEngineCallbacks {
  return {
    onStatus(next) {
      status.value = next
      updateMediaSessionPlayback()
    },
    onProgress(elapsed, total) {
      elapsedMs.value = elapsed
      totalMs.value = total
      updateMediaSessionPosition()
    },
    onHighlight: highlightBlock,
    onWordHighlight(blockId, segmentWordIdx) {
      const el = document.querySelector(`[data-dsa-block="${escapeAttr(blockId)}"]`)
      if (el instanceof HTMLElement) {
        const idx = blockWordIndex(blockId, activeSegmentIndex.value, segmentWordIdx)
        setWordHighlight(el, idx)
      }
    },
    onClearHighlight: clearHighlight,
    onFinish() {
      showToast('Finished reading this page')
      stop()
    },
    onError(message) {
      showToast(message)
      stop()
    },
  }
}

function getPiperEngine(): TtsEngine {
  if (!piperEngine) {
    piperEngine = createPiperEngine(engineCallbacks(), piperVoiceId.value, rate.value)
  }
  return piperEngine
}

function loadSegments(): boolean {
  assignBlockIds()
  const next = extractReadingSegments()
  segments.value = next
  return next.length > 0
}

function updateMediaSession(pageTitle: string): void {
  if (!('mediaSession' in navigator)) return

  navigator.mediaSession.metadata = new MediaMetadata({
    title: pageTitle || 'DSA Handbook',
    artist: 'Listen mode',
    album: 'Handbook',
  })
  updateMediaSessionPlayback()
  updateMediaSessionPosition()
}

function updateMediaSessionPlayback(): void {
  if (!('mediaSession' in navigator)) return
  navigator.mediaSession.playbackState = status.value === 'playing' ? 'playing' : 'paused'
}

function updateMediaSessionPosition(): void {
  if (!('mediaSession' in navigator)) return
  const total = totalMs.value || totalEstimatedMs(segments.value, rate.value)
  if (!('setPositionState' in navigator.mediaSession) || total <= 0) return
  try {
    navigator.mediaSession.setPositionState({
      duration: total / 1000,
      playbackRate: rate.value,
      position: Math.min(total / 1000, elapsedMs.value / 1000),
    })
  } catch {
    /* ignore */
  }
}

function bindMediaSessionHandlers(pageTitle: string): void {
  if (!('mediaSession' in navigator)) return

  navigator.mediaSession.setActionHandler('play', () => {
    void resume()
  })
  navigator.mediaSession.setActionHandler('pause', () => {
    pause()
  })
  navigator.mediaSession.setActionHandler('seekbackward', () => {
    skip(-SKIP_MS)
  })
  navigator.mediaSession.setActionHandler('seekforward', () => {
    skip(SKIP_MS)
  })
  navigator.mediaSession.setActionHandler('stop', () => {
    stop()
  })

  updateMediaSession(pageTitle)
}

function clearMediaSession(): void {
  if (!('mediaSession' in navigator)) return
  navigator.mediaSession.metadata = null
  navigator.mediaSession.playbackState = 'none'
  ;['play', 'pause', 'seekbackward', 'seekforward', 'stop'].forEach(action => {
    try {
      navigator.mediaSession.setActionHandler(action as MediaSessionAction, null)
    } catch {
      /* ignore */
    }
  })
}

async function refreshModelCached(): Promise<void> {
  modelCached.value = await getPiperEngine().isVoiceCached()
}

async function ensureEngineReady(): Promise<boolean> {
  modelLoading.value = true
  modelProgress.value = 0
  try {
    const cached = await getPiperEngine().isVoiceCached()
    modelCached.value = cached
    return await getPiperEngine().ensureReady(p => {
      modelProgress.value = p
    })
  } finally {
    modelLoading.value = false
    modelProgress.value = 0
    await refreshModelCached()
  }
}

async function play(pageTitle: string): Promise<void> {
  if (!canUsePiperTts()) {
    showToast('Listen requires WebAssembly and audio support')
    return
  }

  if (!loadSegments()) {
    showToast('No readable content on this page')
    return
  }

  panelOpen.value = true
  bindMediaSessionHandlers(pageTitle)
  bindWordClickDelegate()

  const ready = await ensureEngineReady()
  if (!ready) {
    showToast('Natural voice failed to load — reload and try again')
    return
  }

  await getPiperEngine().play(segments.value)
}

function pause(): void {
  if (status.value !== 'playing') return
  getPiperEngine().pause()
}

async function resume(): Promise<void> {
  if (status.value === 'paused') {
    await getPiperEngine().resume()
    return
  }
  if (status.value === 'idle') {
    await play('')
  }
}

function stop(): void {
  piperEngine?.stop()
  clearMediaSession()
}

function skip(deltaMs: number): void {
  if (!segments.value.length && !loadSegments()) return
  if (status.value === 'idle') {
    panelOpen.value = true
    return
  }
  getPiperEngine().skip(deltaMs)
}

function setRate(next: number): void {
  const clamped = Math.max(0.5, Math.min(2, next))
  rate.value = clamped
  saveStoredRate(clamped)
  getPiperEngine().setRate(clamped)
}

function setPiperVoice(voiceId: string): void {
  piperVoiceId.value = voiceId
  saveStoredPiperVoice(voiceId)
  getPiperEngine().setVoice(voiceId)
  void refreshModelCached()
}

async function toggle(pageTitle: string): Promise<void> {
  if (status.value === 'playing') {
    pause()
    return
  }
  if (status.value === 'paused') {
    await resume()
    return
  }
  await play(pageTitle)
}

export function getListenStatus(): TtsStatus {
  return status.value
}

export function skipListen(ms: number): void {
  skip(ms)
}

export function toggleHandbookTts(): Promise<void> {
  const title =
    typeof document !== 'undefined' ? document.title.replace(/\s*\|\s*DSA Handbook.*$/i, '').trim() : 'Handbook'
  return toggle(title || 'Handbook')
}

export function stopHandbookTts(): void {
  stop()
}

export function useHandbookTts() {
  const route = useRoute()
  const { page } = useData()

  const pageTitle = computed(() => page.value.title || 'Handbook')
  const progress = computed(() => (totalMs.value ? (elapsedMs.value / totalMs.value) * 100 : 0))
  const isSupported = computed(() => canUsePiperTts())
  const piperVoices = computed(() => PIPER_VOICES_CURATED)

  const currentLabel = computed(() => {
    if (!segments.value.length) return ''
    const ratio = totalMs.value ? elapsedMs.value / totalMs.value : 0
    const idx = Math.min(segments.value.length - 1, Math.floor(ratio * segments.value.length))
    const active = segments.value[idx]
    if (!active) return ''
    const preview = active.text.slice(0, 48)
    return preview.length < active.text.length ? `${preview}…` : preview
  })

  onUnmounted(() => {
    stop()
    piperEngine?.destroy()
    unbindWordClickDelegate()
  })

  watch(
    () => route.path,
    () => {
      stop()
      panelOpen.value = false
      segments.value = []
    },
  )

  void refreshModelCached()

  return {
    status,
    rate,
    progress,
    elapsedMs,
    totalMs,
    currentLabel,
    panelOpen,
    isSupported,
    piperVoices,
    piperVoiceId,
    modelLoading,
    modelProgress,
    modelCached,
    play: () => play(pageTitle.value),
    pause,
    resume,
    stop,
    skip,
    setRate,
    setPiperVoice,
    toggle: () => toggle(pageTitle.value),
    openPanel: () => {
      panelOpen.value = true
    },
  }
}