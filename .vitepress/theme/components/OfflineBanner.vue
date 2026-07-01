<script setup>
import { ref, computed, onMounted } from 'vue'
import { useConnectivity, verifyOnlineStatus } from '../composables/useConnectivity'

const DISMISS_KEY = 'dsa-offline-banner-dismissed'

const { isOnline } = useConnectivity()
const networkReady = ref(false)
const dismissed = ref(false)

const visible = computed(() => networkReady.value && !isOnline.value && !dismissed.value)

function dismiss() {
  dismissed.value = true
  sessionStorage.setItem(DISMISS_KEY, '1')
}

onMounted(() => {
  dismissed.value = sessionStorage.getItem(DISMISS_KEY) === '1'

  void verifyOnlineStatus().finally(() => {
    networkReady.value = true
  })

  window.addEventListener('offline', () => {
    dismissed.value = false
    sessionStorage.removeItem(DISMISS_KEY)
  })
})
</script>

<template>
  <div v-if="visible" class="offline-banner" role="status">
    <span class="offline-banner-text">
      You're offline — reading, notes, and quizzes still work.
    </span>
    <button class="offline-banner-dismiss" aria-label="Dismiss offline notice" @click="dismiss">
      ✕
    </button>
  </div>
</template>

<style scoped>
.offline-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 8px 16px;
  padding-top: calc(8px + var(--dsa-safe-top, 0px));
  background: #422006;
  color: #fef3c7;
  border-bottom: 1px solid #92400e;
  font-size: 13px;
  font-weight: 500;
}

.offline-banner-text {
  text-align: center;
  line-height: 1.4;
}

.offline-banner-dismiss {
  flex-shrink: 0;
  background: none;
  border: none;
  color: #fde68a;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 14px;
  line-height: 1;
  min-width: 32px;
  min-height: 32px;
}

.offline-banner-dismiss:hover {
  color: #fff;
}
</style>