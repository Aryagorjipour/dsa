<script setup>
import { watch, onMounted } from 'vue'
import { useRoute } from 'vitepress'
import { useAnnotations, loadAnnotations } from '../composables/useAnnotations'
import { applyHighlightToDOM } from '../utils/highlightRestorer'

const route = useRoute()
const { pageHighlights, highlightsVisible, loaded } = useAnnotations()

function restoreHighlights() {
  if (!highlightsVisible.value) return
  document.querySelectorAll('mark.dsa-hl').forEach(el => {
    const parent = el.parentNode
    if (!parent) return
    while (el.firstChild) parent.insertBefore(el.firstChild, el)
    parent.removeChild(el)
    parent.normalize()
  })

  requestAnimationFrame(() => {
    for (const hl of pageHighlights.value) {
      applyHighlightToDOM(hl)
    }
  })
}

onMounted(async () => {
  await loadAnnotations()
  setTimeout(restoreHighlights, 200)
})

watch(() => route.path, () => {
  setTimeout(restoreHighlights, 300)
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