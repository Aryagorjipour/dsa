import { showToast } from '../composables/useToast'
import { assertOnline } from './networkFeatures'

export function openExternal(url: string, feature: 'external-link' | 'wandbox' = 'external-link') {
  if (typeof window === 'undefined') return

  const check = assertOnline(feature, navigator.onLine)
  if (!check.ok) {
    showToast(check.message, undefined, 5000)
    return
  }

  window.open(url, '_blank', 'noopener')
}