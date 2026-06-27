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
import NoteDetailModal from './components/NoteDetailModal.vue'
import CodeBlockActions from './components/CodeBlockActions.vue'
import HeadingNotes from './components/HeadingNotes.vue'
import PageNotesRail from './components/PageNotesRail.vue'
import SettingsDrawer from './components/SettingsDrawer.vue'
import KeyboardShortcutsSheet from './components/KeyboardShortcutsSheet.vue'
import OfflineBanner from './components/OfflineBanner.vue'
import PwaUpdatePrompt from './components/PwaUpdatePrompt.vue'
import OfflineUncachedNotice from './components/OfflineUncachedNotice.vue'
import { useFocusMode } from './composables/useFocusMode'
import { useChromeOffset } from './composables/useChromeOffset'

import { openShortcuts, useKeyboardShortcuts } from './composables/useKeyboardShortcuts'
import { normalizePagePath } from './utils/normalizePagePath'
import { isMarginNotesMobile } from './utils/noteLayout'
import DSALogo from './components/DSALogo.vue'

const QuizSection = defineAsyncComponent(() => import('./components/QuizSection.vue'))

const route = useRoute()
const { page } = useData()
const { Layout } = DefaultTheme
const { isFocusMode, toggleFocusMode } = useFocusMode()
useKeyboardShortcuts()
useChromeOffset()

const isHomePage = computed(() => page.value.frontmatter.layout === 'home')

const showDocPage = computed(() => {
  if (isHomePage.value) return false
  const path = normalizePagePath(route.path)
  return !['/my-notes', '/playground', '/quizzes'].some(
    p => path === p || path.startsWith(p + '/'),
  )
})

const showFallbackFocus = computed(() => {
  if (isHomePage.value) return false
  return !showDocPage.value || isMarginNotesMobile()
})
</script>

<template>
  <div class="dsa-theme-root">
  <OfflineBanner />
  <PwaUpdatePrompt />
  <Layout>
    <template #nav-bar-title-before>
      <DSALogo />
    </template>

    <template #nav-bar-content-after>
      <SettingsDrawer />
    </template>

    <template #doc-before>
      <OfflineUncachedNotice />
      <Breadcrumbs />
    </template>

    <template #aside-outline-after>
      <NotesPanel v-if="!isHomePage" />
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
  <NoteDetailModal />
  <AnnotationRestorer />
  <CodeBlockActions />
  <HeadingNotes />
  <PageNotesRail />
  <KeyboardShortcutsSheet />

  <button
    v-if="isHomePage && !isFocusMode"
    type="button"
    class="floating-shortcuts"
    aria-label="Keyboard shortcuts (Shift+?)"
    title="Keyboard shortcuts (Shift+?)"
    @click="openShortcuts"
  >
    <span class="shortcuts-icon" aria-hidden="true">?</span>
    <kbd class="shortcuts-kbd">⇧?</kbd>
  </button>
  <button
    v-else-if="showFallbackFocus && isFocusMode"
    class="floating-focus is-exit"
    aria-label="Exit focus mode (Shift+F or Esc)"
    title="Exit Focus Mode (Shift+F or Esc)"
    @click="toggleFocusMode"
  >
    <span class="focus-icon" aria-hidden="true">◑</span>
    Exit Focus
  </button>
  <button
    v-else-if="showFallbackFocus"
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
  bottom: calc(24px + var(--dsa-safe-bottom, 0px));
  left: 24px;
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

.floating-shortcuts {
  position: fixed;
  bottom: calc(24px + var(--dsa-safe-bottom, 0px));
  left: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 9999px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-1);
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  z-index: 111;
  transition: transform 0.1s, border-color 0.15s;
}

.floating-shortcuts:hover {
  transform: scale(1.04);
  border-color: var(--vp-c-brand-1);
}

.shortcuts-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
}

.shortcuts-kbd {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-3);
  font-family: inherit;
  line-height: 1.3;
}

@media (max-width: 640px) {
  .floating-focus,
  .floating-shortcuts {
    bottom: calc(16px + var(--dsa-safe-bottom, 0px));
    left: 16px;
    padding: 6px 12px;
    font-size: 12px;
  }

}
</style>