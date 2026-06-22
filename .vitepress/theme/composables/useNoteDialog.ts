import { ref, nextTick } from 'vue'

export interface NoteDialogOptions {
  title: string
  placeholder?: string
  initial?: string
}

const visible = ref(false)
const title = ref('')
const placeholder = ref('')
const body = ref('')

let resolver: ((value: string | null) => void) | null = null

export function openNoteDialog(options: NoteDialogOptions): Promise<string | null> {
  if (resolver) {
    resolver(null)
    resolver = null
  }

  title.value = options.title
  placeholder.value = options.placeholder ?? 'Write your note…'
  body.value = options.initial ?? ''
  visible.value = true

  return new Promise(resolve => {
    resolver = resolve
    nextTick(() => {
      document.getElementById('dsa-note-dialog-input')?.focus()
    })
  })
}

export function confirmNoteDialog() {
  const value = body.value.trim()
  visible.value = false
  resolver?.(value || null)
  resolver = null
  body.value = ''
}

export function cancelNoteDialog() {
  visible.value = false
  resolver?.(null)
  resolver = null
  body.value = ''
}

export function useNoteDialog() {
  return {
    visible,
    title,
    placeholder,
    body,
    openNoteDialog,
    confirmNoteDialog,
    cancelNoteDialog,
  }
}