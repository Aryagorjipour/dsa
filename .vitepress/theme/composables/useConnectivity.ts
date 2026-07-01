import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  type NetworkFeature,
  requiresNetwork,
  assertOnline as assertOnlinePure,
  getOfflineCopy,
} from '../utils/networkFeatures'

const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)
let listenerCount = 0

function handleOnline() {
  isOnline.value = true
}

function handleOffline() {
  isOnline.value = false
}

export async function verifyOnlineStatus(): Promise<boolean> {
  if (typeof navigator === 'undefined') return true
  if (navigator.onLine) {
    isOnline.value = true
    return true
  }

  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 2500)
    await fetch(`${window.location.origin}/favicon.ico`, {
      method: 'HEAD',
      cache: 'no-store',
      signal: ctrl.signal,
    })
    clearTimeout(timer)
    isOnline.value = true
    return true
  } catch {
    isOnline.value = false
    return false
  }
}

export function useConnectivity() {
  onMounted(() => {
    if (typeof window === 'undefined') return
    if (listenerCount++ === 0) {
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
      isOnline.value = navigator.onLine

      if ('serviceWorker' in navigator) {
        const recoverFromStaleOfflinePage = () => {
          if (document.body?.dataset.dsaOfflineRecovering === '1') return
          const text = document.body?.textContent?.trim() ?? ''
          const isBareOffline =
            text === 'Offline' ||
            (text.length < 32 && /^offline$/i.test(text))
          if (isBareOffline) {
            document.body.dataset.dsaOfflineRecovering = '1'
            void navigator.serviceWorker.getRegistration().then(reg => reg?.update())
            window.location.reload()
          }
        }

        recoverFromStaleOfflinePage()
        navigator.serviceWorker.addEventListener('controllerchange', recoverFromStaleOfflinePage)
      }
    }
  })

  onUnmounted(() => {
    if (--listenerCount <= 0) {
      listenerCount = 0
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  })

  function assertOnline(feature: NetworkFeature) {
    return assertOnlinePure(feature, isOnline.value)
  }

  return {
    isOnline: computed(() => isOnline.value),
    requiresNetwork,
    assertOnline,
    getOfflineCopy,
  }
}