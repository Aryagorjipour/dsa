<script setup>
import { ref, onMounted } from 'vue'
import { useAnnotations, loadAnnotations } from '../composables/useAnnotations'
import { handbookLink } from '../utils/handbookLink'
import { scrollToNote } from '../utils/scrollToNote'
import { showToast } from '../composables/useToast'

const { pageNotes, pageHighlights, highlights, loaded, toggleHighlightsVisible, highlightsVisible, removeNote } = useAnnotations()
const collapsed = ref(false)

onMounted(async () => {
  await loadAnnotations()
})

async function goToNote(note) {
  if (!loaded.value) await loadAnnotations()

  const ok = await scrollToNote(note, { highlights: highlights.value })
  if (!ok) showToast('Could not find this note on the page')
}
</script>

<template>
  <div class="notes-panel">
    <div class="notes-header">
      <button
        class="notes-toggle"
        :aria-expanded="!collapsed"
        @click="collapsed = !collapsed"
      >
        My Notes ({{ pageNotes.length }})
        <span class="arrow">{{ collapsed ? '▸' : '▾' }}</span>
      </button>
      <button
        v-if="pageHighlights.length"
        class="hl-toggle"
        :title="highlightsVisible ? 'Hide highlights' : 'Show highlights'"
        @click="toggleHighlightsVisible"
      >
        {{ highlightsVisible ? '◉' : '○' }}
      </button>
    </div>

    <div v-if="!collapsed" class="notes-content">
      <p v-if="!pageNotes.length" class="empty">
        Select text to highlight or add notes.
      </p>
      <ul v-else>
        <li v-for="note in pageNotes" :key="note.id">
          <button class="note-item" @click="goToNote(note)">
            <span class="note-title">{{ note.title || 'Note' }}</span>
            <span class="note-preview">{{ note.body.slice(0, 80) }}</span>
          </button>
          <button class="note-delete" aria-label="Delete note" @click="removeNote(note.id)">✕</button>
        </li>
      </ul>
      <a :href="handbookLink('/my-notes')" class="all-notes-link">View all notes →</a>
    </div>
  </div>
</template>

<style scoped>
.notes-panel {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.notes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.notes-toggle {
  background: none;
  border: none;
  font-weight: 600;
  font-size: 13px;
  color: var(--vp-c-text-1);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.hl-toggle {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: var(--vp-c-text-2);
  padding: 2px 6px;
}

.notes-content {
  margin-top: 8px;
}

.empty {
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin: 0;
}

.notes-content ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notes-content li {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  margin-bottom: 4px;
}

.note-item {
  flex: 1;
  text-align: left;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 6px 8px;
  cursor: pointer;
  font-size: 12px;
}

.note-item:hover {
  border-color: var(--vp-c-brand-1);
}

.note-title {
  display: block;
  font-weight: 500;
  color: var(--vp-c-text-1);
  margin-bottom: 2px;
}

.note-preview {
  display: block;
  color: var(--vp-c-text-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-delete {
  background: none;
  border: none;
  color: var(--vp-c-text-3);
  cursor: pointer;
  font-size: 11px;
  padding: 4px;
}

.all-notes-link {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}
</style>