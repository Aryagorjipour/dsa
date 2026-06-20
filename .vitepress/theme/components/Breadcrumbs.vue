<script setup>
import { useChapterNav } from '../composables/useChapterNav'

const { breadcrumbs } = useChapterNav()
</script>

<template>
  <nav v-if="breadcrumbs.length > 1" class="dsa-breadcrumbs" aria-label="Breadcrumb">
    <ol>
      <li v-for="(crumb, i) in breadcrumbs" :key="i">
        <a v-if="crumb.link && i < breadcrumbs.length - 1" :href="crumb.link">{{ crumb.text }}</a>
        <span v-else aria-current="page">{{ crumb.text }}</span>
        <span v-if="i < breadcrumbs.length - 1" class="sep" aria-hidden="true">›</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.dsa-breadcrumbs {
  margin-bottom: 12px;
  font-size: 13px;
}

.dsa-breadcrumbs ol {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.dsa-breadcrumbs a {
  color: var(--vp-c-text-2);
  text-decoration: none;
}

.dsa-breadcrumbs a:hover {
  color: var(--vp-c-brand-1);
}

.dsa-breadcrumbs span[aria-current] {
  color: var(--vp-c-text-1);
  font-weight: 500;
}

.sep {
  color: var(--vp-c-text-3);
  margin: 0 2px;
}
</style>