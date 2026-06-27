<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'
import { useConnectivity } from '../composables/useConnectivity'

const { page } = useData()
const { isOnline } = useConnectivity()

const is404 = computed(() => page.value.title === '404')
const visible = computed(() => !isOnline.value && is404.value)
</script>

<template>
  <div v-if="visible" class="offline-uncached" role="alert">
    <strong>This page isn't cached yet.</strong>
    <p>Connect to the internet once to download the latest handbook content, then try again offline.</p>
  </div>
</template>

<style scoped>
.offline-uncached {
  margin: 24px auto;
  max-width: 480px;
  padding: 16px 18px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  text-align: center;
}

.offline-uncached strong {
  display: block;
  margin-bottom: 6px;
  font-size: 15px;
}

.offline-uncached p {
  margin: 0;
  font-size: 13px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
</style>