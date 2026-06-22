<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useData } from 'vitepress'
import { normalizePagePath } from '../utils/normalizePagePath'

const route = useRoute()
const { page } = useData()
const progress = ref(0)

const showBar = computed(() => {
  if (page.value.frontmatter.layout === 'home') return false
  const path = normalizePagePath(route.path)
  if (path === '/' || path === '/index') return false
  return true
})

function updateProgress() {
  if (!showBar.value) {
    progress.value = 0
    return
  }

  const doc = document.querySelector('.vp-doc')
  if (!doc) {
    progress.value = 0
    return
  }

  const docTop = doc.getBoundingClientRect().top + window.scrollY
  const docHeight = doc.scrollHeight
  const winH = window.innerHeight
  const scrollable = docHeight - winH

  if (scrollable <= 0) {
    progress.value = window.scrollY >= docTop ? 100 : 0
    return
  }

  const scrolled = window.scrollY - docTop
  progress.value = Math.min(100, Math.max(0, (scrolled / scrollable) * 100))
}

let rafId = 0
function onScroll() {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    rafId = 0
    updateProgress()
  })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  updateProgress()
})

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})

watch(() => route.path, () => {
  progress.value = 0
  requestAnimationFrame(updateProgress)
})
</script>

<template>
  <div
    v-if="showBar"
    class="reading-progress"
    role="progressbar"
    :aria-valuenow="Math.round(progress)"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <div class="reading-progress-bar" :style="{ width: progress + '%' }" />
  </div>
</template>

<style scoped>
.reading-progress {
  position: fixed;
  top: var(--vp-nav-height, 64px);
  left: 0;
  right: 0;
  height: 2px;
  z-index: 50;
  background: transparent;
  pointer-events: none;
}

.reading-progress-bar {
  height: 100%;
  background: var(--vp-c-brand-1);
  transition: width 0.1s ease-out;
}
</style>