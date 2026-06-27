import { onMounted, onUnmounted } from 'vue'

function measureChromeBottom(): number {
  if (typeof document === 'undefined') return 64

  const nav = document.querySelector('.VPNav')
  const localNav = document.querySelector('.VPLocalNav')
  const offlineBanner = document.querySelector('.offline-banner')

  let bottom = 0

  if (nav instanceof HTMLElement) {
    const rect = nav.getBoundingClientRect()
    bottom = Math.max(bottom, rect.bottom)
  }

  if (localNav instanceof HTMLElement && localNav.offsetParent !== null) {
    const rect = localNav.getBoundingClientRect()
    bottom = Math.max(bottom, rect.bottom)
  }

  if (offlineBanner instanceof HTMLElement) {
    const rect = offlineBanner.getBoundingClientRect()
    bottom = Math.max(bottom, rect.bottom)
  }

  if (bottom <= 0) {
    const navH = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--vp-nav-height') || '64',
      10,
    )
    return navH
  }

  return Math.round(bottom)
}

function updateChromeOffset(): void {
  const bottom = measureChromeBottom()
  document.documentElement.style.setProperty('--dsa-chrome-bottom', `${bottom}px`)
}

let observer: ResizeObserver | null = null
let listenerCount = 0

export function useChromeOffset(): void {
  onMounted(() => {
    if (typeof window === 'undefined') return
    if (listenerCount++ > 0) {
      updateChromeOffset()
      return
    }

    updateChromeOffset()

    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => updateChromeOffset())
      const watch = (sel: string) => {
        const el = document.querySelector(sel)
        if (el) observer?.observe(el)
      }
      watch('.VPNav')
      watch('.VPLocalNav')
      watch('.offline-banner')
    }

    window.addEventListener('resize', updateChromeOffset, { passive: true })
    window.addEventListener('scroll', updateChromeOffset, { passive: true })
    window.addEventListener('offline', updateChromeOffset)
    window.addEventListener('online', updateChromeOffset)
  })

  onUnmounted(() => {
    if (--listenerCount > 0) return
    observer?.disconnect()
    observer = null
    window.removeEventListener('resize', updateChromeOffset)
    window.removeEventListener('scroll', updateChromeOffset)
    window.removeEventListener('offline', updateChromeOffset)
    window.removeEventListener('online', updateChromeOffset)
  })
}