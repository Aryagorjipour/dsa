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

function swScope(): string {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/')
  return base
}

async function getRegistration(): Promise<ServiceWorkerRegistration | undefined> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return undefined
  const scope = swScope()
  return (await navigator.serviceWorker.getRegistration(scope))
    ?? (await navigator.serviceWorker.getRegistration())
}

/** Activate a waiting worker and reload — used by the update prompt Refresh button. */
export async function applyServiceWorkerUpdate(): Promise<void> {
  if (typeof window === 'undefined') return
  if (!('serviceWorker' in navigator)) {
    window.location.reload()
    return
  }

  const api = useServiceWorker()
  api.needRefresh.value = false

  try {
    await api.updateServiceWorker(true)
  } catch {
    /* fall through to manual activation */
  }

  const reg = await getRegistration()
  const waiting = reg?.waiting
  if (waiting) {
    waiting.postMessage({ type: 'SKIP_WAITING' })
  }

  await new Promise<void>(resolve => {
    let done = false
    const finish = () => {
      if (done) return
      done = true
      window.clearTimeout(timer)
      window.location.reload()
      resolve()
    }

    const timer = window.setTimeout(finish, 2000)
    navigator.serviceWorker.addEventListener('controllerchange', finish, { once: true })

    if (!waiting && reg?.active) {
      finish()
    }
  })
}

export function useServiceWorker(): ServiceWorkerApi {
  if (import.meta.env.SSR) {
    return createNoopServiceWorkerApi()
  }

  if (!swApi) {
    swApi = useRegisterSW({
      immediate: true,
      onNeedReload() {
        swApi!.needRefresh.value = false
        window.location.reload()
      },
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