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
  voiceOptions,
  selectedVoiceUri,
  play,
  pause,
  resume,
  stop,
  skip,
  setRate,
  setVoiceUri,
  toggle,
  openPanel,
} = useHandbookTts()

const expanded = computed({
  get: () => panelOpen.value,
  set: (v) => {
    panelOpen.value = v
  },
})

const ratePresets = [0.75, 1, 1.25, 1.5, 1.75, 2]

function formatTime(ms) {
  const sec = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function onPlayPause() {
  if (status.value === 'playing') pause()
  else if (status.value === 'paused') resume()
  else play()
}

function onClose() {
  stop()
  expanded.value = false
}
</script>

<template>
  <div v-if="isSupported" class="listen-bar-root" :class="{ expanded, playing: status === 'playing' }">
    <button
      v-if="!expanded"
      type="button"
      class="listen-fab"
      aria-label="Listen to this page"
      title="Listen to handbook (Shift+R)"
      @click="openPanel(); play()"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
        <path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.06c1.48-.74 2.5-2.26 2.5-4.03zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
      </svg>
      <span>Listen</span>
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
          <span class="listen-status">{{ status === 'playing' ? 'Playing' : status === 'paused' ? 'Paused' : 'Ready' }}</span>
        </div>
        <button type="button" class="listen-icon-btn" aria-label="Close listen mode" @click="onClose">✕</button>
      </header>

      <p v-if="currentLabel" class="listen-preview">{{ currentLabel }}</p>

      <div
        class="listen-progress"
        role="progressbar"
        :aria-valuenow="Math.round(progress)"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div class="listen-progress-fill" :style="{ width: progress + '%' }" />
      </div>
      <div class="listen-time">{{ formatTime(elapsedMs) }} / {{ formatTime(totalMs) }}</div>

      <div class="listen-controls">
        <button type="button" class="listen-icon-btn" aria-label="Back 10 seconds" title="-10s" @click="skip(-10000)">
          <span class="skip-label">−10s</span>
        </button>
        <button type="button" class="listen-play-btn" :aria-label="status === 'playing' ? 'Pause' : 'Play'" @click="onPlayPause">
          <span v-if="status === 'playing'" aria-hidden="true">❚❚</span>
          <span v-else aria-hidden="true">▶</span>
        </button>
        <button type="button" class="listen-icon-btn" aria-label="Forward 10 seconds" title="+10s" @click="skip(10000)">
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
        <input
          class="listen-rate-slider"
          type="range"
          min="0.5"
          max="2"
          step="0.05"
          :value="rate"
          aria-label="Playback speed"
          @input="setRate(parseFloat($event.target.value))"
        />
      </div>

      <label class="listen-voice">
        <span class="listen-voice-label">Voice</span>
        <select
          class="listen-voice-select"
          :value="selectedVoiceUri || ''"
          @change="setVoiceUri($event.target.value)"
        >
          <option value="">Browser default (English)</option>
          <option v-for="v in voiceOptions" :key="v.voiceURI" :value="v.voiceURI">
            {{ v.name }} ({{ v.lang }}){{ v.localService ? ' · offline' : '' }}
          </option>
        </select>
      </label>

      <p class="listen-hint">Reads handbook text only — skips quizzes, nav cards, and code blocks.</p>
    </section>
  </div>
</template>

<style scoped>
.listen-bar-root {
  position: fixed;
  bottom: calc(24px + var(--dsa-safe-bottom, 0px));
  right: 24px;
  z-index: 112;
  max-width: min(360px, calc(100vw - 32px));
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
  gap: 12px;
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
  margin-bottom: 6px;
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

.listen-rate-slider {
  width: 100%;
  margin-bottom: 10px;
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
  line-height: 1.4;
  color: var(--vp-c-text-3);
}

@media (max-width: 640px) {
  .listen-bar-root {
    right: 16px;
    bottom: calc(16px + var(--dsa-safe-bottom, 0px));
    left: 16px;
    max-width: none;
  }

  .listen-panel {
    padding: 10px 12px;
  }
}
</style>