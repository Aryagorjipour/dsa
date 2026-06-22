<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useData } from 'vitepress'
import { useAnnotations, loadAnnotations } from '../composables/useAnnotations'
import { usePageNotesRail } from '../composables/usePageNotesRail'
import { useFocusMode } from '../composables/useFocusMode'
import { normalizePagePath } from '../utils/normalizePagePath'
import { getNoteAnchorElement, scrollToNote } from '../utils/scrollToNote'
import { handbookLink } from '../utils/handbookLink'
import { showToast } from '../composables/useToast'

const route = useRoute()
const { page } = useData()
const { isFocusMode } = useFocusMode()
const {
  isOpen,
  activeNoteId,
  side,
  togglePageNotesRail,
  closePageNotesRail,
  setActiveNoteId,
  computeRailSide,
} = usePageNotesRail()

const { pageNotes, highlights, loaded, removeNote } = useAnnotations()

const cardRefs = ref({})
const connectors = ref([])
const railRef = ref(null)

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

const sortedNotes = computed(() =>
  [...pageNotes.value].sort((a, b) => b.updatedAt - a.updatedAt)
)

function setCardRef(id, el) {
  if (el) cardRefs.value[id] = el
  else delete cardRefs.value[id]
}

function anchorPoint(el, railSide) {
  const rect = el.getBoundingClientRect()
  const x = railSide === 'left' ? rect.right : rect.left
  return { x, y: rect.top + rect.height / 2 }
}

function cardPoint(cardEl, railSide) {
  const rect = cardEl.getBoundingClientRect()
  const x = railSide === 'left' ? rect.right - 4 : rect.left + 4
  return { x, y: rect.top + rect.height / 2 }
}

function curvePath(x1, y1, x2, y2, railSide) {
  const dx = x2 - x1
  const ctrlX = x1 + dx * 0.45
  const bend = railSide === 'left' ? -30 : 30
  const ctrlY = (y1 + y2) / 2 + bend
  return `M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`
}

function updateConnectors() {
  if (!isOpen.value) {
    connectors.value = []
    return
  }

  const railSide = side.value
  const lines = []

  for (const note of sortedNotes.value) {
    const cardEl = cardRefs.value[note.id]
    const anchorEl = getNoteAnchorElement(note, highlights.value)
    if (!cardEl || !anchorEl) continue

    const from = cardPoint(cardEl, railSide)
    const to = anchorPoint(anchorEl, railSide)

    lines.push({
      id: note.id,
      path: curvePath(from.x, from.y, to.x, to.y, railSide),
      active: activeNoteId.value === note.id,
    })
  }

  connectors.value = lines
}

async function goToNote(note) {
  if (!loaded.value) await loadAnnotations()
  setActiveNoteId(note.id)
  const ok = await scrollToNote(note, { highlights: highlights.value })
  if (!ok) showToast('Could not find this note on the page')
  await nextTick()
  updateConnectors()
}

function onToggle() {
  computeRailSide()
  togglePageNotesRail()
  nextTick(updateConnectors)
}

let scrollRaf = 0
function onScrollOrResize() {
  if (!isOpen.value) return
  if (scrollRaf) cancelAnimationFrame(scrollRaf)
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = 0
    updateConnectors()
  })
}

onMounted(async () => {
  await loadAnnotations()
  window.addEventListener('scroll', onScrollOrResize, { passive: true })
  window.addEventListener('resize', onScrollOrResize, { passive: true })
})

onUnmounted(() => {
  if (scrollRaf) cancelAnimationFrame(scrollRaf)
  window.removeEventListener('scroll', onScrollOrResize)
  window.removeEventListener('resize', onScrollOrResize)
})

watch(isOpen, open => {
  if (open) {
    nextTick(() => {
      updateConnectors()
      window.setTimeout(updateConnectors, 350)
    })
  } else {
    connectors.value = []
  }
})

watch(() => route.path, () => {
  closePageNotesRail()
  cardRefs.value = {}
})

watch([sortedNotes, activeNoteId, side], () => nextTick(updateConnectors))
</script>

<template>
  <Teleport to="body">
    <template v-if="showOnPage && !isFocusMode">
      <button
        type="button"
        class="page-notes-toggle"
        :class="{ open: isOpen }"
        :aria-expanded="isOpen"
        aria-label="Toggle page notes panel"
        title="Page notes (Shift+N)"
        @click="onToggle"
      >
        <span class="toggle-icon" aria-hidden="true">📝</span>
        <span class="toggle-label">
          {{ isOpen ? 'Hide notes' : 'Page notes' }}
          <span v-if="pageNotes.length" class="toggle-count">{{ pageNotes.length }}</span>
        </span>
        <kbd class="toggle-kbd">⇧N</kbd>
      </button>

      <Transition name="rail-slide">
        <aside
          v-if="isOpen"
          ref="railRef"
          class="page-notes-rail"
          :class="side"
          aria-label="Notes on this page"
        >
          <header class="rail-header">
            <div>
              <h2 class="rail-title">Notes on this page</h2>
              <p class="rail-sub">{{ pageNotes.length }} saved · lines point to sources</p>
            </div>
            <button type="button" class="rail-close" aria-label="Close" @click="closePageNotesRail">✕</button>
          </header>

          <p v-if="!pageNotes.length" class="rail-empty">
            No notes on this page yet. Highlight text or use <strong>Add page note</strong> at the bottom.
          </p>

          <ul v-else class="rail-list">
            <li
              v-for="note in sortedNotes"
              :key="note.id"
              :ref="el => setCardRef(note.id, el)"
              class="rail-card"
              :class="{ active: activeNoteId === note.id }"
            >
              <button type="button" class="rail-card-btn" @click="goToNote(note)">
                <span class="rail-card-head">
                  <span class="rail-type">{{ TYPE_LABELS[note.anchorType] || 'Note' }}</span>
                  <span class="rail-arrow" aria-hidden="true">{{ side === 'left' ? '→' : '←' }}</span>
                </span>
                <span class="rail-card-title">{{ note.title || 'Untitled' }}</span>
                <span class="rail-card-body">{{ note.body }}</span>
              </button>
              <button
                type="button"
                class="rail-delete"
                aria-label="Delete note"
                @click.stop="removeNote(note.id)"
              >✕</button>
            </li>
          </ul>

          <footer class="rail-footer">
            <a :href="handbookLink('/my-notes')" class="rail-all-link">All notes across handbook →</a>
          </footer>
        </aside>
      </Transition>

      <svg
        v-if="isOpen && connectors.length"
        class="note-connectors"
        aria-hidden="true"
      >
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

.page-notes-rail {
  position: fixed;
  top: calc(var(--vp-nav-height, 64px) + 12px);
  bottom: 72px;
  width: min(300px, calc(100vw - 24px));
  z-index: 108;
  display: flex;
  flex-direction: column;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: color-mix(in srgb, var(--vp-c-bg-elv) 92%, transparent);
  backdrop-filter: blur(12px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.22);
  overflow: hidden;
}

.page-notes-rail.left {
  left: 12px;
}

.page-notes-rail.right {
  right: 12px;
}

.rail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  padding: 14px 14px 10px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.rail-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.rail-sub {
  margin: 2px 0 0;
  font-size: 11px;
  color: var(--vp-c-text-3);
}

.rail-close {
  background: none;
  border: none;
  color: var(--vp-c-text-3);
  cursor: pointer;
  padding: 4px;
  font-size: 14px;
  line-height: 1;
}

.rail-empty {
  margin: 0;
  padding: 16px 14px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}

.rail-list {
  list-style: none;
  margin: 0;
  padding: 10px;
  overflow-y: auto;
  flex: 1;
}

.rail-card {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.rail-card.active .rail-card-btn {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--vp-c-brand-1) 35%, transparent);
}

.rail-card-btn {
  flex: 1;
  text-align: left;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.rail-card-btn:hover {
  border-color: var(--vp-c-brand-1);
}

.rail-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.rail-type {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

.rail-arrow {
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.rail-card-title {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 4px;
}

.rail-card-body {
  display: block;
  font-size: 12px;
  line-height: 1.45;
  color: var(--vp-c-text-2);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.rail-delete {
  background: none;
  border: none;
  color: var(--vp-c-text-3);
  cursor: pointer;
  padding: 8px 4px;
  font-size: 11px;
}

.rail-footer {
  padding: 10px 14px 12px;
  border-top: 1px solid var(--vp-c-divider);
}

.rail-all-link {
  font-size: 12px;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.rail-all-link:hover {
  text-decoration: underline;
}

.rail-slide-enter-active,
.rail-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.22s ease;
}

.rail-slide-enter-from,
.rail-slide-leave-to {
  opacity: 0;
  transform: translateX(var(--rail-offset, 12px));
}

.page-notes-rail.left {
  --rail-offset: -16px;
}

.page-notes-rail.right {
  --rail-offset: 16px;
}

@media (max-width: 640px) {
  .page-notes-toggle {
    bottom: 16px;
    left: 16px;
    padding: 7px 12px;
    font-size: 12px;
  }

  .toggle-kbd {
    display: none;
  }

  .page-notes-rail {
    width: calc(100vw - 20px);
    left: 10px !important;
    right: 10px !important;
  }
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
  stroke: color-mix(in srgb, var(--vp-c-brand-1) 35%, transparent);
  stroke-width: 1.5;
  stroke-dasharray: 5 4;
  transition: stroke 0.2s, stroke-width 0.2s;
}

.connector-line.active {
  stroke: var(--vp-c-brand-1);
  stroke-width: 2.5;
  stroke-dasharray: none;
}
</style>