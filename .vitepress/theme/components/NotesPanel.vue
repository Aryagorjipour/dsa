<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAnnotations, loadAnnotations } from '../composables/useAnnotations'
import { usePageNotesRail } from '../composables/usePageNotesRail'
import { handbookLink } from '../utils/handbookLink'
import { scrollToNote } from '../utils/scrollToNote'
import { sortNotesByPagePosition, isMarginNotesMobile } from '../utils/noteLayout'
import { showToast } from '../composables/useToast'
import { usePageActions } from '../composables/usePageActions'

const PREVIEW_LIMIT = 3

const { pageNotes, pageHighlights, highlights, loaded, toggleHighlightsVisible, highlightsVisible, removeNote } = useAnnotations()
const { openPageNotesRail } = usePageNotesRail()

const orderedPageNotes = computed(() => sortNotesByPagePosition(pageNotes.value, highlights.value))
const collapsed = ref(true)

const noteCount = computed(() => pageNotes.value.length)
const highlightCount = computed(() => pageHighlights.value.length)

const typeCounts = computed(() => {
  const counts = { highlight: 0, heading: 0, free: 0 }
  for (const note of pageNotes.value) {
    if (note.anchorType in counts) counts[note.anchorType]++
  }
  return counts
})

const hasManyNotes = computed(() => noteCount.value > PREVIEW_LIMIT)
const previewNotes = computed(() => orderedPageNotes.value.slice(0, PREVIEW_LIMIT))

const marginNotesAvailable = computed(() => !isMarginNotesMobile())

const { pageNote, isProjectPage, sharePage, editPageNote, giveToAI } = usePageActions()

onMounted(async () => {
  await loadAnnotations()
})

async function goToNote(note) {
  if (!loaded.value) await loadAnnotations()

  const ok = await scrollToNote(note, { highlights: highlights.value })
  if (!ok) showToast('Could not find this note on the page')
}

function openOnPage() {
  if (!marginNotesAvailable.value) {
    showToast('Page notes overlay is available on wider screens')
    return
  }
  openPageNotesRail()
}
</script>

<template>
  <div class="notes-panel">
    <button
      class="notes-toggle"
      :aria-expanded="!collapsed"
      @click="collapsed = !collapsed"
    >
      <span class="toggle-label">This page</span>
      <span v-if="noteCount || highlightCount" class="toggle-badge">
        {{ noteCount || highlightCount }}
      </span>
      <span class="arrow" aria-hidden="true">{{ collapsed ? '▸' : '▾' }}</span>
    </button>

    <div class="page-actions-quick">
      <button
        type="button"
        class="page-action-btn"
        :class="{ 'has-note': pageNote }"
        @click="editPageNote"
      >
        {{ pageNote ? 'Edit page note' : 'Add page note' }}
      </button>
      <button
        type="button"
        class="page-action-btn share-icon-btn"
        aria-label="Share this page"
        title="Copy link to share"
        @click="sharePage"
      >
        <span class="share-icon" aria-hidden="true">⎘</span>
      </button>
      <button type="button" class="page-action-btn" @click="giveToAI">
        {{ isProjectPage ? 'Mentor' : 'Give to AI' }}
      </button>
    </div>

    <div v-if="!collapsed" class="notes-content">
      <p v-if="!noteCount && !highlightCount" class="empty">
        Select text to highlight, or use <strong>+</strong> on headings to add notes.
      </p>

      <template v-else>
        <div class="stats-row">
          <span v-if="noteCount" class="stat">{{ noteCount }} note{{ noteCount === 1 ? '' : 's' }}</span>
          <span v-if="noteCount && highlightCount" class="stat-sep">·</span>
          <span v-if="highlightCount" class="stat">{{ highlightCount }} highlight{{ highlightCount === 1 ? '' : 's' }}</span>
        </div>

        <ul v-if="noteCount" class="type-breakdown">
          <li v-if="typeCounts.highlight">
            <span class="type-dot highlight" aria-hidden="true" />
            {{ typeCounts.highlight }} on highlights
          </li>
          <li v-if="typeCounts.heading">
            <span class="type-dot heading" aria-hidden="true" />
            {{ typeCounts.heading }} on sections
          </li>
          <li v-if="typeCounts.free">
            <span class="type-dot free" aria-hidden="true" />
            {{ typeCounts.free }} page note{{ typeCounts.free === 1 ? '' : 's' }}
          </li>
        </ul>

        <div class="actions">
          <button
            v-if="noteCount"
            type="button"
            class="action-primary"
            :title="marginNotesAvailable ? 'Show notes beside their passages (Shift+N)' : 'Available on wider screens'"
            @click="openOnPage"
          >
            Show on page
            <kbd v-if="marginNotesAvailable">⇧N</kbd>
          </button>
          <a :href="handbookLink('/my-notes')" class="action-link">All notes →</a>
        </div>

        <div v-if="noteCount" class="preview-section">
          <p class="preview-label">
            {{ hasManyNotes ? `First ${PREVIEW_LIMIT} in reading order` : 'In reading order' }}
          </p>
          <ul class="preview-list">
            <li v-for="note in previewNotes" :key="note.id">
              <button type="button" class="preview-item" @click="goToNote(note)">
                <span class="preview-type">{{ note.anchorType === 'highlight' ? 'HL' : note.anchorType === 'heading' ? '§' : 'Pg' }}</span>
                <span class="preview-text">{{ note.body || note.title || 'Note' }}</span>
              </button>
              <button class="preview-delete" aria-label="Delete note" @click.stop="removeNote(note.id)">✕</button>
            </li>
          </ul>
          <button
            v-if="hasManyNotes"
            type="button"
            class="show-more"
            @click="openOnPage"
          >
            View all {{ noteCount }} on page
          </button>
        </div>
      </template>

      <div v-if="highlightCount" class="hl-row">
        <span class="hl-label">Highlights visible</span>
        <button
          type="button"
          class="hl-toggle"
          :aria-pressed="highlightsVisible"
          :title="highlightsVisible ? 'Hide highlights' : 'Show highlights'"
          @click="toggleHighlightsVisible"
        >
          {{ highlightsVisible ? 'On' : 'Off' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notes-panel {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.notes-toggle {
  width: 100%;
  background: none;
  border: none;
  font-weight: 600;
  font-size: 13px;
  color: var(--vp-c-text-1);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.toggle-label {
  flex: 1;
  text-align: left;
}

.toggle-badge {
  display: inline-flex;
  min-width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  border-radius: 9999px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 11px;
  font-weight: 700;
}

.arrow {
  color: var(--vp-c-text-3);
  font-size: 11px;
}

.page-actions-quick {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 6px;
  margin-top: 8px;
  align-items: stretch;
}

.page-action-btn {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  border-radius: 6px;
  font-size: 11px;
  color: var(--vp-c-text-1);
  cursor: pointer;
  text-align: center;
  transition: border-color 0.15s, color 0.15s;
}

.page-action-btn.share-icon-btn {
  width: 36px;
  min-width: 36px;
  padding: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--vp-c-brand-1);
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 35%, var(--vp-c-divider));
  background: color-mix(in srgb, var(--vp-c-brand-1) 8%, var(--vp-c-bg));
}

.page-action-btn.share-icon-btn:hover {
  border-color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 16%, var(--vp-c-bg));
}

.share-icon {
  font-size: 15px;
  line-height: 1;
}

.page-action-btn:hover {
  border-color: var(--vp-c-brand-1);
}

.page-action-btn.has-note {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.notes-content {
  margin-top: 10px;
}

.empty {
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.5;
}

.stats-row {
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin-bottom: 8px;
}

.stat-sep {
  margin: 0 4px;
  color: var(--vp-c-text-3);
}

.type-breakdown {
  list-style: none;
  padding: 0;
  margin: 0 0 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.type-breakdown li {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--vp-c-text-3);
}

.type-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.type-dot.highlight {
  background: #facc15;
}

.type-dot.heading {
  background: var(--vp-c-brand-1);
}

.type-dot.free {
  background: var(--vp-c-text-3);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
}

.action-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 7px 10px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.action-primary:hover {
  background: color-mix(in srgb, var(--vp-c-brand-1) 20%, transparent);
}

.action-primary kbd {
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  font-family: inherit;
  color: var(--vp-c-text-3);
}

.action-link {
  font-size: 11px;
  color: var(--vp-c-text-3);
  text-decoration: none;
  text-align: center;
}

.action-link:hover {
  color: var(--vp-c-brand-1);
}

.preview-section {
  margin-top: 4px;
}

.preview-label {
  margin: 0 0 6px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--vp-c-text-3);
}

.preview-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 140px;
  overflow-y: auto;
}

.preview-list li {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 3px;
}

.preview-item {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  text-align: left;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 5px 7px;
  cursor: pointer;
  font-size: 11px;
}

.preview-item:hover {
  border-color: var(--vp-c-brand-1);
}

.preview-type {
  flex-shrink: 0;
  font-size: 9px;
  font-weight: 700;
  color: var(--vp-c-text-3);
  width: 14px;
  text-align: center;
}

.preview-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--vp-c-text-2);
}

.preview-delete {
  background: none;
  border: none;
  color: var(--vp-c-text-3);
  cursor: pointer;
  font-size: 10px;
  padding: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}

.preview-list li:hover .preview-delete,
.preview-delete:focus-visible {
  opacity: 1;
}

.show-more {
  width: 100%;
  margin-top: 6px;
  padding: 5px;
  background: none;
  border: none;
  font-size: 11px;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  text-align: left;
}

.show-more:hover {
  text-decoration: underline;
}

.hl-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--vp-c-divider);
}

.hl-label {
  font-size: 11px;
  color: var(--vp-c-text-3);
}

.hl-toggle {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 9999px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  cursor: pointer;
}

.hl-toggle[aria-pressed="true"] {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
</style>