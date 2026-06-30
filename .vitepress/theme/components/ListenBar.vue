<script setup>
import { computed } from 'vue'
import { useHandbookTts } from '../composables/useHandbookTts'

const {
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
  play,
  pause,
  resume,
  stop,
  skip,
  setRate,
  setPiperVoice,
  openPanel,
} = useHandbookTts()

const expanded = computed({
  get: () => panelOpen.value,
  set: (v) => {
    panelOpen.value = v
  },
})

const ratePresets = [0.85, 0.9, 0.95, 1, 1.1, 1.25]
const isPlaying = computed(() => status.value === 'playing')
const isPaused = computed(() => status.value === 'paused')
const isActive = computed(() => isPlaying.value || isPaused.value)

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
  expanded.value = false
}
</script>

<template>
  <div
    v-if="isSupported"
    class="listen-bar-root"
    :class="{ expanded, playing: isPlaying }"
  >
    <button
      v-if="!expanded"
      type="button"
      class="listen-fab"
      aria-label="Open listen mode"
      title="Listen to handbook (Shift+R)"
      @click="openPanel()"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
        <path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.06c1.48-.74 2.5-2.26 2.5-4.03zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
      </svg>
      <span class="listen-fab-label">Listen</span>
    </button>

    <section
      v-else
      class="listen-panel"
      role="region"
      aria-label="Listen to handbook"
    >
      <header class="listen-header">
        <div class="listen-title-wrap">
          <span class="listen-title">Listen</span>
          <span class="listen-status">
            {{ modelLoading ? 'Downloading voice' : isPlaying ? 'Playing' : isPaused ? 'Paused' : 'Ready' }}
          </span>
        </div>
        <button type="button" class="listen-icon-btn" aria-label="Close listen mode" @click="onClose">✕</button>
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

      <div class="listen-controls">
        <button
          type="button"
          class="listen-icon-btn"
          aria-label="Back 10 seconds"
          title="-10s"
          :disabled="!isActive"
          @click="skip(-10000)"
        >
          <span class="skip-label">−10s</span>
        </button>

        <button
          v-if="!isPlaying"
          type="button"
          class="listen-play-btn"
          aria-label="Play"
          :disabled="modelLoading"
          @click="onPlay"
        >
          <span aria-hidden="true">▶</span>
        </button>
        <button
          v-else
          type="button"
          class="listen-play-btn is-pause"
          aria-label="Pause"
          @click="pause"
        >
          <span aria-hidden="true">❚❚</span>
        </button>

        <button
          type="button"
          class="listen-icon-btn"
          aria-label="Forward 10 seconds"
          title="+10s"
          :disabled="!isActive"
          @click="skip(10000)"
        >
          <span class="skip-label">+10s</span>
        </button>
      </div>

      <div class="listen-speed">
        <span class="listen-speed-label">Speed</span>
        <div class="listen-speed-row">
          <button
            v-for="preset in ratePresets"
            :key="preset"
            type="button"
            class="speed-chip"
            :class="{ active: rate === preset }"
            @click="setRate(preset)"
          >
            {{ preset }}×
          </button>
        </div>
      </div>

      <label class="listen-voice">
        <span class="listen-voice-label">Voice</span>
        <select
          class="listen-voice-select"
          :value="piperVoiceId"
          @change="setPiperVoice($event.target.value)"
        >
          <option v-for="v in piperVoices" :key="v.id" :value="v.id">
            {{ v.label }}
          </option>
        </select>
      </label>

      <p class="listen-hint">First use downloads ~25MB once, then works offline.</p>
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

.listen-panel {
  width: min(360px, calc(100vw - 48px));
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: color-mix(in srgb, var(--vp-c-bg-elv) 96%, transparent);
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.22);
}

.listen-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
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
  .listen-bar-root:not(.expanded) {
    right: 16px;
    left: auto;
    bottom: calc(16px + var(--dsa-safe-bottom, 0px));
    width: max-content;
    max-width: none;
  }

  .listen-bar-root.expanded {
    right: 16px;
    left: 16px;
    bottom: calc(16px + var(--dsa-safe-bottom, 0px));
    width: auto;
    max-width: none;
  }

  .listen-panel {
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
}
</style>