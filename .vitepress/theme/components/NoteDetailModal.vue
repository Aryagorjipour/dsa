<script setup>
import { computed, nextTick } from 'vue'
import { useNoteDetailModal } from '../composables/useNoteDetailModal'
import { useAnnotations } from '../composables/useAnnotations'
import { openNoteDialog } from '../composables/useNoteDialog'
import { showToast } from '../composables/useToast'

const { visible, note, closeNoteDetailModal } = useNoteDetailModal()
const { highlights, updateNote, removeNote } = useAnnotations()

const TYPE_LABELS = {
  highlight: 'Highlight note',
  heading: 'Section note',
  free: 'Page note',
}

const typeLabel = computed(() => TYPE_LABELS[note.value?.anchorType] || 'Note')

const highlightColor = computed(() => {
  if (note.value?.anchorType !== 'highlight' || !note.value.anchorId) return null
  return highlights.value.find(h => h.id === note.value.anchorId)?.color ?? null
})

function onKeydown(e) {
  if (e.key === 'Escape') closeNoteDetailModal()
}

async function editNote() {
  const current = note.value
  if (!current) return

  const dialogTitle =
    current.anchorType === 'free'
      ? `Note for “${current.title || 'this page'}”`
      : current.anchorType === 'heading'
        ? `Note for “${current.title || 'this section'}”`
        : `Note on “${current.title || 'highlighted passage'}”`

  // Close detail view first so the edit dialog is not trapped underneath.
  closeNoteDetailModal()
  await nextTick()

  const body = await openNoteDialog({
    title: dialogTitle,
    placeholder: 'Write your note…',
    initial: current.body,
  })
  if (body === null) return

  const trimmed = body.trim()
  if (!trimmed) {
    await removeNote(current.id)
    showToast('Note removed')
    return
  }

  await updateNote(current.id, trimmed, current.title)
  showToast('Note updated')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible && note"
      class="note-detail-backdrop"
      @mousedown.self="closeNoteDetailModal"
    >
      <div
        class="note-detail-dialog"
        :class="[
          `note-detail-${note.anchorType}`,
          highlightColor ? `hl-${highlightColor}` : null,
        ]"
        role="dialog"
        aria-modal="true"
        :aria-label="typeLabel"
        @keydown="onKeydown"
      >
        <header class="note-detail-header">
          <span class="note-detail-type">{{ typeLabel }}</span>
          <button
            type="button"
            class="note-detail-close"
            aria-label="Close"
            @click="closeNoteDetailModal"
          >✕</button>
        </header>

        <h3 v-if="note.title" class="note-detail-title">{{ note.title }}</h3>

        <div class="note-detail-body-wrap">
          <p class="note-detail-body">{{ note.body }}</p>
        </div>

        <div class="note-detail-actions">
          <button type="button" class="btn-secondary" @click="closeNoteDetailModal">Close</button>
          <button type="button" class="btn-primary" @click="editNote">Edit note</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.note-detail-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.48);
  z-index: 405;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.note-detail-dialog {
  width: min(520px, 100%);
  max-height: min(80vh, 640px);
  display: flex;
  flex-direction: column;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.28);
}

.note-detail-dialog.note-detail-free {
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 55%, var(--vp-c-divider));
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--vp-c-brand-1) 25%, transparent),
    0 0 28px color-mix(in srgb, var(--vp-c-brand-1) 35%, transparent),
    0 16px 48px rgba(0, 0, 0, 0.28);
}

.note-detail-dialog.note-detail-heading {
  border-color: color-mix(in srgb, #34d399 50%, var(--vp-c-divider));
  box-shadow:
    0 0 0 1px color-mix(in srgb, #34d399 20%, transparent),
    0 16px 48px rgba(0, 0, 0, 0.28);
}

.note-detail-dialog.note-detail-highlight {
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 40%, var(--vp-c-divider));
}

.note-detail-dialog.note-detail-highlight.hl-yellow {
  border-color: color-mix(in srgb, #facc15 55%, var(--vp-c-divider));
  box-shadow: 0 0 0 1px color-mix(in srgb, #fef08a 30%, transparent), 0 16px 48px rgba(0, 0, 0, 0.28);
}

.note-detail-dialog.note-detail-highlight.hl-green {
  border-color: color-mix(in srgb, #4ade80 55%, var(--vp-c-divider));
  box-shadow: 0 0 0 1px color-mix(in srgb, #bbf7d0 30%, transparent), 0 16px 48px rgba(0, 0, 0, 0.28);
}

.note-detail-dialog.note-detail-highlight.hl-blue {
  border-color: color-mix(in srgb, #60a5fa 55%, var(--vp-c-divider));
  box-shadow: 0 0 0 1px color-mix(in srgb, #bfdbfe 30%, transparent), 0 16px 48px rgba(0, 0, 0, 0.28);
}

.note-detail-dialog.note-detail-highlight.hl-pink {
  border-color: color-mix(in srgb, #f472b6 55%, var(--vp-c-divider));
  box-shadow: 0 0 0 1px color-mix(in srgb, #fbcfe8 30%, transparent), 0 16px 48px rgba(0, 0, 0, 0.28);
}

.note-detail-highlight .note-detail-type {
  color: var(--vp-c-brand-1);
}

.note-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.note-detail-type {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
}

.note-detail-heading .note-detail-type {
  color: #10b981;
}

.note-detail-close {
  border: none;
  background: transparent;
  color: var(--vp-c-text-3);
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  line-height: 1;
}

.note-detail-title {
  margin: 0 0 12px;
  font-size: 17px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.35;
}

.note-detail-body-wrap {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
}

.note-detail-body {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: var(--vp-c-text-1);
  white-space: pre-wrap;
  word-break: break-word;
}

.note-detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-secondary,
.btn-primary {
  padding: 7px 14px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid var(--vp-c-divider);
}

.btn-secondary {
  background: transparent;
  color: var(--vp-c-text-2);
}

.btn-primary {
  background: var(--vp-c-brand-1);
  color: #fff;
  border-color: var(--vp-c-brand-1);
}
</style>