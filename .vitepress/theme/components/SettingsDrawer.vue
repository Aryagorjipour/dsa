<script setup>
import { ref } from 'vue'
import { exportUserData, importUserData, clearAllUserData } from '../composables/useStorage'
import { showToast } from '../composables/useToast'
import { loadAnnotations } from '../composables/useAnnotations'
import { scheduleAnnotationRestore } from '../utils/annotationLifecycle'
import InstallAppPrompt from './InstallAppPrompt.vue'
import { useServiceWorker } from '../composables/useServiceWorker'
import { useCoarsePointer } from '../composables/useCoarsePointer'

const open = ref(false)
const { offlineReady } = useServiceWorker()
const { isCoarsePointer } = useCoarsePointer()
const fileInput = ref(null)

async function handleExport() {
  const data = await exportUserData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dsa-handbook-data-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  showToast('Data exported successfully')
}

function handleImportClick() {
  fileInput.value?.click()
}

async function handleImport(e) {
  const file = e.target.files?.[0]
  if (!file) return
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    const mode = confirm('Merge with existing data? (Cancel = replace all)') ? 'merge' : 'replace'
    await importUserData(data, mode)
    await loadAnnotations()
    scheduleAnnotationRestore()
    showToast('Data imported successfully')
  } catch {
    showToast('Import failed — invalid file format')
  }
  e.target.value = ''
  open.value = false
}

async function checkForUpdates() {
  if (!('serviceWorker' in navigator)) {
    showToast('Service workers not supported in this browser')
    return
  }
  const reg = await navigator.serviceWorker.getRegistration()
  if (!reg) {
    showToast('No service worker registered yet — visit again after the page loads')
    return
  }
  await reg.update()
  showToast('Checking for updates…')
}

async function handleClear() {
  if (!confirm('Delete all notes, highlights, quiz progress, and playground data? This cannot be undone.')) return
  await clearAllUserData()
  await loadAnnotations()
  showToast('All personal data cleared')
  open.value = false
}
</script>

<template>
  <div class="settings-drawer">
    <button
      class="settings-btn"
      :aria-expanded="open"
      aria-label="Personal data settings"
      title="Export / import notes & highlights"
      @click="open = !open"
    >
      <svg class="settings-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none">
        <path d="M4 7h10" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
        <circle cx="17" cy="7" r="2" stroke="currentColor" stroke-width="1.75" />
        <path d="M4 12h14" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
        <circle cx="20" cy="12" r="2" stroke="currentColor" stroke-width="1.75" />
        <path d="M4 17h7" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
        <circle cx="13" cy="17" r="2" stroke="currentColor" stroke-width="1.75" />
      </svg>
    </button>

    <div v-if="open" class="settings-panel" role="dialog" aria-label="Data settings">
      <h4>Personal Data</h4>
      <p class="hint">All data stays in your browser.</p>
      <button class="panel-btn" @click="handleExport">Export JSON</button>
      <button class="panel-btn" @click="handleImportClick">Import JSON</button>
      <button class="panel-btn danger" @click="handleClear">Clear all data</button>
      <input ref="fileInput" type="file" accept=".json" hidden @change="handleImport" />

      <h4 class="section-title">Offline &amp; App</h4>
      <p v-if="offlineReady" class="hint cache-status">Handbook content cached for offline reading.</p>
      <InstallAppPrompt />
      <button class="panel-btn" @click="checkForUpdates">Check for updates</button>

      <p v-if="!isCoarsePointer" class="shortcut-hint">Press <kbd>Shift+?</kbd> for keyboard shortcuts</p>
    </div>
  </div>
</template>

<style scoped>
.settings-drawer {
  position: relative;
  display: inline-flex;
  max-width: 100%;
}

.settings-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--vp-c-text-2);
  padding: 4px 8px;
  line-height: 1;
  flex-shrink: 0;
}

.settings-btn:hover {
  color: var(--vp-c-brand-1);
}

.settings-icon {
  width: 20px;
  height: 20px;
  display: block;
}

.settings-panel {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  width: min(280px, calc(100vw - 24px));
  max-width: min(280px, calc(100vw - 24px));
  max-height: calc(100vh - 80px);
  overflow-x: hidden;
  overflow-y: auto;
  padding: 12px;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 200;
  box-sizing: border-box;
}

.settings-panel h4 {
  margin: 0 0 4px;
  font-size: 14px;
}

.hint {
  font-size: 11px;
  color: var(--vp-c-text-3);
  margin: 0 0 10px;
  overflow-wrap: break-word;
  word-break: break-word;
}

.section-title {
  margin: 12px 0 4px;
  padding-top: 10px;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 13px;
}

.cache-status {
  color: #22c55e;
}

.panel-btn {
  display: block;
  width: 100%;
  max-width: 100%;
  padding: 6px 10px;
  margin-bottom: 4px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  text-align: left;
  box-sizing: border-box;
  white-space: normal;
}

.panel-btn:hover {
  border-color: var(--vp-c-brand-1);
}

.panel-btn.danger {
  color: #ef4444;
  border-color: #fca5a5;
}

.shortcut-hint {
  margin: 10px 0 0;
  padding-top: 8px;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 11px;
  color: var(--vp-c-text-3);
  text-align: center;
}

.shortcut-hint kbd {
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 3px;
  border: 1px solid var(--vp-c-divider);
  font-family: inherit;
}

@media (max-width: 640px) {
  .settings-panel {
    position: fixed;
    top: calc(var(--vp-nav-height, 64px) + 8px);
    right: 12px;
    left: 12px;
    width: auto;
    max-width: none;
    margin-top: 0;
  }
}
</style>