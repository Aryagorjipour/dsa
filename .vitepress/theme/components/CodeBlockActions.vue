<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
let observer = null

function detectLang(pre) {
  const code = pre.querySelector('code')
  if (!code) return 'go'
  const classes = [...code.classList]
  if (classes.some(c => c.includes('csharp') || c.includes('cs'))) return 'csharp'
  if (classes.some(c => c.includes('go'))) return 'go'
  const text = code.textContent || ''
  if (text.includes('package main') || text.includes('func ')) return 'go'
  if (text.includes('using System') || text.includes('class Program')) return 'csharp'
  return 'go'
}

function isRunnable(pre) {
  const code = pre.querySelector('code')?.textContent || ''
  return code.includes('func main') || code.includes('static void Main') || code.length > 50
}

function injectButtons() {
  const doc = document.querySelector('.vp-doc')
  if (!doc) return

  doc.querySelectorAll('pre').forEach(pre => {
    if (pre.querySelector('.dsa-code-action')) return
    if (!isRunnable(pre)) return

    const lang = detectLang(pre)
    const code = pre.querySelector('code')?.textContent || ''

    const btn = document.createElement('button')
    btn.className = 'dsa-code-action'
    btn.textContent = 'Try in Playground'
    btn.title = 'Open this code in the Playground'
    btn.addEventListener('click', e => {
      e.stopPropagation()
      const params = new URLSearchParams({
        from: route.path,
        lang,
        code: encodeURIComponent(code),
      })
      const base = import.meta.env.BASE_URL || '/dsa/'
      window.location.href = `${base}playground?${params.toString()}`
    })

    pre.style.position = 'relative'
    pre.appendChild(btn)
  })
}

function cleanup() {
  document.querySelectorAll('.dsa-code-action').forEach(el => el.remove())
}

onMounted(() => {
  injectButtons()
  observer = new MutationObserver(injectButtons)
  const doc = document.querySelector('.vp-doc')
  if (doc) observer.observe(doc, { childList: true, subtree: true })
})

onUnmounted(() => {
  observer?.disconnect()
  cleanup()
})

watch(() => route.path, () => {
  cleanup()
  setTimeout(injectButtons, 100)
})
</script>

<template>
  <span style="display:none" />
</template>