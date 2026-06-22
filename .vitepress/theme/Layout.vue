<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useRoute, useData } from 'vitepress'
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
import NoteDialog from './components/NoteDialog.vue'
import CodeBlockActions from './components/CodeBlockActions.vue'
import HeadingNotes from './components/HeadingNotes.vue'
import PageNotesRail from './components/PageNotesRail.vue'
import SettingsDrawer from './components/SettingsDrawer.vue'
import KeyboardShortcutsSheet from './components/KeyboardShortcutsSheet.vue'
import { useFocusMode } from './composables/useFocusMode'
import { useKeyboardShortcuts } from './composables/useKeyboardShortcuts'
import { normalizePagePath } from './utils/normalizePagePath'
import { isMarginNotesMobile } from './utils/noteLayout'
import DSALogo from './components/DSALogo.vue'

const QuizSection = defineAsyncComponent(() => import('./components/QuizSection.vue'))

const route = useRoute()
const { page } = useData()
const { Layout } = DefaultTheme
const { isFocusMode, toggleFocusMode } = useFocusMode()
useKeyboardShortcuts()

const showPageNotesDock = computed(() => {
  if (isFocusMode.value || isMarginNotesMobile()) return false
  if (page.value.frontmatter.layout === 'home') return false
  const path = normalizePagePath(route.path)
  return !['/my-notes', '/playground', '/quizzes'].some(
    p => path === p || path.startsWith(p + '/'),
  )
})
</script>

<template>
  <div class="dsa-theme-root">
  <Layout>
    <template #nav-bar-title-before>
      <DSALogo />
    </template>

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
      <QuizSection />
      <PageTools />
    </template>
  </Layout>

  <ReadingProgress />
  <Toast />
  <AnnotationToolbar />
  <NoteDialog />
  <AnnotationRestorer />
  <CodeBlockActions />
  <HeadingNotes />
  <PageNotesRail />
  <KeyboardShortcutsSheet />

  <button
    v-if="isFocusMode"
    class="floating-focus is-exit"
    aria-label="Exit focus mode (Shift+F or Esc)"
    title="Exit Focus Mode (Shift+F or Esc)"
    @click="toggleFocusMode"
  >
    <span class="focus-icon" aria-hidden="true">◑</span>
    Exit Focus
  </button>
  <button
    v-else-if="!showPageNotesDock"
    class="floating-focus"
    aria-label="Enter focus mode (Shift+F)"
    title="Focus Mode — fullscreen reading, hides nav and sidebars (Shift+F)"
    @click="toggleFocusMode"
  >
    <span class="focus-icon" aria-hidden="true">◐</span>
    Focus
  </button>
  </div>
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
  z-index: 111;
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  transition: transform 0.1s;
}

.floating-focus:hover {
  transform: scale(1.04);
}

.floating-focus.is-exit {
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
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