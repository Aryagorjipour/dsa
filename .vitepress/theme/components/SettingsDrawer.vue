<script setup>
import { ref } from 'vue'
import { exportUserData, importUserData, clearAllUserData } from '../composables/useStorage'
import { showToast } from '../composables/useToast'
import { loadAnnotations } from '../composables/useAnnotations'
import { scheduleAnnotationRestore } from '../utils/annotationLifecycle'

const open = ref(false)
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
      aria-label="Personal data settings"
      title="Export / import notes & highlights"
      @click="open = !open"
    >
      ⚙
    </button>

    <div v-if="open" class="settings-panel" role="dialog" aria-label="Data settings">
      <h4>Personal Data</h4>
      <p class="hint">All data stays in your browser.</p>
      <button class="panel-btn" @click="handleExport">Export JSON</button>
      <button class="panel-btn" @click="handleImportClick">Import JSON</button>
      <button class="panel-btn danger" @click="handleClear">Clear all data</button>
      <input ref="fileInput" type="file" accept=".json" hidden @change="handleImport" />
      <p class="shortcut-hint">Press <kbd>Shift+?</kbd> for keyboard shortcuts</p>
    </div>
  </div>
</template>

<style scoped>
.settings-drawer {
  position: relative;
  display: inline-flex;
}

.settings-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: var(--vp-c-text-2);
  padding: 4px 8px;
  line-height: 1;
}

.settings-btn:hover {
  color: var(--vp-c-text-1);
}

.settings-panel {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  width: 220px;
  padding: 12px;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 200;
}

.settings-panel h4 {
  margin: 0 0 4px;
  font-size: 14px;
}

.hint {
  font-size: 11px;
  color: var(--vp-c-text-3);
  margin: 0 0 10px;
}

.panel-btn {
  display: block;
  width: 100%;
  padding: 6px 10px;
  margin-bottom: 4px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  text-align: left;
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
</style>