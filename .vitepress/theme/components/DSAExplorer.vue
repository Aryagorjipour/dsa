<script setup lang="ts">
import { ref, computed } from 'vue'
import { useData } from 'vitepress'
import { useFocusMode } from '../composables/useFocusMode'
import { openShortcuts } from '../composables/useKeyboardShortcuts'
import { getExplorerTree } from '../../sidebar'
import { handbookLink } from '../utils/handbookLink'

const collapsed = ref(true)
const { page } = useData()
const { isFocusMode, toggleFocusMode } = useFocusMode()
const tree = computed(() => getExplorerTree())
const isHomePage = computed(() => page.value.frontmatter.layout === 'home')
</script>

<template>
  <div class="dsa-explorer" :class="{ collapsed, 'is-home': isHomePage }">
    <div class="explorer-header">
      <button
        class="explorer-toggle"
        :aria-expanded="!collapsed"
        aria-label="Quick jump navigation"
        @click="collapsed = !collapsed"
      >
        Quick Jump
        <span class="arrow" aria-hidden="true">{{ collapsed ? '▸' : '▾' }}</span>
      </button>
    </div>

    <div class="explorer-content" :class="{ 'is-collapsed': collapsed }">
      <ul>
        <li v-for="section in tree" :key="section.name">
          <div class="folder">{{ section.name }}</div>
          <ul>
            <li v-for="item in section.children" :key="item.link">
              <a :href="handbookLink(item.link)">{{ item.text }}</a>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <div class="explorer-footer">
      <button
        v-if="isHomePage"
        type="button"
        class="shortcuts-btn"
        title="Keyboard shortcuts (Shift+?)"
        @click="openShortcuts"
      >
        <span class="shortcuts-glyph" aria-hidden="true">?</span>
        Shortcuts
        <kbd>⇧?</kbd>
      </button>
      <button
        v-else
        type="button"
        class="focus-btn"
        :aria-pressed="isFocusMode"
        :title="isFocusMode ? 'Exit Focus (Esc)' : 'Focus Mode (Shift+F)'"
        @click="toggleFocusMode"
      >
        {{ isFocusMode ? 'Exit Focus' : 'Focus' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.dsa-explorer {
  font-size: 13px;
  line-height: 1.45;
  margin-top: 0;
  padding-top: 0;
}

.dsa-explorer.is-home {
  margin-top: 0;
  padding-top: 0;
}

.explorer-header {
  margin-bottom: 6px;
}

.explorer-toggle {
  background: none;
  border: none;
  font-weight: 600;
  font-size: 13px;
  color: var(--vp-c-text-1);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.explorer-content {
  max-height: 280px;
  overflow-y: auto;
  transition: max-height 0.25s ease;
}

.explorer-content.is-collapsed {
  max-height: 0;
  overflow: hidden;
}

.dsa-explorer ul {
  list-style: none;
  padding-left: 10px;
  margin: 1px 0;
}

.dsa-explorer > ul,
.dsa-explorer .explorer-content > ul {
  padding-left: 0;
}

.dsa-explorer .folder {
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-top: 6px;
  font-size: 12px;
}

.dsa-explorer a {
  color: var(--vp-c-text-2);
  text-decoration: none;
  display: block;
  padding: 1px 0;
}

.dsa-explorer a:hover {
  color: var(--vp-c-brand-1);
}

.explorer-footer {
  margin-top: 8px;
}

.focus-btn {
  font-size: 11px;
  padding: 2px 8px;
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
  border-radius: 4px;
  cursor: pointer;
}

.focus-btn:hover {
  background: var(--vp-c-bg-alt);
}

.shortcuts-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  padding: 4px 10px;
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
  border-radius: 9999px;
  cursor: pointer;
}

.shortcuts-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.shortcuts-glyph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
}

.shortcuts-btn kbd {
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 3px;
  border: 1px solid var(--vp-c-divider);
  font-family: inherit;
  color: var(--vp-c-text-3);
}
</style>