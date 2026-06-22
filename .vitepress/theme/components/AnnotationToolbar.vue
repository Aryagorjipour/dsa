<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import { useAnnotations } from '../composables/useAnnotations'
import { openNoteDialog } from '../composables/useNoteDialog'
import { showToast } from '../composables/useToast'
import { assignBlockIds } from '../utils/assignBlockIds'
import {
  getSelectionAnchor,
  applyHighlightToDOM,
  removeHighlightFromDOM,
  rangeTouchesInlineCode,
} from '../utils/highlightRestorer'

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
const activeHighlightQuote = ref('')
/** Saved when toolbar opens — selection is gone by the time buttons are clicked. */
const pendingAnchor = ref(null)
/** True while the pointer is down on the toolbar — blocks outside-click hide. */
const toolbarPressing = ref(false)

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
  activeHighlightQuote.value = ''
  pendingAnchor.value = null
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

function captureSelectionAnchor() {
  if (mode.value === 'highlight') return null
  if (selectionInsideHighlight()) return null

  assignBlockIds()
  const anchor = getSelectionAnchor()
  if (!anchor) return null

  pendingAnchor.value = { ...anchor }
  return anchor
}

function updateToolbar() {
  if (mode.value === 'highlight') return
  if (visible.value && pendingAnchor.value) return

  const sel = window.getSelection()
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
    if (!pendingAnchor.value) hide()
    return
  }

  const anchor = captureSelectionAnchor()
  if (!anchor) {
    try {
      const range = sel.getRangeAt(0)
      if (!range.collapsed && range.toString().trim() && rangeTouchesInlineCode(range)) {
        showToast('Inline code cannot be highlighted — select the surrounding text')
      }
    } catch {
      /* ignore */
    }
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
  if (visible.value && pendingAnchor.value) return
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
  pendingAnchor.value = null
  activeHighlightId.value = id
  activeHighlightQuote.value = mark.textContent?.trim() || ''
  mode.value = 'highlight'
  x.value = rect.left + rect.width / 2
  y.value = Math.max(8, rect.top - 8)
  visible.value = true
  window.getSelection()?.removeAllRanges()
}

async function applyColor(color) {
  const anchor = pendingAnchor.value
  if (!anchor) {
    showToast('Selection lost — try selecting again')
    hide()
    return
  }

  try {
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
    const ok = applyHighlightToDOM(hl)
    if (!ok) showToast('Could not paint highlight — saved anyway')
  }

  window.getSelection()?.removeAllRanges()
  hide()
  showToast('Highlight saved')
  } catch (err) {
    console.error('[dsa] highlight failed', err)
    showToast('Could not save highlight')
  }
}

async function addNoteFromSelection() {
  const anchor = pendingAnchor.value
  if (!anchor) {
    showToast('Selection lost — try selecting again')
    hide()
    return
  }

  try {
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
  } catch (err) {
    console.error('[dsa] note failed', err)
    showToast('Could not save note')
  }
}

function noteForHighlight(highlightId) {
  return pageNotes.value.find(
    n => n.anchorType === 'highlight' && n.anchorId === highlightId
  )
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
  if (visible.value && pendingAnchor.value) return
  scheduleUpdate()
}

function onMouseUp(e) {
  if (isIgnoredTarget(e.target)) return
  // Capture anchor immediately while the selection still exists.
  captureSelectionAnchor()
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

let toolbarPressTimer = 0

function onToolbarPointerDown() {
  if (toolbarPressTimer) clearTimeout(toolbarPressTimer)
  toolbarPressing.value = true
}

function onToolbarPointerUp() {
  if (toolbarPressTimer) clearTimeout(toolbarPressTimer)
  // Keep the guard through the synthesized click event.
  toolbarPressTimer = window.setTimeout(() => {
    toolbarPressTimer = 0
    toolbarPressing.value = false
  }, 300)
}

function onDocumentMouseDown(e) {
  if (!(e.target instanceof Element)) return
  if (e.target.closest('.annotation-toolbar')) return
  if (e.target.closest('.note-dialog, .note-dialog-backdrop')) return
  if (e.target.closest('.margin-note-card, .page-notes-toggle, .page-notes-hint')) return
  if (e.target.closest('mark.dsa-hl')) return
  if (toolbarPressing.value) return

  // Defer so toolbar button handlers run first (pointerdown/click).
  requestAnimationFrame(() => {
    if (toolbarPressing.value) return
    hide()
  })
}

function onKeyDown(e) {
  if (e.key === 'Escape') hide()
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
  if (toolbarPressTimer) clearTimeout(toolbarPressTimer)
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
      @pointerdown.stop="onToolbarPointerDown"
      @pointerup="onToolbarPointerUp"
      @pointercancel="onToolbarPointerUp"
      @mousedown.stop
    >
      <template v-if="mode === 'select'">
        <button
          v-for="c in colors"
          :key="c.id"
          type="button"
          class="color-btn"
          :class="c.id"
          :aria-label="`Highlight ${c.label}`"
          :title="c.label"
          @click.stop="applyColor(c.id)"
        />
        <span class="divider" />
        <button
          type="button"
          class="action-btn"
          title="Add note"
          @click.stop="addNoteFromSelection"
        >
          Note
        </button>
      </template>

      <template v-else>
        <div class="toolbar-body">
          <p v-if="activeHighlightQuote" class="toolbar-quote">“{{ activeHighlightQuote }}”</p>
          <div v-if="noteForHighlight(activeHighlightId)" class="toolbar-note">
            <span class="toolbar-note-label">Your note</span>
            <p class="toolbar-note-text">{{ noteForHighlight(activeHighlightId).body }}</p>
          </div>
          <p v-else class="toolbar-no-note">No note yet — add one below.</p>
        </div>
        <footer class="toolbar-footer">
          <button
            type="button"
            class="action-btn"
            title="Add or edit note"
            @click.stop="editHighlightNote"
          >
            {{ noteForHighlight(activeHighlightId) ? 'Edit note' : 'Add note' }}
          </button>
          <button
            type="button"
            class="action-btn danger"
            title="Remove highlight"
            @click.stop="removeActiveHighlight"
          >
            Remove
          </button>
        </footer>
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
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 250;
  user-select: none;
}

.annotation-toolbar.highlight {
  flex-direction: column;
  align-items: stretch;
  min-width: 240px;
  max-width: min(340px, calc(100vw - 24px));
  padding: 0;
  overflow: hidden;
}

.toolbar-body {
  padding: 10px 12px 8px;
}

.toolbar-quote {
  margin: 0 0 8px;
  font-size: 12px;
  line-height: 1.45;
  color: var(--vp-c-text-2);
  font-style: italic;
  border-left: 3px solid var(--vp-c-brand-1);
  padding-left: 8px;
}

.toolbar-note-label {
  display: block;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vp-c-brand-1);
  font-weight: 700;
  margin-bottom: 4px;
}

.toolbar-note-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--vp-c-text-1);
  white-space: pre-wrap;
  word-break: break-word;
}

.toolbar-no-note {
  margin: 0;
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.toolbar-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  padding: 6px 8px;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
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