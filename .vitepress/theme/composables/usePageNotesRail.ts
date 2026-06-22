import { ref, onMounted, onUnmounted } from 'vue'

const isOpen = ref(false)
const activeNoteId = ref<string | null>(null)
const side = ref<'left' | 'right'>('right')
let listenerCount = 0

export function computeRailSide(): 'left' | 'right' {
  const doc =
    document.querySelector('.vp-doc .content-container') ||
    document.querySelector('.vp-doc .content') ||
    document.querySelector('.vp-doc')
  if (!doc) return 'right'

  const rect = doc.getBoundingClientRect()
  const leftSpace = rect.left
  const rightSpace = window.innerWidth - rect.right
  return leftSpace >= rightSpace ? 'left' : 'right'
}

function applySide() {
  side.value = computeRailSide()
}

export function openPageNotesRail(noteId?: string) {
  applySide()
  isOpen.value = true
  if (noteId) activeNoteId.value = noteId
}

export function closePageNotesRail() {
  isOpen.value = false
  activeNoteId.value = null
}

export function togglePageNotesRail() {
  if (isOpen.value) {
    closePageNotesRail()
  } else {
    openPageNotesRail()
  }
}

export function setActiveNoteId(id: string | null) {
  activeNoteId.value = id
}

function handleKey(e: KeyboardEvent) {
  const target = e.target as HTMLElement | null
  if (target?.matches('input, textarea, select, [contenteditable="true"]')) return

  if (e.key === 'N' && e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault()
    togglePageNotesRail()
  }
  if (e.key === 'Escape' && isOpen.value) {
    closePageNotesRail()
  }
}

export function usePageNotesRail() {
  onMounted(() => {
    if (listenerCount === 0) {
      document.addEventListener('keydown', handleKey)
      window.addEventListener('resize', applySide)
    }
    listenerCount++
  })

  onUnmounted(() => {
    listenerCount--
    if (listenerCount === 0) {
      document.removeEventListener('keydown', handleKey)
      window.removeEventListener('resize', applySide)
    }
  })

  return {
    isOpen,
    activeNoteId,
    side,
    openPageNotesRail,
    closePageNotesRail,
    togglePageNotesRail,
    setActiveNoteId,
    computeRailSide,
  }
}