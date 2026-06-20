<script setup>
import { useChapterNav } from '../composables/useChapterNav'

const { prev, next } = useChapterNav()
</script>

<template>
  <nav v-if="prev || next" class="chapter-nav" aria-label="Chapter navigation">
    <a v-if="prev" :href="prev.link" class="chapter-nav-link prev">
      <span class="label">Previous</span>
      <span class="title">{{ prev.text }}</span>
    </a>
    <div v-else class="chapter-nav-spacer" />
    <a v-if="next" :href="next.link" class="chapter-nav-link next">
      <span class="label">Next</span>
      <span class="title">{{ next.text }}</span>
    </a>
  </nav>
</template>

<style scoped>
.chapter-nav {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin: 32px 0 16px;
  padding-top: 24px;
  border-top: 1px solid var(--vp-c-divider);
}

.chapter-nav-link {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  text-decoration: none;
  transition: border-color 0.15s;
  max-width: 48%;
}

.chapter-nav-link:hover {
  border-color: var(--vp-c-brand-1);
}

.chapter-nav-link.prev {
  text-align: left;
}

.chapter-nav-link.next {
  text-align: right;
  margin-left: auto;
}

.chapter-nav-spacer {
  flex: 1;
}

.label {
  display: block;
  font-size: 11px;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.title {
  display: block;
  font-size: 14px;
  color: var(--vp-c-brand-1);
  font-weight: 500;
}
</style>