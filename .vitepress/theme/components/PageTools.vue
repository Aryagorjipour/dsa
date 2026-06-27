<script setup>
import { computed } from 'vue'
import { useRoute } from 'vitepress'
import { buildPlaygroundUrl } from '../utils/playgroundUrl'
import { handbookLink } from '../utils/handbookLink'
import { normalizePagePath } from '../utils/normalizePagePath'

const route = useRoute()
const isProjectPage = computed(() => normalizePagePath(route.path).includes('/projects/tier-'))

function playgroundUrl() {
  return buildPlaygroundUrl({ from: route.path })
}
</script>

<template>
  <div id="dsa-page-tools" class="page-tools">
    <p class="annotation-hint">
      Select text to highlight or add a note. Click a highlight to view, edit, or remove it.
      Hover a section heading and click <strong>+</strong> for a section note.
      <span class="desktop-notes-hint">Press <kbd>Shift+N</kbd> to open all notes on this page.</span>
      <span class="mobile-notes-hint">Use the <strong>My Notes</strong> panel in the sidebar for this page.</span>
    </p>
    <div class="actions">
      <a v-if="isProjectPage" :href="handbookLink('/projects/README')" class="btn">Project Lab</a>
      <a v-if="isProjectPage" :href="handbookLink('/projects/contributing')" class="btn">Contribute</a>
      <a
        v-if="!isProjectPage"
        :href="playgroundUrl()"
        class="btn primary"
      >
        Open Playground
      </a>
    </div>
    <p v-if="isProjectPage" class="project-hint">
      This is a build specification — implement it yourself. Check
      <code>projects-starters/</code> in the repo for interface stubs.
    </p>
  </div>
</template>

<style scoped>
.page-tools {
  margin: 40px 0 20px;
  padding-top: 16px;
  border-top: 1px solid var(--vp-c-divider);
}

.annotation-hint {
  font-size: 13px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  margin: 0 0 12px;
}

.annotation-hint kbd {
  font-size: 11px;
  padding: 1px 5px;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-family: inherit;
}

.mobile-notes-hint {
  display: none;
}

@media (max-width: 960px) {
  .desktop-notes-hint {
    display: none;
  }

  .mobile-notes-hint {
    display: inline;
  }
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  padding: 6px 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  text-decoration: none;
  color: var(--vp-c-text-1);
  display: inline-flex;
  align-items: center;
}

.btn.primary {
  background: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-1);
}

.project-hint {
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin-top: 10px;
  line-height: 1.5;
}

.project-hint code {
  font-size: 11px;
}
</style>