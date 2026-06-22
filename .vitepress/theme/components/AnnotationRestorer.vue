<script setup>
import { watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import { useAnnotations, loadAnnotations } from '../composables/useAnnotations'
import {
  bindAnnotationRestore,
  scheduleAnnotationRestore,
} from '../utils/annotationLifecycle'
import { scrollToHash } from '../utils/scrollToNote'

const route = useRoute()
const { pageHighlights, highlightsVisible } = useAnnotations()

function followNoteHash() {
  const hash = window.location.hash
  if (!hash) return
  scrollToHash(hash, pageHighlights.value)
}

onMounted(async () => {
  bindAnnotationRestore({
    getHighlights: () => pageHighlights.value,
    isVisible: () => highlightsVisible.value,
  })

  window.addEventListener('hashchange', followNoteHash)
  await loadAnnotations()
  scheduleAnnotationRestore(true)
})

onUnmounted(() => {
  window.removeEventListener('hashchange', followNoteHash)
})

watch(highlightsVisible, visible => {
  document.documentElement.classList.toggle('highlights-hidden', !visible)
  scheduleAnnotationRestore(false)
})

watch(() => route.path, async () => {
  await nextTick()
  scheduleAnnotationRestore(true)
})
</script>

<template>
  <span style="display:none" />
</template>