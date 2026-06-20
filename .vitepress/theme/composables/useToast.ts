import { ref } from 'vue'

export interface ToastMessage {
  id: number
  text: string
  action?: { label: string; onClick: () => void }
}

const toasts = ref<ToastMessage[]>([])
let nextId = 0

export function showToast(text: string, action?: ToastMessage['action'], duration = 4000) {
  const id = ++nextId
  toasts.value.push({ id, text, action })
  if (duration > 0) {
    setTimeout(() => dismissToast(id), duration)
  }
}

export function dismissToast(id: number) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

export function useToast() {
  return { toasts, showToast, dismissToast }
}