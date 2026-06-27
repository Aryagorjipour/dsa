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

export function useConnectivity() {
  onMounted(() => {
    if (typeof window === 'undefined') return
    if (listenerCount++ === 0) {
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
      isOnline.value = navigator.onLine

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (document.body?.dataset.dsaOfflineRecovering === '1') return
          const isBareOffline = document.body?.childElementCount === 1
            && document.body?.textContent?.trim() === 'Offline'
          if (isBareOffline) {
            document.body.dataset.dsaOfflineRecovering = '1'
            window.location.reload()
          }
        })
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