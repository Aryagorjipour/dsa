<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useData } from 'vitepress'
import { useAnnotations, loadAnnotations } from '../composables/useAnnotations'
import { usePageNotesRail } from '../composables/usePageNotesRail'
import { useFocusMode } from '../composables/useFocusMode'
import { normalizePagePath } from '../utils/normalizePagePath'
import { scrollToNote } from '../utils/scrollToNote'
import { ensureHighlightInDOM } from '../utils/highlightRestorer'
import { layoutMarginNotes, connectorPath, isMarginNotesMobile } from '../utils/noteLayout'
import { handbookLink } from '../utils/handbookLink'
import { showToast } from '../composables/useToast'

const route = useRoute()
const { page } = useData()
const { isFocusMode } = useFocusMode()
const {
  isOpen,
  activeNoteId,
  togglePageNotesRail,
  closePageNotesRail,
  setActiveNoteId,
} = usePageNotesRail()

const { pageNotes, pageHighlights, highlights, loaded, removeNote } = useAnnotations()

const placements = ref([])
const cardHeights = ref({})
const cardRefs = ref({})
const isMobile = ref(false)
let resizeObserver = null
let layoutRaf = 0

const marginNotesEnabled = computed(() => showOnPage.value && !isFocusMode.value && !isMobile.value)

const TYPE_LABELS = {
  highlight: 'Highlight',
  heading: 'Section',
  free: 'Page',
}

const showOnPage = computed(() => {
  if (page.value.frontmatter.layout === 'home') return false
  const path = normalizePagePath(route.path)
  if (['/my-notes', '/playground', '/quizzes'].some(p => path === p || path.startsWith(p + '/'))) {
    return false
  }
  return true
})

const connectors = computed(() =>
  placements.value.map(p => ({
    id: p.note.id,
    path: connectorPath(p),
    active: activeNoteId.value === p.note.id,
  }))
)

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

function ensureNoteAnchors() {
  const linked = new Set(
    pageNotes.value
      .filter(n => n.anchorType === 'highlight' && n.anchorId)
      .map(n => n.anchorId),
  )
  for (const hl of pageHighlights.value) {
    if (linked.has(hl.id)) ensureHighlightInDOM(hl)
  }
}

function updateLayout() {
  if (!isOpen.value || isMobile.value) {
    placements.value = []
    return
  }
  ensureNoteAnchors()
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

async function focusNote(note) {
  if (!loaded.value) await loadAnnotations()
  setActiveNoteId(note.id)
  const ok = await scrollToNote(note, { highlights: highlights.value })
  if (!ok) showToast('Could not find this note on the page')
  scheduleLayout()
}

function onToggle() {
  togglePageNotesRail()
  nextTick(() => {
    scheduleLayout()
    window.setTimeout(scheduleLayout, 400)
  })
}

function setupResizeObserver() {
  resizeObserver?.disconnect()
  resizeObserver = new ResizeObserver(() => scheduleLayout())
  for (const el of Object.values(cardRefs.value)) {
    if (el instanceof HTMLElement) resizeObserver.observe(el)
  }
}

onMounted(async () => {
  await loadAnnotations()
  syncMobile()
  window.addEventListener('scroll', scheduleLayout, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
})

function onResize() {
  syncMobile()
  scheduleLayout()
}

onUnmounted(() => {
  if (layoutRaf) cancelAnimationFrame(layoutRaf)
  resizeObserver?.disconnect()
  window.removeEventListener('scroll', scheduleLayout)
  window.removeEventListener('resize', onResize)
})

watch(isOpen, open => {
  if (open) {
    nextTick(() => {
      scheduleLayout()
      window.setTimeout(scheduleLayout, 400)
    })
  } else {
    placements.value = []
    activeNoteId.value = null
  }
})

watch(() => route.path, () => {
  closePageNotesRail()
  cardRefs.value = {}
  cardHeights.value = {}
})

watch(pageNotes, () => nextTick(scheduleLayout))

watch(placements, () => nextTick(setupResizeObserver))
</script>

<template>
  <Teleport to="body">
    <template v-if="marginNotesEnabled">
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

      <p v-if="isOpen" class="page-notes-hint" aria-live="polite">
        Notes follow page order · <kbd>Esc</kbd> to close
        <a :href="handbookLink('/my-notes')" class="hint-link">All notes</a>
      </p>

      <article
        v-for="p in placements"
        :key="p.note.id"
        :ref="el => setCardRef(p.note.id, el)"
        class="margin-note-card"
        :class="{ active: activeNoteId === p.note.id, [p.side]: true }"
        :style="{ top: p.top + 'px', left: p.left + 'px', width: p.width + 'px' }"
      >
        <button type="button" class="margin-note-main" @click="focusNote(p.note)">
          <span class="margin-note-type">{{ TYPE_LABELS[p.note.anchorType] || 'Note' }}</span>
          <span v-if="p.note.title" class="margin-note-title">{{ p.note.title }}</span>
          <p class="margin-note-body">{{ p.note.body }}</p>
        </button>
        <button
          type="button"
          class="margin-note-delete"
          aria-label="Delete note"
          @click.stop="removeNote(p.note.id)"
        >✕</button>
      </article>

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
.page-notes-toggle {
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 110;
  display: flex;
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

.page-notes-hint {
  position: fixed;
  bottom: 72px;
  left: 24px;
  z-index: 109;
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

.margin-note-card {
  position: fixed;
  z-index: 108;
  display: flex;
  gap: 2px;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: color-mix(in srgb, var(--vp-c-bg-elv) 94%, transparent);
  backdrop-filter: blur(10px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.14);
  transition: border-color 0.15s, box-shadow 0.15s;
  pointer-events: auto;
  will-change: top, left;
}

.margin-note-card.active {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--vp-c-brand-1) 40%, transparent),
    0 8px 24px rgba(99, 102, 241, 0.18);
}

.margin-note-main {
  flex: 1;
  text-align: left;
  padding: 8px 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  min-width: 0;
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

<style>
.note-connectors {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 107;
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