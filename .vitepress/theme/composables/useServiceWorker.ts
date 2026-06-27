import { useRegisterSW } from 'virtual:pwa-register/vue'
import { showToast } from './useToast'

let swApi: ReturnType<typeof useRegisterSW> | null = null

export function useServiceWorker() {
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