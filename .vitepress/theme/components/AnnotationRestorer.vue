<script setup>
import { watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useData, onContentUpdated } from 'vitepress'
import { useAnnotations, loadAnnotations } from '../composables/useAnnotations'
import {
  bindAnnotationRestore,
  onAnnotationsRestored,
  restoreHighlightsNow,
  scheduleAnnotationRestore,
} from '../utils/annotationLifecycle'
import { ensureHighlightInDOM } from '../utils/highlightRestorer'
import { scrollToHash } from '../utils/scrollToNote'
import { pageKeyFromRelativePath } from '../utils/pagePathKey'

const { page } = useData()
const { highlights, pageHighlights, highlightsVisible } = useAnnotations()

let unbindRestoreListener = null
let docObserver = null

function currentPageKey() {
  return pageKeyFromRelativePath(page.value.relativePath || '')
}

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

function attachDocObserver() {
  docObserver?.disconnect()
  const doc = document.querySelector('.vp-doc')
  if (!doc) return

  docObserver = new MutationObserver(mutations => {
    const structural = mutations.some(m => m.type === 'childList' && m.target === doc)
    if (structural) scheduleAnnotationRestore()
  })
  docObserver.observe(doc, { childList: true })
}

onMounted(async () => {
  bindAnnotationRestore({
    getAllHighlights: () => highlights.value,
    getPageKey: currentPageKey,
    isVisible: () => highlightsVisible.value,
  })

  unbindRestoreListener = onAnnotationsRestored(paintCurrentPageHighlights)
  window.addEventListener('hashchange', followNoteHash)
  await loadAnnotations()

  attachDocObserver()
  restoreHighlightsNow()

  if (import.meta.env.DEV) {
    window.__dsaRestore = restoreHighlightsNow
  }
})

onUnmounted(() => {
  unbindRestoreListener?.()
  docObserver?.disconnect()
  window.removeEventListener('hashchange', followNoteHash)
})

onContentUpdated(() => {
  nextTick(() => scheduleAnnotationRestore())
})

watch(
  () => page.value.relativePath,
  () => {
    nextTick(() => scheduleAnnotationRestore())
  },
  { flush: 'post' },
)

watch(highlightsVisible, visible => {
  document.documentElement.classList.toggle('highlights-hidden', !visible)
  if (visible) restoreHighlightsNow()
})
</script>

<template>
  <span style="display:none" />
</template>