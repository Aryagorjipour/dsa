<script setup>
import DefaultTheme from 'vitepress/theme'
import DSAExplorer from './components/DSAExplorer.vue'
import PageTools from './components/PageTools.vue'
import { ref, onMounted, onUnmounted } from 'vue'

const { Layout } = DefaultTheme
const isFocusMode = ref(false)

function toggleGlobalFocus() {
  isFocusMode.value = !isFocusMode.value
  if (isFocusMode.value) {
    document.documentElement.classList.add('focus-mode')
  } else {
    document.documentElement.classList.remove('focus-mode')
  }
}

function handleKey(e) {
  if ((e.key.toLowerCase() === 'f') && !e.target.matches('input, textarea')) {
    e.preventDefault()
    toggleGlobalFocus()
  }
  if (e.key === 'Escape' && isFocusMode.value) {
    toggleGlobalFocus()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKey)
  const observer = new MutationObserver(() => {
    isFocusMode.value = document.documentElement.classList.contains('focus-mode')
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKey)
})
</script>

<template>
  <Layout>
    <!-- Inject our explorer into the right aside area -->
    <template #aside-outline-before>
      <DSAExplorer />
    </template>

    <!-- Page tools (Share, AI, Playground) at the end of every doc -->
    <template #doc-after>
      <PageTools />
    </template>

    <!-- Floating Focus button - always visible and prominent when not focused -->
    <div 
      v-if="!isFocusMode" 
      class="floating-focus"
      @click="toggleGlobalFocus"
      title="Focus Mode - Hide sidebars for distraction-free reading (press F)"
    >
      👁 Focus
    </div>
  </Layout>
</template>

<style scoped>
.floating-focus {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--vp-c-brand-1);
  color: white;
  padding: 8px 14px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  cursor: pointer;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: transform 0.1s;
}
.floating-focus:hover {
  transform: scale(1.05);
}
</style>