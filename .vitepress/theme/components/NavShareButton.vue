<script setup>
import { usePageActions } from '../composables/usePageActions'

const { sharePage } = usePageActions()
</script>

<template>
  <button
    type="button"
    class="nav-share-btn"
    aria-label="Share this page"
    title="Copy link to share this page"
    @click="sharePage"
  >
    <span class="nav-share-icon" aria-hidden="true">⎘</span>
    <span class="nav-share-label">Share</span>
  </button>
</template>

<style scoped>
.nav-share-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  margin-right: 4px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  line-height: 1.3;
  transition: border-color 0.15s, color 0.15s;
}

.nav-share-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.nav-share-icon {
  font-size: 14px;
  line-height: 1;
}

@media (max-width: 768px) {
  .nav-share-label {
    display: none;
  }

  .nav-share-btn {
    padding: 4px 8px;
  }
}
</style>