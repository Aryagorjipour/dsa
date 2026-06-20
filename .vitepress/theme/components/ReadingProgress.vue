<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const progress = ref(0)

function updateProgress() {
  const doc = document.querySelector('.vp-doc')
  if (!doc) {
    progress.value = 0
    return
  }
  const rect = doc.getBoundingClientRect()
  const docTop = rect.top + window.scrollY
  const docHeight = doc.scrollHeight
  const viewportBottom = window.scrollY + window.innerHeight
  const scrolled = viewportBottom - docTop
  progress.value = Math.min(100, Math.max(0, (scrolled / docHeight) * 100))
}

onMounted(() => {
  window.addEventListener('scroll', updateProgress, { passive: true })
  updateProgress()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateProgress)
})
</script>

<template>
  <div class="reading-progress" role="progressbar" :aria-valuenow="Math.round(progress)" aria-valuemin="0" aria-valuemax="100">
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