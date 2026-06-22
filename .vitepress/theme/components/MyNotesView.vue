<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAnnotations, loadAnnotations } from '../composables/useAnnotations'
import { normalizePagePath } from '../utils/normalizePagePath'
import { notePageLink } from '../utils/scrollToNote'
import { sortNotesByPagePosition } from '../utils/noteLayout'

const { notes, highlights, removeNote, loaded } = useAnnotations()
const search = ref('')
const typeFilter = ref('all')
const collapsedPages = ref(new Set())

onMounted(() => loadAnnotations())

const ANCHOR_LABELS = {
  free: 'Page',
  heading: 'Section',
  highlight: 'Highlight',
}

const TYPE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'highlight', label: 'Highlights' },
  { id: 'heading', label: 'Sections' },
  { id: 'free', label: 'Page notes' },
]

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  let list = [...notes.value]

  if (typeFilter.value !== 'all') {
    list = list.filter(n => n.anchorType === typeFilter.value)
  }

  if (q) {
    list = list.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.body.toLowerCase().includes(q) ||
      normalizePagePath(n.pagePath).toLowerCase().includes(q) ||
      highlightSnippet(n).toLowerCase().includes(q),
    )
  }

  return list
})

const pageGroups = computed(() => {
  const map = new Map()
  for (const note of filtered.value) {
    const path = normalizePagePath(note.pagePath)
    if (!map.has(path)) map.set(path, [])
    map.get(path).push(note)
  }

  return [...map.entries()]
    .map(([path, items]) => ({
      path,
      label: pageLabel(path),
      notes: sortNotesByPagePosition(items, highlights.value),
    }))
    .sort((a, b) => {
      const aLatest = Math.max(...a.notes.map(n => n.updatedAt))
      const bLatest = Math.max(...b.notes.map(n => n.updatedAt))
      return bLatest - aLatest
    })
})

const stats = computed(() => {
  const pages = new Set(notes.value.map(n => normalizePagePath(n.pagePath)))
  return {
    total: notes.value.length,
    pages: pages.size,
    highlights: notes.value.filter(n => n.anchorType === 'highlight').length,
  }
})

function pageLabel(path) {
  const parts = path.split('/').filter(Boolean)
  if (!parts.length) return 'Home'
  const last = parts[parts.length - 1]
  return last
    .replace(/^\d+-/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function highlightSnippet(note) {
  if (note.anchorType !== 'highlight' || !note.anchorId) return ''
  const hl = highlights.value.find(h => h.id === note.anchorId)
  return hl?.textSnapshot ?? ''
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function anchorLabel(note) {
  return ANCHOR_LABELS[note.anchorType] ?? 'Note'
}

function isPageCollapsed(path) {
  return collapsedPages.value.has(path)
}

function togglePage(path) {
  const next = new Set(collapsedPages.value)
  if (next.has(path)) next.delete(path)
  else next.add(path)
  collapsedPages.value = next
}

function notePreview(note) {
  const snippet = highlightSnippet(note)
  if (snippet) return `“${snippet}” — ${note.body}`
  return note.body || note.title || 'Empty note'
}
</script>

<template>
  <div class="my-notes">
    <div v-if="loaded && notes.length" class="stats-bar">
      <span><strong>{{ stats.total }}</strong> notes</span>
      <span class="stats-sep">·</span>
      <span><strong>{{ stats.pages }}</strong> pages</span>
      <span v-if="stats.highlights" class="stats-sep">·</span>
      <span v-if="stats.highlights"><strong>{{ stats.highlights }}</strong> on highlights</span>
    </div>

    <div class="toolbar">
      <input
        v-model="search"
        type="search"
        placeholder="Search notes, pages, or highlighted text…"
        class="search-input"
        aria-label="Search notes"
      />
      <div class="filter-chips" role="group" aria-label="Filter by note type">
        <button
          v-for="chip in TYPE_FILTERS"
          :key="chip.id"
          type="button"
          class="filter-chip"
          :class="{ active: typeFilter === chip.id }"
          @click="typeFilter = chip.id"
        >
          {{ chip.label }}
        </button>
      </div>
    </div>

    <p v-if="!loaded" class="status">Loading your notes…</p>

    <div v-else-if="!notes.length" class="empty-card">
      <p class="empty-title">No notes yet</p>
      <p class="empty-body">
        On any handbook page you can select text and click <strong>Note</strong>,
        use <strong>+</strong> on a section heading, or add a page note at the bottom.
      </p>
    </div>

    <p v-else-if="!filtered.length" class="status">No notes match your search or filter.</p>

    <div v-else class="page-groups">
      <section v-for="group in pageGroups" :key="group.path" class="page-group">
        <button
          type="button"
          class="page-header"
          :aria-expanded="!isPageCollapsed(group.path)"
          @click="togglePage(group.path)"
        >
          <span class="page-chevron" aria-hidden="true">{{ isPageCollapsed(group.path) ? '▸' : '▾' }}</span>
          <span class="page-title">{{ group.label }}</span>
          <span class="page-count">{{ group.notes.length }}</span>
        </button>

        <ul v-show="!isPageCollapsed(group.path)" class="note-list">
          <li v-for="note in group.notes" :key="note.id" class="note-row">
            <a :href="notePageLink(note)" class="note-card">
              <span class="note-head">
                <span class="note-type" :data-type="note.anchorType">{{ anchorLabel(note) }}</span>
                <span class="note-date">{{ formatDate(note.updatedAt) }}</span>
              </span>
              <span v-if="note.title && note.title !== 'Note'" class="note-title">{{ note.title }}</span>
              <span class="note-body">{{ notePreview(note) }}</span>
              <span class="note-path">{{ group.path }}</span>
            </a>
            <button class="delete-btn" aria-label="Delete note" @click="removeNote(note.id)">✕</button>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.my-notes {
  max-width: 760px;
}

.stats-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  margin-bottom: 16px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.stats-bar strong {
  color: var(--vp-c-text-1);
}

.stats-sep {
  color: var(--vp-c-text-3);
}

.toolbar {
  margin-bottom: 24px;
}

.search-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  font-size: 14px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  margin-bottom: 10px;
}

.search-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--vp-c-brand-1) 20%, transparent);
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.filter-chip {
  padding: 5px 12px;
  border-radius: 9999px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.filter-chip:hover {
  border-color: var(--vp-c-text-3);
}

.filter-chip.active {
  border-color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
  color: var(--vp-c-brand-1);
}

.status {
  color: var(--vp-c-text-3);
  font-size: 14px;
  line-height: 1.6;
}

.empty-card {
  padding: 24px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}

.empty-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.empty-body {
  margin: 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.page-groups {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-group {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
}

.page-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
}

.page-header:hover {
  background: color-mix(in srgb, var(--vp-c-brand-1) 6%, transparent);
}

.page-chevron {
  font-size: 11px;
  color: var(--vp-c-text-3);
  width: 12px;
}

.page-title {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.page-count {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 9999px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-3);
  border: 1px solid var(--vp-c-divider);
}

.note-list {
  list-style: none;
  padding: 0 10px 10px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.note-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.note-card {
  flex: 1;
  display: block;
  padding: 12px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
  text-decoration: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.note-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.note-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.note-type {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 7px;
  border-radius: 4px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-3);
}

.note-type[data-type="highlight"] {
  background: color-mix(in srgb, #facc15 25%, transparent);
  color: #a16207;
}

.note-type[data-type="heading"] {
  background: color-mix(in srgb, var(--vp-c-brand-1) 15%, transparent);
  color: var(--vp-c-brand-1);
}

.note-date {
  font-size: 11px;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}

.note-title {
  display: block;
  font-weight: 600;
  font-size: 13px;
  color: var(--vp-c-text-1);
  margin-bottom: 4px;
}

.note-body {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 13px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  margin-bottom: 6px;
}

.note-path {
  display: block;
  font-size: 10px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-btn {
  background: none;
  border: none;
  color: var(--vp-c-text-3);
  cursor: pointer;
  padding: 10px 6px;
  opacity: 0;
  transition: opacity 0.15s, color 0.15s;
}

.note-row:hover .delete-btn,
.delete-btn:focus-visible {
  opacity: 1;
}

.delete-btn:hover {
  color: var(--vp-c-danger-1, #e53e3e);
}
</style>