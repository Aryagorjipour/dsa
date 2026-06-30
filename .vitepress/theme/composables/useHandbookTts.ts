import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useData } from 'vitepress'
import { assignBlockIds } from '../utils/assignBlockIds'
import {
  extractReadingSegments,
  estimateSegmentMs,
  resolveSegmentAtTime,
  sliceTextAtOffset,
  totalEstimatedMs,
  type ReadingSegment,
} from '../utils/extractReadingSegments'
import {
  clearStoredVoiceUri,
  findVoiceByUri,
  HANDBOOK_TTS_LANG,
  listVoicesGrouped,
  loadStoredRate,
  loadStoredVoiceUri,
  pickBestVoice,
  primeSpeechSynthesis,
  readSpeechVoices,
  saveStoredRate,
  saveStoredVoiceUri,
  waitForVoices,
} from '../utils/ttsVoices'
import { useConnectivity } from './useConnectivity'
import { showToast } from './useToast'

export type TtsStatus = 'idle' | 'playing' | 'paused'

const SKIP_MS = 10_000

let voicesCache: SpeechSynthesisVoice[] = []
let voicesReady = false

function getSynth(): SpeechSynthesis | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
  return window.speechSynthesis
}

function refreshVoices(): SpeechSynthesisVoice[] {
  const synth = getSynth()
  if (!synth) return []
  const list = readSpeechVoices(synth)
  if (list.length) {
    voicesCache = list
    voicesReady = true
  }
  return voicesCache
}

const status = ref<TtsStatus>('idle')
const rate = ref(loadStoredRate())
const segments = ref<ReadingSegment[]>([])
const currentIndex = ref(0)
const currentOffsetMs = ref(0)
const elapsedMs = ref(0)
const activeBlockId = ref<string | null>(null)
const panelOpen = ref(false)
const selectedVoiceUri = ref<string | null>(loadStoredVoiceUri())
const voices = ref<SpeechSynthesisVoice[]>([])
const voicesLoading = ref(false)
const tickTimer = ref(0)
const segmentStartedAt = ref(0)

let utterance: SpeechSynthesisUtterance | null = null
let playingSession = 0
let speechStartWatchdog = 0
let voicesPrimed = false

function clearHighlight(): void {
  document.querySelectorAll('.dsa-tts-active').forEach(el => {
    el.classList.remove('dsa-tts-active')
  })
  activeBlockId.value = null
}

function escapeAttr(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value)
  }
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function highlightBlock(blockId: string): void {
  clearHighlight()
  const el = document.querySelector(`[data-dsa-block="${escapeAttr(blockId)}"]`)
  if (el instanceof HTMLElement) {
    el.classList.add('dsa-tts-active')
    activeBlockId.value = blockId
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }
}

function stopTick(): void {
  if (tickTimer.value) {
    window.clearInterval(tickTimer.value)
    tickTimer.value = 0
  }
}

function startTick(): void {
  stopTick()
  tickTimer.value = window.setInterval(() => {
    if (status.value !== 'playing' || !segmentStartedAt.value) return
    const seg = segments.value[currentIndex.value]
    if (!seg) return
    const played = performance.now() - segmentStartedAt.value
    const before = segments.value
      .slice(0, currentIndex.value)
      .reduce((sum, s) => sum + estimateSegmentMs(s.text, rate.value), 0)
    elapsedMs.value = Math.min(
      totalEstimatedMs(segments.value, rate.value),
      before + currentOffsetMs.value + played,
    )
    updateMediaSessionPosition()
  }, 250)
}

async function ensureVoicesLoaded(): Promise<SpeechSynthesisVoice[]> {
  const synth = getSynth()
  if (!synth) return []
  voicesLoading.value = true
  try {
    const list = await waitForVoices(synth)
    if (list.length) {
      voicesCache = list
      voicesReady = true
      voices.value = list
    }
    return list
  } finally {
    voicesLoading.value = false
  }
}

function primeVoicesOnce(): void {
  if (voicesPrimed) return
  voicesPrimed = true
  const synth = getSynth()
  if (!synth) return
  primeSpeechSynthesis(synth)
  void ensureVoicesLoaded()
}

function selectedVoice(list = voices.value.length ? voices.value : refreshVoices()): SpeechSynthesisVoice | null {
  const pref = selectedVoiceUri.value
  if (pref === '') return null

  const stored = findVoiceByUri(list, pref)
  if (pref && !stored && list.length) {
    selectedVoiceUri.value = null
    clearStoredVoiceUri()
  }
  if (pref) return stored ?? pickBestVoice(list, HANDBOOK_TTS_LANG)
  return pickBestVoice(list, HANDBOOK_TTS_LANG)
}

function ttsSetupHint(): string {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  const linux = /linux/i.test(ua)
  if (linux) {
    return 'Install speech-dispatcher and espeak-ng (pacman -S speech-dispatcher espeak-ng), start the speech-dispatcher service, then restart your browser.'
  }
  return 'Check system text-to-speech settings and restart the browser.'
}

function loadSegments(): boolean {
  assignBlockIds()
  const next = extractReadingSegments()
  segments.value = next
  return next.length > 0
}

function cancelSpeech(): void {
  const synth = getSynth()
  synth?.cancel()
  utterance = null
  if (speechStartWatchdog) {
    window.clearTimeout(speechStartWatchdog)
    speechStartWatchdog = 0
  }
}

function updateMediaSession(pageTitle: string): void {
  if (!('mediaSession' in navigator)) return
  const total = totalEstimatedMs(segments.value, rate.value)

  navigator.mediaSession.metadata = new MediaMetadata({
    title: pageTitle || 'DSA Handbook',
    artist: 'Listen mode',
    album: 'Handbook',
  })

  navigator.mediaSession.playbackState = status.value === 'playing' ? 'playing' : 'paused'

  if ('setPositionState' in navigator.mediaSession && total > 0) {
    try {
      navigator.mediaSession.setPositionState({
        duration: total / 1000,
        playbackRate: rate.value,
        position: Math.min(total / 1000, elapsedMs.value / 1000),
      })
    } catch {
      /* ignore unsupported position */
    }
  }
}

function updateMediaSessionPosition(): void {
  if (!('mediaSession' in navigator)) return
  const total = totalEstimatedMs(segments.value, rate.value)
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

function speakCurrent(pageTitle: string, session: number): void {
  const synth = getSynth()
  if (!synth || session !== playingSession) return

  const seg = segments.value[currentIndex.value]
  if (!seg) {
    stop()
    return
  }

  const text = sliceTextAtOffset(seg.text, currentOffsetMs.value, rate.value)
  if (!text) {
    currentIndex.value += 1
    currentOffsetMs.value = 0
    if (currentIndex.value >= segments.value.length) {
      stop()
      return
    }
    speakCurrent(pageTitle, session)
    return
  }

  highlightBlock(seg.blockId)

  const u = new SpeechSynthesisUtterance(text)
  const voice = selectedVoice()
  if (voice) u.voice = voice
  u.rate = rate.value
  u.pitch = 1
  u.lang = voice?.lang || HANDBOOK_TTS_LANG

  if (speechStartWatchdog) window.clearTimeout(speechStartWatchdog)

  u.onstart = () => {
    if (session !== playingSession) return
    if (speechStartWatchdog) {
      window.clearTimeout(speechStartWatchdog)
      speechStartWatchdog = 0
    }
    status.value = 'playing'
    segmentStartedAt.value = performance.now()
    startTick()
    updateMediaSession(pageTitle)
  }

  u.onend = () => {
    if (session !== playingSession) return
    currentIndex.value += 1
    currentOffsetMs.value = 0
    if (currentIndex.value >= segments.value.length) {
      stop()
      showToast('Finished reading this page')
      return
    }
    speakCurrent(pageTitle, session)
  }

  u.onerror = (event) => {
    if (session !== playingSession) return
    if (speechStartWatchdog) {
      window.clearTimeout(speechStartWatchdog)
      speechStartWatchdog = 0
    }
    const code = event.error
    if (code === 'synthesis-unavailable' || code === 'voice-unavailable' || code === 'language-unavailable') {
      showToast(`Speech unavailable — ${ttsSetupHint()}`)
      stop()
      return
    }
    if (currentIndex.value < segments.value.length - 1) {
      currentIndex.value += 1
      currentOffsetMs.value = 0
      speakCurrent(pageTitle, session)
      return
    }
    stop()
  }

  u.onboundary = (event) => {
    if (session !== playingSession || event.name !== 'word') return
    highlightBlock(seg.blockId)
  }

  utterance = u
  synth.speak(u)

  speechStartWatchdog = window.setTimeout(() => {
    if (session !== playingSession) return
    if (segmentStartedAt.value) return
    showToast(`Speech did not start — ${ttsSetupHint()}`)
    stop()
  }, 3000)
}

async function play(pageTitle: string): Promise<void> {
  const synth = getSynth()
  if (!synth) {
    showToast('Text-to-speech is not supported in this browser')
    return
  }

  if (!loadSegments()) {
    showToast('No readable content on this page')
    return
  }

  primeVoicesOnce()
  await ensureVoicesLoaded()

  playingSession += 1
  const session = playingSession
  cancelSpeech()
  status.value = 'playing'
  panelOpen.value = true
  bindMediaSessionHandlers(pageTitle)
  speakCurrent(pageTitle, session)
}

function pause(): void {
  const synth = getSynth()
  if (!synth || status.value !== 'playing') return

  if (synth.speaking && !synth.paused && 'pause' in synth) {
    synth.pause()
    status.value = 'paused'
    stopTick()
    updateMediaSession('')
    return
  }

  const played = segmentStartedAt.value ? performance.now() - segmentStartedAt.value : 0
  currentOffsetMs.value += played
  cancelSpeech()
  status.value = 'paused'
  stopTick()
}

async function resume(): Promise<void> {
  const synth = getSynth()
  if (!synth) return

  if (synth.paused && 'resume' in synth) {
    synth.resume()
    status.value = 'playing'
    segmentStartedAt.value = performance.now()
    startTick()
    return
  }

  if (status.value !== 'paused' || !segments.value.length) {
    await play('')
    return
  }

  playingSession += 1
  const session = playingSession
  cancelSpeech()
  status.value = 'playing'
  speakCurrent('', session)
}

function stop(): void {
  playingSession += 1
  cancelSpeech()
  stopTick()
  clearHighlight()
  status.value = 'idle'
  currentIndex.value = 0
  currentOffsetMs.value = 0
  elapsedMs.value = 0
  segmentStartedAt.value = 0
  clearMediaSession()
}

function skip(deltaMs: number): void {
  if (!segments.value.length && !loadSegments()) return

  const total = totalEstimatedMs(segments.value, rate.value)
  let target = elapsedMs.value + deltaMs
  target = Math.max(0, Math.min(total - 1, target))

  const resolved = resolveSegmentAtTime(segments.value, target, rate.value)
  currentIndex.value = resolved.index
  currentOffsetMs.value = resolved.offsetMs
  elapsedMs.value = target

  if (status.value === 'idle') {
    panelOpen.value = true
    return
  }

  playingSession += 1
  const session = playingSession
  cancelSpeech()

  if (status.value === 'paused') return

  status.value = 'playing'
  speakCurrent('', session)
}

function setRate(next: number): void {
  const clamped = Math.max(0.5, Math.min(2, next))
  rate.value = clamped
  saveStoredRate(clamped)

  if (status.value === 'playing') {
    const played = segmentStartedAt.value ? performance.now() - segmentStartedAt.value : 0
    currentOffsetMs.value += played
    playingSession += 1
    const session = playingSession
    cancelSpeech()
    speakCurrent('', session)
  }
}

function setVoiceUri(uri: string): void {
  if (!uri) {
    selectedVoiceUri.value = ''
    saveStoredVoiceUri('')
    return
  }
  selectedVoiceUri.value = uri
  saveStoredVoiceUri(uri)
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
  const { isOnline } = useConnectivity()

  const pageTitle = computed(() => page.value.title || 'Handbook')
  const totalMs = computed(() => totalEstimatedMs(segments.value, rate.value))
  const progress = computed(() => (totalMs.value ? (elapsedMs.value / totalMs.value) * 100 : 0))
  const isSupported = computed(() => typeof window !== 'undefined' && 'speechSynthesis' in window)
  const voiceOptions = computed(() => listVoicesGrouped(voices.value.length ? voices.value : refreshVoices()))

  const currentLabel = computed(() => {
    const seg = segments.value[currentIndex.value]
    if (!seg) return ''
    const preview = seg.text.slice(0, 48)
    return preview.length < seg.text.length ? `${preview}…` : preview
  })

  function onVoicesChanged() {
    voices.value = refreshVoices()
    if (selectedVoiceUri.value === null) {
      const best = pickBestVoice(voices.value)
      if (best) {
        selectedVoiceUri.value = best.voiceURI
        saveStoredVoiceUri(best.voiceURI)
      }
    }
  }

  onMounted(() => {
    if (!isSupported.value) return
    refreshVoices()
    voices.value = voicesCache
    onVoicesChanged()
    const synth = getSynth()
    synth?.addEventListener('voiceschanged', onVoicesChanged)
    primeVoicesOnce()
    document.addEventListener('pointerdown', primeVoicesOnce, { once: true, passive: true })
    document.addEventListener('keydown', primeVoicesOnce, { once: true, passive: true })
  })

  onUnmounted(() => {
    stop()
    getSynth()?.removeEventListener('voiceschanged', onVoicesChanged)
  })

  watch(
    () => route.path,
    () => {
      stop()
      panelOpen.value = false
      segments.value = []
    },
  )

  watch(isOnline, online => {
    if (!online && status.value === 'playing') {
      const voice = selectedVoice()
      if (voice && !voice.localService) {
        showToast('Voice needs internet — switch to an offline voice in Listen settings')
      }
    }
  })

  watch(rate, v => saveStoredRate(v))

  const hasVoices = computed(() => voiceOptions.value.length > 0)

  return {
    status,
    rate,
    progress,
    elapsedMs,
    totalMs,
    currentLabel,
    panelOpen,
    isSupported,
    voicesLoading,
    hasVoices,
    voiceOptions,
    selectedVoiceUri,
    play: () => play(pageTitle.value),
    pause,
    resume,
    stop,
    skip,
    setRate,
    setVoiceUri,
    toggle: () => toggle(pageTitle.value),
    openPanel: () => {
      panelOpen.value = true
    },
  }
}