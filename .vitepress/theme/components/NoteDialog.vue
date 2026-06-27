<script setup>
import { useNoteDialog } from '../composables/useNoteDialog'

const { visible, title, placeholder, body, confirmNoteDialog, cancelNoteDialog } = useNoteDialog()

function onKeydown(e) {
  if (e.key === 'Escape') cancelNoteDialog()
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    confirmNoteDialog()
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="note-dialog-backdrop" @mousedown.self="cancelNoteDialog">
      <div class="note-dialog" role="dialog" aria-modal="true" :aria-label="title">
        <h3 class="note-dialog-title">{{ title }}</h3>
        <textarea
          id="dsa-note-dialog-input"
          v-model="body"
          class="note-dialog-input"
          :placeholder="placeholder"
          rows="5"
          @keydown="onKeydown"
        />
        <div class="note-dialog-actions">
          <button type="button" class="btn-cancel" @click="cancelNoteDialog">Cancel</button>
          <button type="button" class="btn-save" @click="confirmNoteDialog">Save note</button>
        </div>
        <p class="note-dialog-hint">Ctrl+Enter to save</p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.note-dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 410;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.note-dialog {
  width: min(440px, 100%);
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}

.note-dialog-title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.note-dialog-input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  min-height: 110px;
}

.note-dialog-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.note-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 14px;
}

.btn-cancel,
.btn-save {
  padding: 7px 14px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid var(--vp-c-divider);
}

.btn-cancel {
  background: transparent;
  color: var(--vp-c-text-2);
}

.btn-save {
  background: var(--vp-c-brand-1);
  color: #fff;
  border-color: var(--vp-c-brand-1);
}

.note-dialog-hint {
  margin: 8px 0 0;
  font-size: 11px;
  color: var(--vp-c-text-3);
  text-align: right;
}
</style>