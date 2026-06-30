import { ref, onMounted, onUnmounted } from 'vue'

const coarsePointer = ref(false)
let listenerCount = 0
let mediaQuery: MediaQueryList | null = null

function sync(): void {
  coarsePointer.value = mediaQuery?.matches ?? false
}

export function useCoarsePointer() {
  onMounted(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    if (listenerCount === 0) {
      mediaQuery = window.matchMedia('(pointer: coarse)')
      sync()
      mediaQuery.addEventListener('change', sync)
    }
    listenerCount++
    sync()
  })

  onUnmounted(() => {
    listenerCount--
    if (listenerCount === 0 && mediaQuery) {
      mediaQuery.removeEventListener('change', sync)
      mediaQuery = null
    }
  })

  return { isCoarsePointer: coarsePointer }
}