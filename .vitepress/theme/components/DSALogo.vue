<script setup>
import { withBase } from 'vitepress'

const logoSrc = withBase('/logo.svg')
const homeHref = withBase('/')
</script>

<template>
  <a class="dsa-brand" :href="homeHref" aria-label="DSA Handbook home">
    <img
      class="dsa-logo"
      :src="logoSrc"
      width="32"
      height="32"
      alt=""
      decoding="async"
      fetchpriority="high"
    />
    <span class="dsa-wordmark">DSA</span>
  </a>
</template>

<style scoped>
.dsa-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: inherit;
  margin-right: 4px;
}

.dsa-logo {
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  flex-shrink: 0;
}

.dsa-wordmark {
  font-family: 'Syne', system-ui, -apple-system, sans-serif;
  font-size: 1.625rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  line-height: 1;
  background: linear-gradient(135deg, var(--vp-c-brand-1) 0%, #a5b4fc 55%, var(--vp-c-brand-2) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>