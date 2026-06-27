import { ref, type Ref } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { showToast } from './useToast'

type ServiceWorkerApi = {
  needRefresh: Ref<boolean>
  offlineReady: Ref<boolean>
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>
}

let swApi: ServiceWorkerApi | null = null

function createNoopServiceWorkerApi(): ServiceWorkerApi {
  return {
    needRefresh: ref(false),
    offlineReady: ref(false),
    updateServiceWorker: async () => {},
  }
}

export function useServiceWorker(): ServiceWorkerApi {
  if (import.meta.env.SSR) {
    return createNoopServiceWorkerApi()
  }

  if (!swApi) {
    swApi = useRegisterSW({
      immediate: true,
      onOfflineReady() {
        const key = 'dsa-pwa-offline-ready'
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, '1')
          showToast('Handbook ready for offline reading', undefined, 6000)
        }
      },
    })
  }

  return swApi
}