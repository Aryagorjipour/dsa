<script setup>
import { watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import { useAnnotations, loadAnnotations } from '../composables/useAnnotations'
import { assignBlockIds } from '../utils/assignBlockIds'
import { ensureHighlightInDOM } from '../utils/highlightRestorer'
import { scrollToHash } from '../utils/scrollToNote'

const route = useRoute()
const { pageHighlights, highlightsVisible, loaded } = useAnnotations()

function followNoteHash() {
  const hash = window.location.hash
  if (!hash) return
  scrollToHash(hash, pageHighlights.value)
}

function restoreHighlights() {
  if (!highlightsVisible.value) {
    followNoteHash()
    return
  }
  assignBlockIds()
  document.querySelectorAll('mark.dsa-hl').forEach(el => {
    const parent = el.parentNode
    if (!parent) return
    while (el.firstChild) parent.insertBefore(el.firstChild, el)
    parent.removeChild(el)
    parent.normalize()
  })

  requestAnimationFrame(() => {
    for (const hl of pageHighlights.value) {
      ensureHighlightInDOM(hl)
    }
    followNoteHash()
  })
}

onMounted(async () => {
  window.addEventListener('hashchange', followNoteHash)
  await loadAnnotations()
  nextTick(() => {
    assignBlockIds()
    setTimeout(restoreHighlights, 200)
  })
})

watch(() => route.path, () => {
  nextTick(() => {
    assignBlockIds()
    setTimeout(restoreHighlights, 300)
  })
})

onUnmounted(() => {
  window.removeEventListener('hashchange', followNoteHash)
})

watch(pageHighlights, restoreHighlights)
watch(highlightsVisible, visible => {
  document.documentElement.classList.toggle('highlights-hidden', !visible)
  if (visible) restoreHighlights()
})
</script>

<template>
  <span style="display:none" />
</template>