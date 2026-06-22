<script setup>
import {
  shortcutsOpen,
  closeShortcuts,
  SHORTCUT_GROUPS,
} from '../composables/useKeyboardShortcuts'

function onBackdropClick(e) {
  if (e.target === e.currentTarget) closeShortcuts()
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="shortcutsOpen"
      class="shortcuts-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      @click="onBackdropClick"
    >
      <div class="shortcuts-panel">
        <header class="shortcuts-header">
          <h2 class="shortcuts-title">Keyboard shortcuts</h2>
          <button
            type="button"
            class="shortcuts-close"
            aria-label="Close"
            @click="closeShortcuts"
          >✕</button>
        </header>

        <div class="shortcuts-groups">
          <section v-for="group in SHORTCUT_GROUPS" :key="group.title" class="shortcuts-group">
            <h3 class="group-title">{{ group.title }}</h3>
            <ul class="group-list">
              <li v-for="item in group.items" :key="item.keys + item.label">
                <kbd class="shortcut-keys">{{ item.keys }}</kbd>
                <span class="shortcut-label">{{ item.label }}</span>
              </li>
            </ul>
          </section>
        </div>

        <p class="shortcuts-footer">Press <kbd>Esc</kbd> to close</p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.shortcuts-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
}

.shortcuts-panel {
  width: min(480px, 100%);
  max-height: min(80vh, 560px);
  overflow: auto;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-elv);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
}

.shortcuts-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px 12px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.shortcuts-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.shortcuts-close {
  background: none;
  border: none;
  color: var(--vp-c-text-3);
  cursor: pointer;
  font-size: 14px;
  padding: 4px 6px;
  border-radius: 6px;
  line-height: 1;
}

.shortcuts-close:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
}

.shortcuts-groups {
  padding: 12px 18px 4px;
  display: grid;
  gap: 16px;
}

.shortcuts-group {
  margin: 0;
}

.group-title {
  margin: 0 0 8px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
}

.group-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 6px;
}

.group-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 0;
}

.shortcut-keys {
  flex-shrink: 0;
  min-width: 52px;
  text-align: center;
  font-size: 11px;
  font-family: inherit;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

.shortcut-label {
  flex: 1;
  text-align: right;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.shortcuts-footer {
  margin: 0;
  padding: 10px 18px 14px;
  font-size: 11px;
  color: var(--vp-c-text-3);
  text-align: center;
  border-top: 1px solid var(--vp-c-divider);
}

.shortcuts-footer kbd {
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  font-family: inherit;
}
</style>