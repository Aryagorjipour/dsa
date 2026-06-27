<script setup>
import { computed } from 'vue'
import { useConnectivity } from '../composables/useConnectivity'

const props = defineProps({
  feature: {
    type: String,
    required: true,
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

const { getOfflineCopy } = useConnectivity()
const copy = computed(() => getOfflineCopy(props.feature))
</script>

<template>
  <div class="offline-callout" :class="{ compact }" role="note">
    <div class="offline-callout-header">
      <span class="offline-callout-icon" aria-hidden="true">📡</span>
      <strong>{{ copy.title }}</strong>
    </div>
    <p class="offline-callout-message">{{ copy.message }}</p>
    <ul v-if="copy.worksOffline.length && !compact" class="offline-callout-list">
      <li v-for="item in copy.worksOffline" :key="item">Works offline: {{ item }}</li>
    </ul>
  </div>
</template>

<style scoped>
.offline-callout {
  margin: 0 0 12px;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #92400e;
  background: rgba(146, 64, 14, 0.12);
  color: var(--vp-c-text-1);
}

.offline-callout.compact {
  padding: 10px 12px;
}

.offline-callout-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  margin-bottom: 6px;
}

.offline-callout-icon {
  font-size: 16px;
}

.offline-callout-message {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}

.offline-callout-list {
  margin: 8px 0 0;
  padding-left: 18px;
  font-size: 12px;
  color: var(--vp-c-text-3);
  line-height: 1.5;
}
</style>