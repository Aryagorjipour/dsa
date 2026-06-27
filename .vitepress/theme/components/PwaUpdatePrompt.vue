<script setup>
import { useServiceWorker } from '../composables/useServiceWorker'

const { needRefresh, offlineReady, updateServiceWorker } = useServiceWorker()

function applyUpdate() {
  updateServiceWorker(true)
}

function dismissUpdate() {
  needRefresh.value = false
}
</script>

<template>
  <div v-if="needRefresh" class="pwa-update-prompt" role="alert">
    <span class="pwa-update-text">A new handbook version is available.</span>
    <div class="pwa-update-actions">
      <button class="pwa-update-btn primary" @click="applyUpdate">Refresh</button>
      <button class="pwa-update-btn" @click="dismissUpdate">Later</button>
    </div>
  </div>
  <span v-else-if="offlineReady" class="sr-only">Offline cache ready</span>
</template>

<style scoped>
.pwa-update-prompt {
  position: fixed;
  bottom: calc(24px + var(--dsa-safe-bottom, 0px));
  left: 50%;
  transform: translateX(-50%);
  z-index: 250;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  padding: 10px 16px;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  max-width: calc(100vw - 32px);
}

.pwa-update-text {
  font-size: 13px;
  color: var(--vp-c-text-1);
}

.pwa-update-actions {
  display: flex;
  gap: 8px;
}

.pwa-update-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  font-size: 12px;
  cursor: pointer;
  min-height: 36px;
}

.pwa-update-btn.primary {
  background: var(--vp-c-brand-1);
  color: #fff;
  border-color: var(--vp-c-brand-1);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

@media (max-width: 640px) {
  .pwa-update-prompt {
    bottom: calc(16px + var(--dsa-safe-bottom, 0px));
    flex-direction: column;
    align-items: stretch;
  }

  .pwa-update-actions {
    width: 100%;
  }

  .pwa-update-btn {
    flex: 1;
  }
}
</style>