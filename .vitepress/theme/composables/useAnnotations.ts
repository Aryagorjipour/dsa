import { ref, computed } from 'vue'
import { useRoute } from 'vitepress'
import { pagePathKey, pathsMatch } from '../utils/pagePathKey'
import { normalizePagePath } from '../utils/normalizePagePath'
import { removeHighlightFromDOM } from '../utils/highlightRestorer'
import {
  type Highlight,
  type Note,
  getHighlights,
  setHighlights,
  getNotes,
  setNotes,
  getHighlightsVisible,
  setHighlightsVisible,
  generateId,
} from './useStorage'

const highlights = ref<Highlight[]>([])
const notes = ref<Note[]>([])
const highlightsVisible = ref(true)
const loaded = ref(false)

export async function loadAnnotations() {
  const [h, n, vis] = await Promise.all([
    getHighlights(),
    getNotes(),
    getHighlightsVisible(),
  ])
  highlights.value = h.map(item => ({
    ...item,
    pagePath: normalizePagePath(item.pagePath),
  }))
  notes.value = n.map(item => ({
    ...item,
    pagePath: normalizePagePath(item.pagePath),
  }))
  highlightsVisible.value = vis
  loaded.value = true
}

export function useAnnotations() {
  const route = useRoute()

  const currentPagePath = computed(() => pagePathKey(route.path))

  const pageHighlights = computed(() =>
    highlights.value.filter(h => pathsMatch(h.pagePath, route.path))
  )

  const pageNotes = computed(() =>
    notes.value.filter(n => pathsMatch(n.pagePath, route.path))
  )

  async function addHighlight(data: Omit<Highlight, 'id' | 'createdAt'>) {
    const highlight: Highlight = {
      ...data,
      pagePath: normalizePagePath(data.pagePath),
      id: generateId(),
      createdAt: Date.now(),
    }
    highlights.value = [...highlights.value, highlight]
    await setHighlights(highlights.value)
    return highlight
  }

  async function removeHighlight(id: string) {
    removeHighlightFromDOM(id)
    highlights.value = highlights.value.filter(h => h.id !== id)
    notes.value = notes.value.filter(n => n.anchorId !== id)
    await Promise.all([setHighlights(highlights.value), setNotes(notes.value)])
  }

  async function addNote(data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = Date.now()
    const note: Note = {
      ...data,
      pagePath: normalizePagePath(data.pagePath),
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }
    notes.value = [...notes.value, note]
    await setNotes(notes.value)
    return note
  }

  async function updateNote(id: string, body: string, title?: string) {
    notes.value = notes.value.map(n =>
      n.id === id
        ? { ...n, body, title: title ?? n.title, updatedAt: Date.now() }
        : n
    )
    await setNotes(notes.value)
  }

  async function removeNote(id: string) {
    notes.value = notes.value.filter(n => n.id !== id)
    highlights.value = highlights.value.map(h =>
      h.noteId === id ? { ...h, noteId: undefined } : h
    )
    await Promise.all([setNotes(notes.value), setHighlights(highlights.value)])
  }

  async function toggleHighlightsVisible() {
    highlightsVisible.value = !highlightsVisible.value
    await setHighlightsVisible(highlightsVisible.value)
    document.documentElement.classList.toggle('highlights-hidden', !highlightsVisible.value)
  }

  return {
    highlights,
    notes,
    highlightsVisible,
    loaded,
    currentPagePath,
    pageHighlights,
    pageNotes,
    addHighlight,
    removeHighlight,
    addNote,
    updateNote,
    removeNote,
    toggleHighlightsVisible,
    loadAnnotations,
  }
}