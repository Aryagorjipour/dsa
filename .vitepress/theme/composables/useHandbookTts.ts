import { ref, computed, watch, onUnmounted } from 'vue'
import { isFocusMode } from './useFocusMode'
import { useRoute, useData } from 'vitepress'
import { assignBlockIds } from '../utils/assignBlockIds'
import { extractReadingSegments, totalEstimatedMs } from '../utils/extractReadingSegments'
import {
  canUsePiperTts,
  loadStoredPiperVoice,
  loadStoredRate,
  loadStoredTtsEngine,
  PIPER_VOICES_CURATED,
  saveStoredPiperVoice,
  saveStoredRate,
  saveStoredTtsEngine,
  type TtsEngineChoice,
} from '../utils/ttsVoices'
import { showToast } from './useToast'
import { createPiperEngine } from '../tts/piperEngine'
import { createApiTtsEngine } from '../tts/apiTtsEngine'
import { clearLinePointer, setLinePointer } from '../tts/lineIndicator'
import { unwrapAllWordHighlights, wrapBlockWords } from '../tts/wordHighlight'
import { prepareAllSegments } from '../tts/seekByWord'
import type { PreparedSegment } from '../tts/preparedSegment'
import {
  DEFAULT_GLOSSARY,
  loadGlossaryOverrides,
  saveGlossaryOverrides,
  type GlossaryRule,
} from '../tts/glossary/glossaryStore'
import { isCloudSyncDue, syncCloudTtsConnection } from '../tts/cloudTtsSync'
import { isCloudTtsConfigured, loadCloudTtsConfig } from '../tts/ttsSecretStore'
import type { TtsEngine, TtsEngineCallbacks, TtsStatus } from '../tts/types'

export type { TtsStatus, GlossaryRule }

const SKIP_MS = 10_000

const status = ref<TtsStatus>('idle')
const rate = ref(loadStoredRate())
const segments = ref<PreparedSegment[]>([])
const elapsedMs = ref(0)
const totalMs = ref(0)
const panelOpen = ref(false)
const panelMinimized = ref(false)
const piperVoiceId = ref(loadStoredPiperVoice())
const ttsEngine = ref<TtsEngineChoice>(loadStoredTtsEngine())
const modelLoading = ref(false)
const modelProgress = ref(0)
const modelCached = ref(false)
const cloudConfigured = ref(false)
const glossaryOverrides = ref<GlossaryRule[]>(loadGlossaryOverrides())

let activeEngine: TtsEngine | null = null
let activeEngineKind: TtsEngineChoice | null = null
let lastWordHighlight: { blockId: string; displayWordIndex: number } | null = null

function clearHighlight(): void {
  lastWordHighlight = null
  document.querySelectorAll('.dsa-tts-active').forEach(el => {
    el.classList.remove('dsa-tts-active', 'dsa-tts-has-pointer')
    if (el instanceof HTMLElement) clearLinePointer(el)
  })
  unwrapAllWordHighlights()
}

function escapeAttr(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value)
  }
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function highlightBlock(blockId: string, _segmentIndex: number): void {
  clearHighlight()
  const el = document.querySelector(`[data-dsa-block="${escapeAttr(blockId)}"]`)
  if (el instanceof HTMLElement) {
    el.classList.add('dsa-tts-active')
    wrapBlockWords(el)
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }
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
    onWordHighlight(blockId, displayWordIndex) {
      lastWordHighlight = { blockId, displayWordIndex }
      const el = document.querySelector(`[data-dsa-block="${escapeAttr(blockId)}"]`)
      if (el instanceof HTMLElement) {
        setLinePointer(el, displayWordIndex)
      }
    },
    onClearHighlight: clearHighlight,
    onFinish() {
      showToast('Finished reading this page')
      stop()
    },
    onError(message) {
      showToast(message)
      if (
        status.value === 'playing' ||
        status.value === 'paused' ||
        status.value === 'synthesizing'
      ) {
        activeEngine?.pause()
      }
    },
  }
}

function destroyEngine(): void {
  activeEngine?.destroy()
  activeEngine = null
  activeEngineKind = null
}

function getEngine(): TtsEngine {
  const kind = ttsEngine.value
  if (activeEngine && activeEngineKind === kind) return activeEngine

  destroyEngine()
  activeEngineKind = kind

  if (kind === 'cloud') {
    activeEngine = createApiTtsEngine(engineCallbacks(), rate.value)
  } else {
    activeEngine = createPiperEngine(engineCallbacks(), piperVoiceId.value, rate.value)
  }
  return activeEngine
}

function loadSegments(): boolean {
  assignBlockIds()
  const next = extractReadingSegments()
  segments.value = prepareAllSegments(next)
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
  if (ttsEngine.value !== 'piper') {
    modelCached.value = false
    return
  }
  modelCached.value = await getEngine().isVoiceCached()
}

export async function refreshCloudConfigured(): Promise<void> {
  cloudConfigured.value = await isCloudTtsConfigured()
}

async function ensureEngineReady(): Promise<boolean> {
  if (ttsEngine.value === 'cloud') {
    const cloudConfig = await loadCloudTtsConfig()
    if (isCloudSyncDue(cloudConfig)) {
      void syncCloudTtsConnection(false).then(() => refreshCloudConfigured())
    }
    await refreshCloudConfigured()
    if (!cloudConfigured.value) {
      showToast('Configure Cloud AI in Listen settings first')
      return false
    }
    return await getEngine().ensureReady()
  }

  modelLoading.value = true
  modelProgress.value = 0
  try {
    const cached = await getEngine().isVoiceCached()
    modelCached.value = cached
    return await getEngine().ensureReady(p => {
      modelProgress.value = p
    })
  } finally {
    modelLoading.value = false
    modelProgress.value = 0
    await refreshModelCached()
  }
}

async function play(pageTitle: string): Promise<void> {
  if (!canUsePiperTts() && ttsEngine.value === 'piper') {
    showToast('Listen requires WebAssembly and audio support')
    return
  }

  if (!loadSegments()) {
    showToast('No readable content on this page')
    return
  }

  panelOpen.value = true
  panelMinimized.value = false
  bindMediaSessionHandlers(pageTitle)

  const ready = await ensureEngineReady()
  if (!ready) {
    showToast(
      ttsEngine.value === 'cloud'
        ? 'Cloud TTS not ready — open Configure and test your API key'
        : 'Natural voice failed to load — reload and try again',
    )
    return
  }

  await getEngine().play(segments.value)
}

function pause(): void {
  if (status.value !== 'playing') return
  getEngine().pause()
}

async function resume(): Promise<void> {
  if (status.value === 'paused') {
    await getEngine().resume()
    return
  }
  if (status.value === 'idle') {
    await play('')
  }
}

function stop(): void {
  activeEngine?.stop()
  clearMediaSession()
}

function skip(deltaMs: number): void {
  if (!segments.value.length && !loadSegments()) return
  if (status.value === 'idle') {
    panelOpen.value = true
    return
  }
  getEngine().skip(deltaMs)
}

function skipSegment(delta: number): void {
  if (!segments.value.length && !loadSegments()) return
  if (status.value === 'idle') {
    panelOpen.value = true
    return
  }
  getEngine().skipSegment(delta)
}

function setRate(next: number): void {
  const clamped = Math.max(0.5, Math.min(2, next))
  rate.value = clamped
  saveStoredRate(clamped)
  getEngine().setRate(clamped)
}

function setPiperVoice(voiceId: string): void {
  piperVoiceId.value = voiceId
  saveStoredPiperVoice(voiceId)
  if (ttsEngine.value === 'piper') {
    if (activeEngine && activeEngineKind === 'piper') {
      getEngine().setVoice(voiceId)
    } else {
      destroyEngine()
      getEngine().setVoice(voiceId)
    }
  }
  void refreshModelCached()
}

function reloadCloudVoice(): void {
  if (ttsEngine.value !== 'cloud' || status.value === 'idle') return
  getEngine().reloadVoice()
}

function minimizePanel(): void {
  if (!panelOpen.value) return
  panelMinimized.value = true
}

function expandPanel(): void {
  panelOpen.value = true
  panelMinimized.value = false
}

function setTtsEngine(engine: TtsEngineChoice): void {
  if (engine === 'cloud' && !cloudConfigured.value) {
    showToast('Configure Cloud AI first (settings)')
    return
  }
  const wasActive = status.value !== 'idle'
  if (wasActive) stop()
  ttsEngine.value = engine
  saveStoredTtsEngine(engine)
  destroyEngine()
  if (wasActive) showToast('Engine changed — press play to restart')
}

function addGlossaryOverride(rule: GlossaryRule): void {
  glossaryOverrides.value = [...glossaryOverrides.value, rule]
  saveGlossaryOverrides(glossaryOverrides.value)
  if (status.value !== 'idle') showToast('Glossary updated — replay page to apply')
}

function removeGlossaryOverride(index: number): void {
  glossaryOverrides.value = glossaryOverrides.value.filter((_, i) => i !== index)
  saveGlossaryOverrides(glossaryOverrides.value)
}

function exportGlossaryOverrides(): string {
  return JSON.stringify(glossaryOverrides.value, null, 2)
}

function importGlossaryOverrides(json: string): boolean {
  try {
    const parsed = JSON.parse(json)
    if (!Array.isArray(parsed)) return false
    glossaryOverrides.value = parsed.filter(
      (r): r is GlossaryRule =>
        r && typeof r.match === 'string' && typeof r.spoken === 'string',
    )
    saveGlossaryOverrides(glossaryOverrides.value)
    return true
  } catch {
    return false
  }
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

export function skipSegmentListen(delta: number): void {
  skipSegment(delta)
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
  const defaultGlossary = computed(() => DEFAULT_GLOSSARY)

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
    destroyEngine()
  })

  watch(
    () => route.path,
    () => {
      stop()
      panelOpen.value = false
      panelMinimized.value = false
      segments.value = []
    },
  )

  watch(isFocusMode, () => {
    if (!lastWordHighlight) return
    const el = document.querySelector(
      `[data-dsa-block="${escapeAttr(lastWordHighlight.blockId)}"]`,
    )
    if (el instanceof HTMLElement) {
      setLinePointer(el, lastWordHighlight.displayWordIndex)
    }
  })

  void refreshModelCached()
  void refreshCloudConfigured()

  return {
    status,
    rate,
    progress,
    elapsedMs,
    totalMs,
    currentLabel,
    panelOpen,
    panelMinimized,
    isSupported,
    cloudConfigured,
    piperVoices,
    piperVoiceId,
    ttsEngine,
    modelLoading,
    modelProgress,
    modelCached,
    glossaryOverrides,
    defaultGlossary,
    play: () => play(pageTitle.value),
    pause,
    resume,
    stop,
    skip,
    skipSegment,
    setRate,
    setPiperVoice,
    setTtsEngine,
    addGlossaryOverride,
    removeGlossaryOverride,
    exportGlossaryOverrides,
    importGlossaryOverrides,
    refreshCloudConfigured,
    reloadCloudVoice,
    minimizePanel,
    expandPanel,
    toggle: () => toggle(pageTitle.value),
    openPanel: () => {
      panelOpen.value = true
      panelMinimized.value = false
    },
  }
}