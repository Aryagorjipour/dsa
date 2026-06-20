<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAnnotations, loadAnnotations } from '../composables/useAnnotations'

const { notes, removeNote } = useAnnotations()
const search = ref('')

onMounted(() => loadAnnotations())

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return notes.value
  return notes.value.filter(n =>
    n.title.toLowerCase().includes(q) ||
    n.body.toLowerCase().includes(q) ||
    n.pagePath.toLowerCase().includes(q)
  )
})

const grouped = computed(() => {
  const groups = {}
  for (const note of filtered.value) {
    const section = note.pagePath.split('/')[1] || 'other'
    if (!groups[section]) groups[section] = []
    groups[section].push(note)
  }
  return groups
})

function formatDate(ts) {
  return new Date(ts).toLocaleDateString()
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

    <p v-if="!notes.length" class="empty">
      No notes yet. Highlight text on any handbook page and add a note.
    </p>

    <div v-for="(items, section) in grouped" :key="section" class="section-group">
      <h3>{{ section }}</h3>
      <ul>
        <li v-for="note in items" :key="note.id">
          <a :href="note.pagePath" class="note-link">
            <span class="note-title">{{ note.title || 'Untitled' }}</span>
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

.empty {
  color: var(--vp-c-text-3);
  font-size: 14px;
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

.note-title {
  display: block;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 4px;
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