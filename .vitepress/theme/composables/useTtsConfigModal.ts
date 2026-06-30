import { ref } from 'vue'

const visible = ref(false)

export function openTtsConfigModal(): void {
  visible.value = true
}

export function closeTtsConfigModal(): void {
  visible.value = false
}

export function useTtsConfigModal() {
  return {
    visible,
    openTtsConfigModal,
    closeTtsConfigModal,
  }
}