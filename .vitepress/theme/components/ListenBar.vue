<script setup>
import { computed } from 'vue'
import { useHandbookTts } from '../composables/useHandbookTts'
import { useCoarsePointer } from '../composables/useCoarsePointer'
import { openTtsConfigModal } from '../composables/useTtsConfigModal'

const { isCoarsePointer } = useCoarsePointer()

const {
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
  play,
  pause,
  resume,
  stop,
  skip,
  skipSegment,
  setRate,
  setPiperVoice,
  setTtsEngine,
  openPanel,
  minimizePanel,
  expandPanel,
} = useHandbookTts()

const ratePresets = [0.85, 0.9, 0.95, 1, 1.1, 1.25, 1.5, 2]
const isPlaying = computed(() => status.value === 'playing')
const isPaused = computed(() => status.value === 'paused')
const isSynthesizing = computed(() => status.value === 'synthesizing')
const isActive = computed(() => isPlaying.value || isPaused.value || isSynthesizing.value)
const isPiper = computed(() => ttsEngine.value === 'piper')
const isCloud = computed(() => ttsEngine.value === 'cloud')

const statusLabel = computed(() => {
  if (modelLoading.value && isPiper.value) return 'Downloading voice…'
  if (isSynthesizing.value && isCloud.value) return 'Buffering audio…'
  if (isSynthesizing.value) return 'Preparing speech…'
  if (isPlaying.value) return 'Playing'
  if (isPaused.value) return 'Paused'
  return 'Ready'
})

function formatTime(ms) {
  const sec = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function onPlay() {
  if (isPaused.value) resume()
  else play()
}

function onClose() {
  stop()
  panelOpen.value = false
  panelMinimized.value = false
}
</script>

<template>
  <div
    v-if="isSupported"
    class="listen-bar-root"
    :class="{
      expanded: panelOpen && !panelMinimized,
      minimized: panelOpen && panelMinimized,
      playing: isPlaying,
      synthesizing: isSynthesizing,
    }"
  >
    <button
      v-if="!panelOpen"
      type="button"
      class="listen-fab"
      aria-label="Open listen mode"
      :title="isCoarsePointer ? 'Listen to handbook' : 'Listen to handbook (Shift+R)'"
      @click="openPanel()"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
        <path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.06c1.48-.74 2.5-2.26 2.5-4.03zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
      </svg>
      <span class="listen-fab-label">Listen</span>
    </button>

    <section
      v-else-if="panelMinimized"
      class="listen-mini"
      role="region"
      aria-label="Listen controls"
    >
      <button
        v-if="!isPlaying"
        type="button"
        class="listen-mini-play"
        aria-label="Play"
        :disabled="(isPiper && modelLoading) || (isSynthesizing && !isPaused)"
        @click="onPlay"
      >
        <span aria-hidden="true">▶</span>
      </button>
      <button
        v-else
        type="button"
        class="listen-mini-play is-pause"
        aria-label="Pause"
        @click="pause"
      >
        <span aria-hidden="true">❚❚</span>
      </button>

      <div class="listen-mini-meta">
        <span class="listen-mini-status" :class="{ loading: isSynthesizing }">{{ statusLabel }}</span>
        <div v-if="isActive" class="listen-mini-progress">
          <div class="listen-mini-progress-fill" :style="{ width: progress + '%' }" />
        </div>
        <span v-if="isActive" class="listen-mini-time">{{ formatTime(elapsedMs) }}</span>
      </div>

      <div class="listen-mini-actions">
        <button type="button" class="listen-mini-btn" title="Previous paragraph" :disabled="!isActive" @click="skipSegment(-1)">¶−</button>
        <button type="button" class="listen-mini-btn" title="-10s" :disabled="!isActive" @click="skip(-10000)">−10s</button>
        <button type="button" class="listen-mini-btn" title="+10s" :disabled="!isActive" @click="skip(10000)">+10s</button>
        <button type="button" class="listen-mini-btn" title="Next paragraph" :disabled="!isActive" @click="skipSegment(1)">¶+</button>
        <button type="button" class="listen-mini-btn" aria-label="Expand listen panel" title="Expand" @click="expandPanel()">▢</button>
        <button type="button" class="listen-mini-btn" aria-label="Stop and close" title="Close" @click="onClose">✕</button>
      </div>
    </section>

    <section
      v-else
      class="listen-panel"
      role="region"
      aria-label="Listen to handbook"
    >
      <header class="listen-header">
        <div class="listen-title-wrap">
          <span class="listen-title">Listen</span>
          <span class="listen-status" :class="{ loading: isSynthesizing }">{{ statusLabel }}</span>
        </div>
        <div class="listen-header-actions">
          <button type="button" class="listen-icon-btn listen-config-btn" aria-label="Configure listen settings" title="Settings" @click="openTtsConfigModal()">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h10M4 17h13"/>
            </svg>
          </button>
          <button type="button" class="listen-icon-btn" aria-label="Minimize listen panel" title="Minimize" @click="minimizePanel()">−</button>
          <button type="button" class="listen-icon-btn" aria-label="Close listen mode" @click="onClose">✕</button>
        </div>
      </header>

      <div
        v-if="modelLoading"
        class="listen-model-progress"
        role="progressbar"
        :aria-valuenow="modelProgress"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div class="listen-model-progress-fill" :style="{ width: modelProgress + '%' }" />
        <span class="listen-model-progress-label">Downloading natural voice… {{ modelProgress }}%</span>
      </div>

      <div v-if="isSynthesizing && isCloud" class="listen-cloud-loading">
        <span class="listen-cloud-spinner" aria-hidden="true" />
        <span>Fetching audio from Cloud AI…</span>
      </div>

      <p v-if="currentLabel && isActive" class="listen-preview">{{ currentLabel }}</p>

      <div
        v-if="isActive"
        class="listen-progress"
        role="progressbar"
        :aria-valuenow="Math.round(progress)"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div class="listen-progress-fill" :style="{ width: progress + '%' }" />
      </div>
      <div v-if="isActive" class="listen-time">{{ formatTime(elapsedMs) }} / {{ formatTime(totalMs) }}</div>

      <div class="listen-paragraph-controls">
        <button type="button" class="listen-icon-btn listen-para-btn" aria-label="Previous paragraph" title="Previous paragraph" :disabled="!isActive" @click="skipSegment(-1)">
          <span class="skip-label">¶−</span>
        </button>
        <button type="button" class="listen-icon-btn listen-para-btn" aria-label="Next paragraph" title="Next paragraph" :disabled="!isActive" @click="skipSegment(1)">
          <span class="skip-label">¶+</span>
        </button>
      </div>

      <div class="listen-controls">
        <button type="button" class="listen-icon-btn" aria-label="Back 10 seconds" title="-10s" :disabled="!isActive" @click="skip(-10000)">
          <span class="skip-label">−10s</span>
        </button>

        <button v-if="!isPlaying" type="button" class="listen-play-btn" aria-label="Play" :disabled="(isPiper && modelLoading) || (isSynthesizing && !isPaused)" @click="onPlay">
          <span aria-hidden="true">▶</span>
        </button>
        <button v-else type="button" class="listen-play-btn is-pause" aria-label="Pause" @click="pause">
          <span aria-hidden="true">❚❚</span>
        </button>

        <button type="button" class="listen-icon-btn" aria-label="Forward 10 seconds" title="+10s" :disabled="!isActive" @click="skip(10000)">
          <span class="skip-label">+10s</span>
        </button>
      </div>

      <label class="listen-voice">
        <span class="listen-voice-label">Engine</span>
        <select class="listen-voice-select" :value="ttsEngine" @change="setTtsEngine($event.target.value)">
          <option value="piper">Offline (Piper)</option>
          <option value="cloud" :disabled="!cloudConfigured">Cloud AI</option>
        </select>
      </label>

      <div class="listen-speed">
        <span class="listen-speed-label">Speed</span>
        <div class="listen-speed-row">
          <button type="button" class="speed-chip" :class="{ active: rate === 0.9 }" @click="setRate(0.9)">Technical 0.9×</button>
          <button v-for="preset in ratePresets" :key="preset" type="button" class="speed-chip" :class="{ active: rate === preset }" @click="setRate(preset)">{{ preset }}×</button>
        </div>
      </div>

      <label v-if="isPiper" class="listen-voice">
        <span class="listen-voice-label">Piper voice</span>
        <select class="listen-voice-select" :value="piperVoiceId" @change="setPiperVoice($event.target.value)">
          <option v-for="v in piperVoices" :key="v.id" :value="v.id">{{ v.label }}</option>
        </select>
      </label>

      <p v-if="isPiper && modelCached" class="listen-hint">Voice ready offline.</p>
      <p v-else-if="isPiper" class="listen-hint">First play downloads voice (~25MB once).</p>
      <p v-else-if="!cloudConfigured" class="listen-hint">Configure Cloud AI (settings) to use online voices.</p>
      <p class="listen-hint">Reads handbook text only — skips quizzes, nav, and code blocks.</p>
    </section>
  </div>
</template>

<style scoped>
.listen-bar-root {
  position: fixed;
  bottom: calc(24px + var(--dsa-safe-bottom, 0px));
  right: 24px;
  left: auto;
  z-index: 112;
  width: max-content;
  max-width: min(360px, calc(100vw - 96px));
}

.listen-fab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 9999px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-1);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  transition: transform 0.15s, border-color 0.15s;
}

.listen-fab:hover {
  transform: scale(1.03);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.listen-panel,
.listen-mini {
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: color-mix(in srgb, var(--vp-c-bg-elv) 96%, transparent);
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.22);
}

.listen-panel {
  width: min(360px, calc(100vw - 48px));
  padding: 12px 14px;
}

.listen-mini {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  width: min(420px, calc(100vw - 32px));
}

.listen-mini-play {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  flex-shrink: 0;
}

.listen-mini-play.is-pause {
  background: color-mix(in srgb, var(--vp-c-brand-1) 82%, var(--vp-c-bg));
  border: 1px solid var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.listen-mini-play:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.listen-mini-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.listen-mini-status {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--vp-c-brand-1);
}

.listen-mini-status.loading {
  animation: listen-pulse 1.2s ease-in-out infinite;
}

.listen-mini-progress {
  height: 3px;
  border-radius: 9999px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
}

.listen-mini-progress-fill {
  height: 100%;
  background: var(--vp-c-brand-1);
  transition: width 0.2s ease-out;
}

.listen-mini-time {
  font-size: 10px;
  color: var(--vp-c-text-3);
}

.listen-mini-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.listen-mini-btn {
  min-width: 32px;
  height: 30px;
  padding: 0 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  border-radius: 6px;
  cursor: pointer;
  font-size: 10px;
  font-weight: 600;
}

.listen-mini-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.listen-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.listen-header-actions {
  display: flex;
  gap: 4px;
}

.listen-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.listen-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.listen-status {
  font-size: 11px;
  color: var(--vp-c-brand-1);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.listen-status.loading {
  animation: listen-pulse 1.2s ease-in-out infinite;
}

@keyframes listen-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}

.listen-cloud-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  font-size: 11px;
  color: var(--vp-c-text-2);
}

.listen-cloud-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--vp-c-divider);
  border-top-color: var(--vp-c-brand-1);
  border-radius: 50%;
  animation: listen-spin 0.8s linear infinite;
  flex-shrink: 0;
}

@keyframes listen-spin {
  to { transform: rotate(360deg); }
}

.listen-model-progress {
  position: relative;
  height: 28px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  margin-bottom: 8px;
}

.listen-model-progress-fill {
  height: 100%;
  background: color-mix(in srgb, var(--vp-c-brand-1) 35%, var(--vp-c-bg));
  transition: width 0.2s ease-out;
}

.listen-model-progress-label {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: var(--vp-c-text-2);
}

.listen-preview {
  margin: 0 0 8px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--vp-c-text-2);
  font-style: italic;
}

.listen-progress {
  height: 4px;
  border-radius: 9999px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
}

.listen-progress-fill {
  height: 100%;
  background: var(--vp-c-brand-1);
  transition: width 0.2s ease-out;
}

.listen-time {
  margin: 4px 0 10px;
  font-size: 11px;
  color: var(--vp-c-text-3);
  text-align: right;
}

.listen-paragraph-controls {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.listen-para-btn {
  min-width: 52px;
}

.listen-config-btn {
  min-width: 36px;
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.listen-config-btn svg {
  opacity: 0.72;
}

.listen-config-btn:hover svg {
  opacity: 1;
  color: var(--vp-c-brand-1);
}

.listen-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

.listen-play-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.listen-play-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.listen-play-btn.is-pause {
  background: color-mix(in srgb, var(--vp-c-brand-1) 82%, var(--vp-c-bg));
  border: 1px solid var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.listen-icon-btn {
  min-width: 44px;
  min-height: 36px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
}

.listen-icon-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.skip-label {
  font-size: 11px;
  font-weight: 600;
}

.listen-speed-label,
.listen-voice-label {
  display: block;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vp-c-text-3);
  margin-bottom: 6px;
}

.listen-speed-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.speed-chip {
  padding: 4px 8px;
  border-radius: 9999px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 11px;
  cursor: pointer;
}

.speed-chip.active {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, var(--vp-c-bg));
}

.listen-voice-select {
  width: 100%;
  margin-bottom: 8px;
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 12px;
}

.listen-hint {
  margin: 0;
  font-size: 10px;
  line-height: 1.45;
  color: var(--vp-c-text-3);
}

.listen-hint + .listen-hint {
  margin-top: 4px;
}

@media (max-width: 640px) {
  .listen-bar-root:not(.expanded):not(.minimized) {
    right: 16px;
    bottom: calc(16px + var(--dsa-safe-bottom, 0px));
  }

  .listen-bar-root.expanded,
  .listen-bar-root.minimized {
    right: 16px;
    left: 16px;
    bottom: calc(16px + var(--dsa-safe-bottom, 0px));
    width: auto;
    max-width: none;
  }

  .listen-panel,
  .listen-mini {
    width: 100%;
  }

  .listen-fab-label {
    display: none;
  }

  .listen-fab {
    width: 44px;
    height: 44px;
    padding: 0;
    justify-content: center;
  }

  .listen-mini-actions {
    flex-wrap: wrap;
    max-width: 140px;
  }
}
</style>