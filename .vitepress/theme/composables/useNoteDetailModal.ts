import { ref } from 'vue'
import type { Note } from './useStorage'

const visible = ref(false)
const note = ref<Note | null>(null)

export function openNoteDetailModal(target: Note) {
  note.value = target
  visible.value = true
}

export function closeNoteDetailModal() {
  visible.value = false
  note.value = null
}

export function useNoteDetailModal() {
  return {
    visible,
    note,
    openNoteDetailModal,
    closeNoteDetailModal,
  }
}