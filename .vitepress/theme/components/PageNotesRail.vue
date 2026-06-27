<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useData } from 'vitepress'
import { useAnnotations, loadAnnotations } from '../composables/useAnnotations'
import { usePageNotesRail } from '../composables/usePageNotesRail'
import { useFocusMode } from '../composables/useFocusMode'
import { useNoteCardDrag } from '../composables/useNoteCardDrag'
import { normalizePagePath } from '../utils/normalizePagePath'
import { scrollToNote } from '../utils/scrollToNote'
import { ensureHighlightInDOM } from '../utils/highlightRestorer'
import { layoutMarginNotes, connectorPath, isMarginNotesMobile } from '../utils/noteLayout'
import { onAnnotationsRestored } from '../utils/annotationLifecycle'
import { handbookLink } from '../utils/handbookLink'
import { showToast } from '../composables/useToast'
import { openNoteDetailModal } from '../composables/useNoteDetailModal'
import MarginNoteCard from './MarginNoteCard.vue'

const route = useRoute()
const { page } = useData()
const { isFocusMode, toggleFocusMode } = useFocusMode()
const {
  isOpen,
  activeNoteId,
  togglePageNotesRail,
  closePageNotesRail,
  setActiveNoteId,
} = usePageNotesRail()

const {
  pageNotes,
  pageHighlights,
  highlights,
  loaded,
  removeNote,
  updateNote,
  updateNoteMarginLayout,
  updateHighlightColor,
} = useAnnotations()

const {
  justDragged,
  onDragPointerDown,
  onDragPointerMove,
  onDragPointerUp,
  onDragKeyDown,
  getDragStyle,
  isDragging,
} = useNoteCardDrag()

const placements = ref([])
const cardHeights = ref({})
const cardRefs = ref({})
const editingNoteId = ref(null)
const isMobile = ref(false)
let resizeObserver = null
let layoutRaf = 0
let layoutRetryTimer = 0
let unbindRestoreListener = null

const showDock = computed(() => showOnPage.value && !isMobile.value)
const marginNotesEnabled = computed(() => showDock.value && !isFocusMode.value)

const showOnPage = computed(() => {
  if (page.value.frontmatter.layout === 'home') return false
  const path = normalizePagePath(route.path)
  if (['/my-notes', '/playground', '/quizzes'].some(p => path === p || path.startsWith(p + '/'))) {
    return false
  }
  return true
})

const connectors = computed(() =>
  placements.value
    .filter(p => !p.pinned)
    .map(p => ({
      id: p.note.id,
      path: connectorPath(p),
      active: activeNoteId.value === p.note.id,
    }))
)

function highlightColorForNote(note) {
  if (note.anchorType !== 'highlight' || !note.anchorId) return null
  return highlights.value.find(h => h.id === note.anchorId)?.color ?? null
}

function setCardRef(id, el) {
  if (el) cardRefs.value[id] = el
  else delete cardRefs.value[id]
}

function measureCards() {
  const heights = { ...cardHeights.value }
  let changed = false
  for (const [id, el] of Object.entries(cardRefs.value)) {
    if (!(el instanceof HTMLElement)) continue
    const h = Math.ceil(el.getBoundingClientRect().height)
    if (h > 0 && heights[id] !== h) {
      heights[id] = h
      changed = true
    }
  }
  if (changed) cardHeights.value = heights
  return changed
}

function syncMobile() {
  const mobile = isMarginNotesMobile()
  if (mobile && isOpen.value) closePageNotesRail()
  isMobile.value = mobile
}

function ensurePageHighlights() {
  for (const hl of pageHighlights.value) {
    ensureHighlightInDOM(hl)
  }
}

function updateLayout() {
  if (!isOpen.value || isMobile.value) {
    placements.value = []
    return
  }
  ensurePageHighlights()
  measureCards()
  placements.value = layoutMarginNotes(pageNotes.value, highlights.value, cardHeights.value)
}

function scheduleLayout() {
  if (!isOpen.value) return
  if (layoutRaf) cancelAnimationFrame(layoutRaf)
  layoutRaf = requestAnimationFrame(() => {
    layoutRaf = 0
    updateLayout()
    if (measureCards()) updateLayout()
  })
}

function scheduleLayoutWithRetry() {
  if (!isOpen.value) return
  scheduleLayout()
  if (layoutRetryTimer) window.clearTimeout(layoutRetryTimer)

  let attempt = 0
  const retry = () => {
    if (!isOpen.value) return
    attempt++
    const expected = pageNotes.value.length
    const placed = placements.value.length
    if (expected > 0 && placed < expected && attempt < 18) {
      scheduleLayout()
      layoutRetryTimer = window.setTimeout(retry, 80 + attempt * 40)
    }
  }

  layoutRetryTimer = window.setTimeout(retry, 120)
}

function onAnnotationsReady() {
  ensurePageHighlights()
  if (isOpen.value) {
    scheduleLayoutWithRetry()
  }
}

async function focusNote(note) {
  if (justDragged.value) return
  if (editingNoteId.value) return
  if (!loaded.value) await loadAnnotations()
  setActiveNoteId(note.id)
  const ok = await scrollToNote(note, { highlights: highlights.value })
  if (!ok) showToast('Could not find this note on the page')
  scheduleLayout()
}

async function openNoteDetail(note) {
  if (justDragged.value) return
  if (editingNoteId.value) return
  if (!loaded.value) await loadAnnotations()
  setActiveNoteId(note.id)
  openNoteDetailModal(note)
  if (note.anchorType === 'heading' || note.anchorType === 'highlight') {
    const ok = await scrollToNote(note, { highlights: highlights.value, block: 'nearest' })
    if (!ok) {
      showToast(
        note.anchorType === 'heading'
          ? 'Could not find this section on the page'
          : 'Could not find this highlight on the page',
      )
    }
  }
  scheduleLayout()
}

function onToggle() {
  togglePageNotesRail()
  nextTick(() => scheduleLayoutWithRetry())
}

function setupResizeObserver() {
  resizeObserver?.disconnect()
  resizeObserver = new ResizeObserver(() => scheduleLayout())
  for (const el of Object.values(cardRefs.value)) {
    if (el instanceof HTMLElement) resizeObserver.observe(el)
  }
}

async function persistDragPosition(noteId, docTop, docLeft) {
  const note = pageNotes.value.find(n => n.id === noteId)
  const layout =
    note?.anchorType === 'free'
      ? { docTop: 0, docLeft, updatedAt: Date.now() }
      : { docTop, docLeft, updatedAt: Date.now() }

  await updateNoteMarginLayout(noteId, layout)
  scheduleLayout()
}

function isPageNoteDrag(placement) {
  return placement.pinned && placement.note.anchorType === 'free'
}

function handleDragPointerDown(e, note, placement) {
  if (placement.pinned && note.anchorType !== 'free') return
  onDragPointerDown(e, note, placement)
}

function handleDragPointerMove(e, note, placement) {
  onDragPointerMove(e, isPageNoteDrag(placement))
}

async function handleDragPointerUp(e, note, placement) {
  await onDragPointerUp(e, persistDragPosition, { horizontalOnly: isPageNoteDrag(placement) })
}

function startEdit(noteId) {
  editingNoteId.value = noteId
}

function cancelEdit() {
  editingNoteId.value = null
}

async function saveEdit({ id, body, title }) {
  if (!body.trim()) {
    await removeNote(id)
    showToast('Note removed')
  } else {
    await updateNote(id, body, title)
    showToast('Note updated')
  }
  editingNoteId.value = null
  scheduleLayout()
}

async function changeHighlightColor(color) {
  const note = pageNotes.value.find(n => n.id === editingNoteId.value)
  if (!note?.anchorId) return
  await updateHighlightColor(note.anchorId, color)
}

async function resetPosition(noteId) {
  await updateNoteMarginLayout(noteId, null)
  scheduleLayout()
}

function onEscapeKey(e) {
  if (e.key !== 'Escape' || !editingNoteId.value) return
  e.stopImmediatePropagation()
  cancelEdit()
}

onMounted(async () => {
  await loadAnnotations()
  syncMobile()
  unbindRestoreListener = onAnnotationsRestored(onAnnotationsReady)
  window.addEventListener('scroll', scheduleLayout, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
  document.addEventListener('keydown', onDragKeyDown)
  document.addEventListener('keydown', onEscapeKey, true)
})

function onResize() {
  syncMobile()
  scheduleLayout()
}

onUnmounted(() => {
  if (layoutRaf) cancelAnimationFrame(layoutRaf)
  if (layoutRetryTimer) window.clearTimeout(layoutRetryTimer)
  unbindRestoreListener?.()
  resizeObserver?.disconnect()
  window.removeEventListener('scroll', scheduleLayout)
  window.removeEventListener('resize', onResize)
  document.removeEventListener('keydown', onDragKeyDown)
  document.removeEventListener('keydown', onEscapeKey, true)
})

watch(isOpen, open => {
  if (open) {
    nextTick(() => scheduleLayoutWithRetry())
  } else {
    placements.value = []
    activeNoteId.value = null
    editingNoteId.value = null
  }
})

watch(() => route.path, () => {
  cardRefs.value = {}
  cardHeights.value = {}
  editingNoteId.value = null
  setActiveNoteId(null)

  if (pageNotes.value.length === 0) {
    closePageNotesRail()
  }

  if (isOpen.value) {
    nextTick(() => scheduleLayoutWithRetry())
  }
})

watch(pageNotes, () => nextTick(scheduleLayout))
watch(pageHighlights, () => nextTick(scheduleLayout))
watch(placements, () => nextTick(setupResizeObserver))
</script>

<template>
  <Teleport to="body">
    <div v-if="showDock" class="page-bottom-dock-wrap">
      <p v-if="marginNotesEnabled && isOpen" class="page-notes-hint" aria-live="polite">
        Page notes stick under the navbar · Drag horizontally to move · Double-click to edit · <kbd>Esc</kbd> to close
        <a :href="handbookLink('/my-notes')" class="hint-link">All notes</a>
      </p>
      <div class="page-bottom-dock">
        <template v-if="isFocusMode">
          <button
            type="button"
            class="dock-focus-btn is-exit"
            aria-label="Exit focus mode (Shift+F or Esc)"
            title="Exit Focus Mode (Shift+F or Esc)"
            @click="toggleFocusMode"
          >
            <span class="focus-icon" aria-hidden="true">◑</span>
            Exit Focus
          </button>
        </template>
        <template v-else>
          <button
            type="button"
            class="page-notes-toggle"
            :class="{ open: isOpen }"
            :aria-expanded="isOpen"
            aria-label="Toggle page notes on this page"
            title="Show notes beside their passages (Shift+N)"
            @click="onToggle"
          >
            <span class="toggle-icon" aria-hidden="true">📝</span>
            <span class="toggle-label">
              {{ isOpen ? 'Hide notes' : 'Page notes' }}
              <span v-if="pageNotes.length" class="toggle-count">{{ pageNotes.length }}</span>
            </span>
            <kbd class="toggle-kbd">⇧N</kbd>
          </button>
          <button
            type="button"
            class="dock-focus-btn"
            aria-label="Enter focus mode (Shift+F)"
            title="Focus Mode — fullscreen reading, hides nav and sidebars (Shift+F)"
            @click="toggleFocusMode"
          >
            <span class="focus-icon" aria-hidden="true">◐</span>
            Focus
          </button>
        </template>
      </div>
    </div>

    <template v-if="marginNotesEnabled">
      <MarginNoteCard
        v-for="p in placements"
        :key="p.note.id"
        :ref="el => setCardRef(p.note.id, el?.$el ?? el)"
        :note="p.note"
        :placement="p"
        :active="activeNoteId === p.note.id"
        :highlight-color="highlightColorForNote(p.note)"
        :editing="editingNoteId === p.note.id"
        :pinned="!!p.pinned"
        :drag-style="p.pinned && p.note.anchorType !== 'free' ? null : getDragStyle(p.note.id)"
        :dragging="(p.pinned ? p.note.anchorType === 'free' : true) && isDragging(p.note.id)"
        @focus="focusNote"
        @detail="openNoteDetail"
        @delete="removeNote"
        @save="saveEdit"
        @color-change="changeHighlightColor"
        @start-edit="startEdit"
        @cancel-edit="cancelEdit"
        @reset-position="resetPosition"
        @drag-pointerdown="e => handleDragPointerDown(e, p.note, p)"
        @drag-pointermove="e => handleDragPointerMove(e, p.note, p)"
        @drag-pointerup="e => handleDragPointerUp(e, p.note, p)"
      />

      <svg v-if="isOpen && connectors.length" class="note-connectors" aria-hidden="true">
        <path
          v-for="line in connectors"
          :key="line.id"
          :d="line.path"
          class="connector-line"
          :class="{ active: line.active }"
        />
      </svg>
    </template>
  </Teleport>
</template>

<style scoped>
.page-bottom-dock-wrap {
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 111;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  max-width: calc(100vw - 48px);
}

.page-bottom-dock {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: nowrap;
}

.page-notes-toggle {
  position: static;
  display: flex;
  flex-shrink: 0;
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
  transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
}

.page-notes-toggle:hover,
.page-notes-toggle.open {
  transform: scale(1.03);
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.2);
}

.toggle-icon {
  font-size: 15px;
  line-height: 1;
}

.toggle-count {
  display: inline-flex;
  min-width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  padding: 0 5px;
  border-radius: 9999px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}

.toggle-kbd {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-3);
  font-family: inherit;
  line-height: 1.3;
}

.dock-focus-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 9999px;
  border: none;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  transition: transform 0.1s;
}

.dock-focus-btn:hover {
  transform: scale(1.04);
}

.dock-focus-btn.is-exit {
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.dock-focus-btn .focus-icon {
  font-size: 14px;
}

.page-notes-hint {
  position: static;
  margin: 0;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 11px;
  color: var(--vp-c-text-2);
  background: color-mix(in srgb, var(--vp-c-bg-elv) 90%, transparent);
  border: 1px solid var(--vp-c-divider);
  backdrop-filter: blur(8px);
}

.page-notes-hint kbd {
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 3px;
  border: 1px solid var(--vp-c-divider);
  font-family: inherit;
}

.hint-link {
  margin-left: 6px;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.hint-link:hover {
  text-decoration: underline;
}
</style>

<style>
.note-connectors {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 24;
}

.connector-line {
  fill: none;
  stroke: color-mix(in srgb, var(--vp-c-brand-1) 40%, transparent);
  stroke-width: 1.5;
  transition: stroke 0.2s, stroke-width 0.2s;
}

.connector-line.active {
  stroke: var(--vp-c-brand-1);
  stroke-width: 2.5;
}
</style>