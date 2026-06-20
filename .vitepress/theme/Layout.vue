<script setup>
import DefaultTheme from 'vitepress/theme'
import DSAExplorer from './components/DSAExplorer.vue'
import PageTools from './components/PageTools.vue'
import NotesPanel from './components/NotesPanel.vue'
import Breadcrumbs from './components/Breadcrumbs.vue'
import ChapterNav from './components/ChapterNav.vue'
import ReadingProgress from './components/ReadingProgress.vue'
import Toast from './components/Toast.vue'
import AnnotationToolbar from './components/AnnotationToolbar.vue'
import AnnotationRestorer from './components/AnnotationRestorer.vue'
import CodeBlockActions from './components/CodeBlockActions.vue'
import HeadingNotes from './components/HeadingNotes.vue'
import SettingsDrawer from './components/SettingsDrawer.vue'
import { useFocusMode } from './composables/useFocusMode'

const { Layout } = DefaultTheme
const { isFocusMode, toggleFocusMode } = useFocusMode()
</script>

<template>
  <Layout>
    <template #nav-bar-content-after>
      <SettingsDrawer />
    </template>

    <template #doc-before>
      <Breadcrumbs />
    </template>

    <template #aside-outline-after>
      <NotesPanel />
      <DSAExplorer />
    </template>

    <template #doc-footer-before>
      <ChapterNav />
    </template>

    <template #doc-after>
      <PageTools />
    </template>

    <ReadingProgress />
    <Toast />
    <AnnotationToolbar />
    <AnnotationRestorer />
    <CodeBlockActions />
    <HeadingNotes />

    <button
      v-if="!isFocusMode"
      class="floating-focus"
      aria-label="Enter focus mode (Shift+F)"
      title="Focus Mode — hide sidebars for distraction-free reading (Shift+F)"
      @click="toggleFocusMode"
    >
      <span class="focus-icon" aria-hidden="true">◐</span>
      Focus
    </button>
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  transition: transform 0.1s;
}

.floating-focus:hover {
  transform: scale(1.04);
}

.focus-icon {
  font-size: 14px;
}

@media (max-width: 640px) {
  .floating-focus {
    bottom: 16px;
    right: 16px;
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>