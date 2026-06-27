import { ref, onMounted, computed } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type InstallBrowser =
  | 'chromium'
  | 'ios'
  | 'firefox-desktop'
  | 'firefox-android'
  | 'zen'
  | 'generic'

const canInstall = ref(false)
const isIos = ref(false)
const isStandalone = ref(false)
const swRegistered = ref(false)
const installBrowser = ref<InstallBrowser>('generic')

let deferredPrompt: BeforeInstallPromptEvent | null = null

function detectBrowser(): InstallBrowser {
  if (typeof navigator === 'undefined') return 'generic'
  const ua = navigator.userAgent

  if (/iphone|ipad|ipod/i.test(ua)) return 'ios'
  if (/Zen\//i.test(ua)) return 'zen'

  const isFirefox = /firefox/i.test(ua) && !/seamonkey/i.test(ua)
  if (isFirefox) {
    return /android/i.test(ua) ? 'firefox-android' : 'firefox-desktop'
  }

  return 'generic'
}

async function pollSwRegistration(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false
  try {
    const reg = await navigator.serviceWorker.getRegistration()
    return !!reg?.active
  } catch {
    return false
  }
}

export function usePwaInstall() {
  onMounted(() => {
    if (typeof window === 'undefined') return

    installBrowser.value = detectBrowser()
    isIos.value = installBrowser.value === 'ios'
    isStandalone.value =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault()
      deferredPrompt = event as BeforeInstallPromptEvent
      canInstall.value = true
      installBrowser.value = 'chromium'
    })

    void pollSwRegistration().then(ok => {
      swRegistered.value = ok
    })

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        void pollSwRegistration().then(ok => {
          swRegistered.value = ok
        })
      })
    }
  })

  const installable = computed(() => swRegistered.value && !isStandalone.value)

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
    swRegistered,
    installable,
    installBrowser,
    promptInstall,
  }
}