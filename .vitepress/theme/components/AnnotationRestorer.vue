<script setup>
import { watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import { useAnnotations, loadAnnotations } from '../composables/useAnnotations'
import { assignBlockIds } from '../utils/assignBlockIds'
import { applyHighlightToDOM } from '../utils/highlightRestorer'

const route = useRoute()
const { pageHighlights, highlightsVisible, loaded } = useAnnotations()

function restoreHighlights() {
  if (!highlightsVisible.value) return
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
      applyHighlightToDOM(hl)
    }
  })
}

onMounted(async () => {
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

watch(pageHighlights, restoreHighlights)
watch(highlightsVisible, visible => {
  document.documentElement.classList.toggle('highlights-hidden', !visible)
  if (visible) restoreHighlights()
})
</script>

<template>
  <span style="display:none" />
</template>