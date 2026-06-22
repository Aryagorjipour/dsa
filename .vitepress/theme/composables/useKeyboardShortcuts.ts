import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useData } from 'vitepress'
import { handbookLink } from '../utils/handbookLink'

export interface ShortcutEntry {
  keys: string
  label: string
}

export interface ShortcutGroup {
  title: string
  items: ShortcutEntry[]
}

export const shortcutsOpen = ref(false)

export const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Go to',
    items: [
      { keys: '⇧H', label: 'Handbook' },
      { keys: '⇧P', label: 'Playground' },
      { keys: '⇧M', label: 'My Notes' },
      { keys: '⇧Q', label: 'Quizzes' },
      { keys: '⇧L', label: 'Project Lab' },
    ],
  },
  {
    title: 'Reading',
    items: [
      { keys: '⇧F', label: 'Focus mode' },
      { keys: '⇧N', label: 'Page notes overlay' },
      { keys: 'Esc', label: 'Close overlay or exit focus' },
    ],
  },
  {
    title: 'Appearance',
    items: [
      { keys: '⇧T', label: 'Toggle dark / light theme' },
    ],
  },
  {
    title: 'Help',
    items: [
      { keys: '⇧?', label: 'Keyboard shortcuts' },
    ],
  },
]

const NAV_ROUTES: Record<string, string> = {
  h: '/README',
  p: '/playground',
  m: '/my-notes',
  q: '/quizzes',
  l: '/projects/README',
}

let listenerCount = 0

export function isTypingTarget(e: KeyboardEvent): boolean {
  const target = e.target as HTMLElement | null
  return !!target?.matches('input, textarea, select, [contenteditable="true"]')
}

function isShiftCombo(e: KeyboardEvent): boolean {
  return e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey
}

function isShiftLetter(e: KeyboardEvent, letter: string): boolean {
  return isShiftCombo(e) && e.key.toLowerCase() === letter.toLowerCase()
}

function isShiftQuestion(e: KeyboardEvent): boolean {
  return isShiftCombo(e) && (e.key === '?' || e.code === 'Slash')
}

export function openShortcuts() {
  shortcutsOpen.value = true
}

export function closeShortcuts() {
  shortcutsOpen.value = false
}

export function toggleShortcuts() {
  shortcutsOpen.value = !shortcutsOpen.value
}

export function useKeyboardShortcuts() {
  const router = useRouter()
  const { isDark } = useData()

  function handleKey(e: KeyboardEvent) {
    if (isTypingTarget(e)) return

    if (shortcutsOpen.value && e.key === 'Escape') {
      e.preventDefault()
      e.stopImmediatePropagation()
      closeShortcuts()
      return
    }

    if (isShiftQuestion(e)) {
      e.preventDefault()
      toggleShortcuts()
      return
    }

    if (isShiftLetter(e, 't')) {
      e.preventDefault()
      isDark.value = !isDark.value
      return
    }

    for (const [letter, path] of Object.entries(NAV_ROUTES)) {
      if (isShiftLetter(e, letter)) {
        e.preventDefault()
        closeShortcuts()
        router.go(handbookLink(path))
        return
      }
    }
  }

  onMounted(() => {
    if (listenerCount === 0) {
      document.addEventListener('keydown', handleKey, true)
    }
    listenerCount++
  })

  onUnmounted(() => {
    listenerCount--
    if (listenerCount === 0) {
      document.removeEventListener('keydown', handleKey, true)
    }
  })

  return { shortcutsOpen, openShortcuts, closeShortcuts, toggleShortcuts }
}