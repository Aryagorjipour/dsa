<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import { useAnnotations } from '../composables/useAnnotations'
import { assignBlockIds } from '../utils/assignBlockIds'
import { getSelectionAnchor } from '../utils/highlightRestorer'
import { applyHighlightToDOM } from '../utils/highlightRestorer'

const route = useRoute()
const { addHighlight, addNote, highlightsVisible, currentPagePath } = useAnnotations()

const visible = ref(false)
const x = ref(0)
const y = ref(0)
const toolbarInteracting = ref(false)

const colors = [
  { id: 'yellow', label: 'Yellow' },
  { id: 'green', label: 'Green' },
  { id: 'blue', label: 'Blue' },
  { id: 'pink', label: 'Pink' },
]

function hide() {
  visible.value = false
}

function isIgnoredTarget(target) {
  if (!(target instanceof Element)) return false
  return !!target.closest(
    'input, textarea, select, [contenteditable="true"], .annotation-toolbar, pre, code, .vp-code-group, .language-'
  )
}

function updateToolbar() {
  if (toolbarInteracting.value) return

  const sel = window.getSelection()
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
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

  const body = prompt('Add a note for this highlight:', '')
  if (body !== null && body.trim()) {
    await addNote({
      pagePath: currentPagePath.value,
      anchorType: 'highlight',
      anchorId: hl.id,
      title: anchor.textSnapshot.slice(0, 60),
      body: body.trim(),
    })
  }

  window.getSelection()?.removeAllRanges()
  hide()
}

function onSelectionChange() {
  scheduleUpdate()
}

function onMouseUp(e) {
  if (isIgnoredTarget(e.target)) return
  scheduleUpdate()
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
  document.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
  document.removeEventListener('selectionchange', onSelectionChange)
  document.removeEventListener('mouseup', onMouseUp)
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
      :style="{ left: x + 'px', top: y + 'px' }"
      role="toolbar"
      aria-label="Highlight options"
      @mousedown="onToolbarPointerDown"
      @mouseup="onToolbarPointerUp"
    >
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
}

.action-btn:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}
</style>