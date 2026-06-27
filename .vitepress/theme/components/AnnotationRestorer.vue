<script setup>
import { watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import { useAnnotations, loadAnnotations } from '../composables/useAnnotations'
import {
  bindAnnotationRestore,
  scheduleAnnotationRestore,
} from '../utils/annotationLifecycle'
import { scrollToHash } from '../utils/scrollToNote'
import { normalizePagePath } from '../utils/normalizePagePath'

const route = useRoute()
const { highlights, highlightsVisible } = useAnnotations()

function followNoteHash() {
  const hash = window.location.hash
  if (!hash) return
  scrollToHash(hash, highlights.value)
}

onMounted(async () => {
  bindAnnotationRestore({
    getAllHighlights: () => highlights.value,
    getActivePath: () => normalizePagePath(window.location.pathname),
    getRoutePath: () => route.path,
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