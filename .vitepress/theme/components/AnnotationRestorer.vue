<script setup>
import { watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import { useAnnotations, loadAnnotations } from '../composables/useAnnotations'
import {
  bindAnnotationRestore,
  onAnnotationsRestored,
  scheduleAnnotationRestore,
} from '../utils/annotationLifecycle'
import { ensureHighlightInDOM } from '../utils/highlightRestorer'
import { scrollToHash } from '../utils/scrollToNote'
import { normalizePagePath } from '../utils/normalizePagePath'

const route = useRoute()
const { highlights, pageHighlights, highlightsVisible } = useAnnotations()

let unbindRestoreListener = null

function followNoteHash() {
  const hash = window.location.hash
  if (!hash) return
  scrollToHash(hash, highlights.value)
}

function paintCurrentPageHighlights() {
  if (!highlightsVisible.value) return
  for (const hl of pageHighlights.value) {
    ensureHighlightInDOM(hl)
  }
}

onMounted(async () => {
  bindAnnotationRestore({
    getAllHighlights: () => highlights.value,
    getActivePath: () => normalizePagePath(window.location.pathname),
    getRoutePath: () => route.path,
    isVisible: () => highlightsVisible.value,
  })

  unbindRestoreListener = onAnnotationsRestored(paintCurrentPageHighlights)
  window.addEventListener('hashchange', followNoteHash)
  await loadAnnotations()
  scheduleAnnotationRestore(true)
})

onUnmounted(() => {
  unbindRestoreListener?.()
  window.removeEventListener('hashchange', followNoteHash)
})

watch(highlightsVisible, visible => {
  document.documentElement.classList.toggle('highlights-hidden', !visible)
  if (visible) paintCurrentPageHighlights()
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