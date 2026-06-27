<script setup>
import { ref, watch, nextTick, computed } from 'vue'

const props = defineProps({
  note: { type: Object, required: true },
  placement: { type: Object, required: true },
  active: { type: Boolean, default: false },
  highlightColor: { type: String, default: null },
  editing: { type: Boolean, default: false },
  dragStyle: { type: Object, default: null },
  dragging: { type: Boolean, default: false },
})

const emit = defineEmits([
  'focus',
  'delete',
  'save',
  'color-change',
  'start-edit',
  'cancel-edit',
  'reset-position',
  'drag-pointerdown',
  'drag-pointermove',
  'drag-pointerup',
])

const TYPE_LABELS = {
  highlight: 'Highlight',
  heading: 'Section',
  free: 'Page',
}

const colors = [
  { id: 'yellow', label: 'Yellow' },
  { id: 'green', label: 'Green' },
  { id: 'blue', label: 'Blue' },
  { id: 'pink', label: 'Pink' },
]

const editTitle = ref('')
const editBody = ref('')
const bodyRef = ref(null)

const cardStyle = computed(() => {
  if (props.dragStyle) return props.dragStyle
  return {
    top: props.placement.top + 'px',
    left: props.placement.left + 'px',
    width: props.placement.width + 'px',
  }
})

watch(
  () => props.editing,
  isEditing => {
    if (isEditing) {
      editTitle.value = props.note.title || ''
      editBody.value = props.note.body || ''
      nextTick(() => {
        bodyRef.value?.focus()
        autoResize()
      })
    }
  },
  { immediate: true },
)

function autoResize() {
  const el = bodyRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

function onBodyInput() {
  autoResize()
}

function onCardClick() {
  if (props.editing || props.dragging) return
  emit('focus', props.note)
}

function onCardDblClick(e) {
  if (e.target.closest('.margin-note-drag-handle, .margin-note-delete, .margin-note-edit-toolbar')) return
  emit('start-edit', props.note.id)
}

function saveEdit() {
  emit('save', {
    id: props.note.id,
    body: editBody.value,
    title: editTitle.value,
  })
}

function cancelEdit() {
  emit('cancel-edit', props.note.id)
}

function onEditKeydown(e) {
  if (e.key === 'Escape') {
    e.preventDefault()
    cancelEdit()
  }
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    saveEdit()
  }
}

function onBlur(e) {
  if (!props.editing) return
  const related = e.relatedTarget
  if (related instanceof Element && e.currentTarget.contains(related)) return
  saveEdit()
}
</script>

<template>
  <article
    class="margin-note-card"
    :class="{ active, [placement.side]: true, editing, dragging }"
    :style="cardStyle"
    @click="onCardClick"
    @dblclick="onCardDblClick"
  >
    <button
      type="button"
      class="margin-note-drag-handle"
      aria-label="Drag to reposition note"
      title="Drag to reposition"
      @pointerdown.stop="emit('drag-pointerdown', $event)"
      @pointermove.stop="emit('drag-pointermove', $event)"
      @pointerup.stop="emit('drag-pointerup', $event)"
      @pointercancel.stop="emit('drag-pointerup', $event)"
      @dblclick.stop
    >
      <span class="drag-grip" aria-hidden="true">⠿</span>
    </button>

    <div class="margin-note-content">
      <template v-if="!editing">
        <span class="margin-note-type">{{ TYPE_LABELS[note.anchorType] || 'Note' }}</span>
        <span v-if="note.title" class="margin-note-title">{{ note.title }}</span>
        <p class="margin-note-body">{{ note.body }}</p>
      </template>

      <template v-else>
        <span class="margin-note-type">{{ TYPE_LABELS[note.anchorType] || 'Note' }}</span>
        <input
          v-if="note.anchorType !== 'highlight'"
          v-model="editTitle"
          class="margin-note-title-input"
          placeholder="Title"
          @keydown="onEditKeydown"
        />
        <textarea
          ref="bodyRef"
          v-model="editBody"
          class="margin-note-body-input"
          placeholder="Write your note…"
          rows="3"
          @input="onBodyInput"
          @keydown="onEditKeydown"
          @blur="onBlur"
        />
        <div v-if="note.anchorType === 'highlight'" class="margin-note-edit-toolbar">
          <span class="toolbar-colors-label">Highlight</span>
          <div class="toolbar-color-row">
            <button
              v-for="c in colors"
              :key="c.id"
              type="button"
              class="color-btn"
              :class="[c.id, { active: highlightColor === c.id }]"
              :aria-label="`Change to ${c.label}`"
              :title="c.label"
              :aria-pressed="highlightColor === c.id"
              @click.stop="emit('color-change', c.id)"
            />
          </div>
        </div>
        <div class="margin-note-edit-actions">
          <button
            v-if="note.marginLayout"
            type="button"
            class="edit-action-btn"
            @click.stop="emit('reset-position', note.id)"
          >
            Reset position
          </button>
          <button type="button" class="edit-action-btn primary" @click.stop="saveEdit">Save</button>
          <button type="button" class="edit-action-btn" @click.stop="cancelEdit">Cancel</button>
        </div>
        <p class="margin-note-edit-hint">Ctrl+Enter to save · Esc to cancel</p>
      </template>
    </div>

    <button
      type="button"
      class="margin-note-delete"
      aria-label="Delete note"
      @click.stop="emit('delete', note.id)"
    >✕</button>
  </article>
</template>

<style scoped>
.margin-note-card {
  position: fixed;
  z-index: 108;
  display: flex;
  gap: 0;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: color-mix(in srgb, var(--vp-c-bg-elv) 94%, transparent);
  backdrop-filter: blur(10px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.14);
  transition: border-color 0.15s, box-shadow 0.15s;
  pointer-events: auto;
  will-change: top, left;
}

.margin-note-card.dragging {
  transition: none;
  opacity: 0.92;
  z-index: 110;
}

.margin-note-card.active {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--vp-c-brand-1) 40%, transparent),
    0 8px 24px rgba(99, 102, 241, 0.18);
}

.margin-note-card.editing {
  border-color: var(--vp-c-brand-1);
}

.margin-note-drag-handle {
  flex-shrink: 0;
  width: 22px;
  border: none;
  border-radius: 10px 0 0 10px;
  background: color-mix(in srgb, var(--vp-c-bg-soft) 80%, transparent);
  color: var(--vp-c-text-3);
  cursor: grab;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.margin-note-drag-handle:active {
  cursor: grabbing;
}

.drag-grip {
  font-size: 14px;
  line-height: 1;
  letter-spacing: -2px;
}

.margin-note-content {
  flex: 1;
  min-width: 0;
  padding: 8px 10px;
  text-align: left;
  cursor: pointer;
}

.margin-note-card.editing .margin-note-content {
  cursor: text;
}

.margin-note-type {
  display: block;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  margin-bottom: 3px;
}

.margin-note-title {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.margin-note-body {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  color: var(--vp-c-text-2);
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: pre-wrap;
}

.margin-note-title-input,
.margin-note-body-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: inherit;
  font-size: 12px;
  line-height: 1.4;
  padding: 6px 8px;
  margin-bottom: 6px;
}

.margin-note-title-input:focus,
.margin-note-body-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
}

.margin-note-body-input {
  resize: none;
  min-height: 60px;
}

.margin-note-edit-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.toolbar-colors-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  color: var(--vp-c-text-3);
}

.toolbar-color-row {
  display: flex;
  gap: 5px;
}

.color-btn {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
}

.color-btn.active {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 1px var(--vp-c-brand-1);
}

.color-btn.yellow { background: #fef08a; }
.color-btn.green { background: #bbf7d0; }
.color-btn.blue { background: #bfdbfe; }
.color-btn.pink { background: #fbcfe8; }

.margin-note-edit-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.edit-action-btn {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
}

.edit-action-btn.primary {
  background: var(--vp-c-brand-1);
  color: #fff;
  border-color: var(--vp-c-brand-1);
}

.margin-note-edit-hint {
  margin: 4px 0 0;
  font-size: 10px;
  color: var(--vp-c-text-3);
}

.margin-note-delete {
  background: none;
  border: none;
  color: var(--vp-c-text-3);
  cursor: pointer;
  padding: 6px 6px 0 0;
  font-size: 11px;
  line-height: 1;
}
</style>