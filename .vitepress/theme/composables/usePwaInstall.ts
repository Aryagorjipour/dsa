import { ref, onMounted } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const canInstall = ref(false)
const isIos = ref(false)
const isStandalone = ref(false)
let deferredPrompt: BeforeInstallPromptEvent | null = null

export function usePwaInstall() {
  onMounted(() => {
    if (typeof window === 'undefined') return

    isIos.value = /iphone|ipad|ipod/i.test(navigator.userAgent)
    isStandalone.value =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault()
      deferredPrompt = event as BeforeInstallPromptEvent
      canInstall.value = true
    })
  })

  async function promptInstall(): Promise<boolean> {
    if (!deferredPrompt) return false
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    deferredPrompt = null
    canInstall.value = false
    return true
  }

  return {
    canInstall,
    isIos,
    isStandalone,
    promptInstall,
  }
}