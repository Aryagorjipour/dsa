<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import { useAnnotations } from '../composables/useAnnotations'
import { openNoteDialog } from '../composables/useNoteDialog'
import { showToast } from '../composables/useToast'
import { assignBlockIds } from '../utils/assignBlockIds'
import { getSelectionAnchor, applyHighlightToDOM, removeHighlightFromDOM } from '../utils/highlightRestorer'

const route = useRoute()
const {
  addHighlight,
  addNote,
  updateNote,
  removeNote,
  removeHighlight,
  highlightsVisible,
  currentPagePath,
  pageNotes,
} = useAnnotations()

const visible = ref(false)
const mode = ref('select')
const x = ref(0)
const y = ref(0)
const activeHighlightId = ref(null)
const toolbarInteracting = ref(false)

const colors = [
  { id: 'yellow', label: 'Yellow' },
  { id: 'green', label: 'Green' },
  { id: 'blue', label: 'Blue' },
  { id: 'pink', label: 'Pink' },
]

function hide() {
  visible.value = false
  mode.value = 'select'
  activeHighlightId.value = null
}

function isIgnoredTarget(target) {
  if (!(target instanceof Element)) return false
  return !!target.closest(
    'input, textarea, select, [contenteditable="true"], .annotation-toolbar, .note-dialog, .note-dialog-backdrop, pre, code, .vp-code-group, .language-'
  )
}

function selectionInsideHighlight() {
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return false
  try {
    const node = sel.getRangeAt(0).commonAncestorContainer
    const el = node instanceof Element ? node : node.parentElement
    return !!el?.closest('mark.dsa-hl')
  } catch {
    return false
  }
}

function updateToolbar() {
  if (toolbarInteracting.value || mode.value === 'highlight') return

  const sel = window.getSelection()
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
    hide()
    return
  }

  if (selectionInsideHighlight()) {
    hide()
    return
  }

  assignBlockIds()
  const anchor = getSelectionAnchor()
  if (!anchor) {
    hide()
    return
  }

  let range
  try {
    range = sel.getRangeAt(0)
  } catch {
    hide()
    return
  }

  const rect = range.getBoundingClientRect()
  x.value = rect.left + rect.width / 2
  y.value = Math.max(8, rect.top - 8)
  mode.value = 'select'
  visible.value = true
}

let debounceTimer = null

function scheduleUpdate() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debounceTimer = null
    updateToolbar()
  }, 30)
}

function showHighlightMenu(mark) {
  const id = mark.dataset.highlightId
  if (!id) return

  const rect = mark.getBoundingClientRect()
  activeHighlightId.value = id
  mode.value = 'highlight'
  x.value = rect.left + rect.width / 2
  y.value = Math.max(8, rect.top - 8)
  visible.value = true
  toolbarInteracting.value = true
  window.getSelection()?.removeAllRanges()
}

async function highlight(color) {
  const anchor = getSelectionAnchor()
  if (!anchor) return

  const hl = await addHighlight({
    pagePath: currentPagePath.value,
    anchorType: 'text-range',
    blockId: anchor.blockId,
    startOffset: anchor.startOffset,
    endOffset: anchor.endOffset,
    color,
    textSnapshot: anchor.textSnapshot,
  })

  if (highlightsVisible.value) {
    applyHighlightToDOM(hl)
  }

  window.getSelection()?.removeAllRanges()
  hide()
  showToast('Highlight saved')
}

function noteForHighlight(highlightId) {
  return pageNotes.value.find(
    n => n.anchorType === 'highlight' && n.anchorId === highlightId
  )
}

async function addNoteFromSelection() {
  const anchor = getSelectionAnchor()
  if (!anchor) return

  const hl = await addHighlight({
    pagePath: currentPagePath.value,
    anchorType: 'text-range',
    blockId: anchor.blockId,
    startOffset: anchor.startOffset,
    endOffset: anchor.endOffset,
    color: 'yellow',
    textSnapshot: anchor.textSnapshot,
  })

  if (highlightsVisible.value) {
    applyHighlightToDOM(hl)
  }

  window.getSelection()?.removeAllRanges()
  hide()

  const body = await openNoteDialog({
    title: 'Add a note',
    placeholder: 'What do you want to remember about this passage?',
    initial: '',
  })

  if (body) {
    await addNote({
      pagePath: currentPagePath.value,
      anchorType: 'highlight',
      anchorId: hl.id,
      title: anchor.textSnapshot.slice(0, 60),
      body,
    })
    showToast('Note saved')
  }
}

async function editHighlightNote() {
  const highlightId = activeHighlightId.value
  if (!highlightId) return

  const existing = noteForHighlight(highlightId)
  const body = await openNoteDialog({
    title: existing ? 'Edit note' : 'Add a note',
    placeholder: 'What do you want to remember about this highlight?',
    initial: existing?.body ?? '',
  })

  hide()

  if (body === null) return

  if (existing) {
    if (!body.trim()) {
      await removeNote(existing.id)
      showToast('Note removed')
      return
    }
    await updateNote(existing.id, body)
    showToast('Note updated')
    return
  }

  if (!body.trim()) return

  const mark = document.querySelector(`mark[data-highlight-id="${highlightId}"]`)
  const title = mark?.textContent?.trim().slice(0, 60) || 'Highlight note'
  await addNote({
    pagePath: currentPagePath.value,
    anchorType: 'highlight',
    anchorId: highlightId,
    title,
    body,
  })
  showToast('Note saved')
}

async function removeActiveHighlight() {
  const highlightId = activeHighlightId.value
  if (!highlightId) return

  removeHighlightFromDOM(highlightId)
  await removeHighlight(highlightId)
  hide()
  showToast('Highlight removed')
}

function onSelectionChange() {
  scheduleUpdate()
}

function onMouseUp(e) {
  if (isIgnoredTarget(e.target)) return
  scheduleUpdate()
}

function onClick(e) {
  const mark = e.target instanceof Element ? e.target.closest('mark.dsa-hl') : null
  if (!mark) return
  if (e.target instanceof Element && e.target.closest('.annotation-toolbar')) return

  e.preventDefault()
  e.stopPropagation()
  showHighlightMenu(mark)
}

function onDocumentMouseDown(e) {
  if (!(e.target instanceof Element)) return
  if (e.target.closest('.annotation-toolbar')) return
  if (e.target.closest('.note-dialog, .note-dialog-backdrop')) return
  if (e.target.closest('mark.dsa-hl')) return

  if (visible.value) {
    hide()
    toolbarInteracting.value = false
  }
}

function onKeyDown(e) {
  if (e.key === 'Escape') hide()
}

function onToolbarPointerDown() {
  toolbarInteracting.value = true
}

function onToolbarPointerUp() {
  setTimeout(() => {
    toolbarInteracting.value = false
  }, 250)
}

function preparePage() {
  nextTick(() => {
    assignBlockIds()
  })
}

onMounted(() => {
  preparePage()
  document.addEventListener('selectionchange', onSelectionChange)
  document.addEventListener('mouseup', onMouseUp)
  document.addEventListener('click', onClick, true)
  document.addEventListener('mousedown', onDocumentMouseDown)
  document.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
  document.removeEventListener('selectionchange', onSelectionChange)
  document.removeEventListener('mouseup', onMouseUp)
  document.removeEventListener('click', onClick, true)
  document.removeEventListener('mousedown', onDocumentMouseDown)
  document.removeEventListener('keydown', onKeyDown)
})

watch(() => route.path, () => {
  hide()
  preparePage()
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="annotation-toolbar"
      :class="mode"
      :style="{ left: x + 'px', top: y + 'px' }"
      role="toolbar"
      :aria-label="mode === 'highlight' ? 'Highlight actions' : 'Highlight options'"
      @mousedown="onToolbarPointerDown"
      @mouseup="onToolbarPointerUp"
    >
      <template v-if="mode === 'select'">
        <button
          v-for="c in colors"
          :key="c.id"
          class="color-btn"
          :class="c.id"
          :aria-label="`Highlight ${c.label}`"
          :title="c.label"
          @mousedown.prevent
          @click="highlight(c.id)"
        />
        <span class="divider" />
        <button class="action-btn" title="Add note" @mousedown.prevent @click="addNoteFromSelection">
          Note
        </button>
      </template>

      <template v-else>
        <button class="action-btn" title="Add or edit note" @mousedown.prevent @click="editHighlightNote">
          {{ noteForHighlight(activeHighlightId) ? 'Edit note' : 'Add note' }}
        </button>
        <span class="divider" />
        <button class="action-btn danger" title="Remove highlight" @mousedown.prevent @click="removeActiveHighlight">
          Remove
        </button>
      </template>
    </div>
  </Teleport>
</template>

<style scoped>
.annotation-toolbar {
  position: fixed;
  transform: translate(-50%, -100%);
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 250;
}

.color-btn {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
}

.color-btn:hover {
  border-color: var(--vp-c-text-2);
}

.color-btn.yellow { background: #fef08a; }
.color-btn.green { background: #bbf7d0; }
.color-btn.blue { background: #bfdbfe; }
.color-btn.pink { background: #fbcfe8; }

.divider {
  width: 1px;
  height: 16px;
  background: var(--vp-c-divider);
  margin: 0 4px;
}

.action-btn {
  font-size: 12px;
  padding: 2px 8px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  border-radius: 4px;
  white-space: nowrap;
}

.action-btn:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

.action-btn.danger:hover {
  color: #ef4444;
}
</style>