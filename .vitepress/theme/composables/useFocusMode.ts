import { ref, onMounted, onUnmounted } from 'vue'

const FOCUS_KEY = 'dsa-focus-mode'
const isFocusMode = ref(false)
let listenerCount = 0

function applyFocusMode(active: boolean) {
  isFocusMode.value = active
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('focus-mode', active)
    try {
      localStorage.setItem(FOCUS_KEY, active ? '1' : '0')
    } catch {
      /* ignore quota errors */
    }
  }
}

export function toggleFocusMode() {
  applyFocusMode(!isFocusMode.value)
}

function handleKey(e: KeyboardEvent) {
  const target = e.target as HTMLElement | null
  if (target?.matches('input, textarea, select, [contenteditable="true"]')) return

  if (e.key === 'F' && e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault()
    toggleFocusMode()
  }
  if (e.key === 'Escape' && isFocusMode.value) {
    applyFocusMode(false)
  }
}

export function useFocusMode() {
  onMounted(() => {
    if (listenerCount === 0) {
      try {
        if (localStorage.getItem(FOCUS_KEY) === '1') {
          applyFocusMode(true)
        }
      } catch {
        /* ignore */
      }
      document.addEventListener('keydown', handleKey)
    }
    listenerCount++
  })

  onUnmounted(() => {
    listenerCount--
    if (listenerCount === 0) {
      document.removeEventListener('keydown', handleKey)
    }
  })

  return { isFocusMode, toggleFocusMode, applyFocusMode }
}