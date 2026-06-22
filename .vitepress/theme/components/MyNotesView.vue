<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAnnotations, loadAnnotations } from '../composables/useAnnotations'
import { handbookLink } from '../utils/handbookLink'
import { normalizePagePath } from '../utils/normalizePagePath'

const { notes, removeNote, loaded } = useAnnotations()
const search = ref('')

onMounted(() => loadAnnotations())

const ANCHOR_LABELS = {
  free: 'Page note',
  heading: 'Section note',
  highlight: 'Highlight note',
}

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  const sorted = [...notes.value].sort((a, b) => b.updatedAt - a.updatedAt)
  if (!q) return sorted
  return sorted.filter(n =>
    n.title.toLowerCase().includes(q) ||
    n.body.toLowerCase().includes(q) ||
    normalizePagePath(n.pagePath).toLowerCase().includes(q)
  )
})

const grouped = computed(() => {
  const groups = {}
  for (const note of filtered.value) {
    const path = normalizePagePath(note.pagePath)
    const section = path.split('/').filter(Boolean)[0] || 'other'
    if (!groups[section]) groups[section] = []
    groups[section].push({ ...note, pagePath: path })
  }
  return groups
})

function formatDate(ts) {
  return new Date(ts).toLocaleDateString()
}

function anchorLabel(note) {
  return ANCHOR_LABELS[note.anchorType] ?? 'Note'
}
</script>

<template>
  <div class="my-notes">
    <input
      v-model="search"
      type="search"
      placeholder="Search your notes..."
      class="search-input"
      aria-label="Search notes"
    />

    <p v-if="!loaded" class="status">Loading your notes…</p>

    <p v-else-if="!notes.length" class="empty">
      No notes yet. On any handbook page you can:
      <strong>Add page note</strong> at the bottom,
      <strong>+</strong> on a section heading,
      or select text and click <strong>Note</strong>.
    </p>

    <p v-else-if="!filtered.length" class="empty">No notes match your search.</p>

    <div v-for="(items, section) in grouped" :key="section" class="section-group">
      <h3>{{ section }}</h3>
      <ul>
        <li v-for="note in items" :key="note.id">
          <a :href="handbookLink(note.pagePath)" class="note-link">
            <span class="note-head">
              <span class="note-title">{{ note.title || 'Untitled' }}</span>
              <span class="note-type">{{ anchorLabel(note) }}</span>
            </span>
            <span class="note-body">{{ note.body }}</span>
            <span class="note-meta">{{ formatDate(note.updatedAt) }} · {{ note.pagePath }}</span>
          </a>
          <button class="delete-btn" aria-label="Delete note" @click="removeNote(note.id)">✕</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.my-notes {
  max-width: 720px;
}

.search-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  font-size: 14px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  margin-bottom: 24px;
}

.status,
.empty {
  color: var(--vp-c-text-3);
  font-size: 14px;
  line-height: 1.6;
}

.section-group {
  margin-bottom: 24px;
}

.section-group h3 {
  font-size: 14px;
  text-transform: capitalize;
  color: var(--vp-c-text-2);
  margin: 0 0 8px;
}

.section-group ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.section-group li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.note-link {
  flex: 1;
  display: block;
  padding: 12px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  text-decoration: none;
  transition: border-color 0.15s;
}

.note-link:hover {
  border-color: var(--vp-c-brand-1);
}

.note-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.note-title {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.note-type {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}

.note-body {
  display: block;
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin-bottom: 4px;
}

.note-meta {
  display: block;
  font-size: 11px;
  color: var(--vp-c-text-3);
}

.delete-btn {
  background: none;
  border: none;
  color: var(--vp-c-text-3);
  cursor: pointer;
  padding: 8px;
}
</style>