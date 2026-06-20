<script setup>
import { useToast, dismissToast } from '../composables/useToast'

const { toasts } = useToast()
</script>

<template>
  <div class="dsa-toast-container" aria-live="polite" aria-atomic="true">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="dsa-toast"
      role="status"
    >
      <span>{{ toast.text }}</span>
      <button
        v-if="toast.action"
        class="dsa-toast-action"
        @click="toast.action.onClick(); dismissToast(toast.id)"
      >
        {{ toast.action.label }}
      </button>
      <button
        class="dsa-toast-close"
        aria-label="Dismiss"
        @click="dismissToast(toast.id)"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<style scoped>
.dsa-toast-container {
  position: fixed;
  bottom: 80px;
  right: 24px;
  z-index: 300;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 360px;
}

.dsa-toast {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  font-size: 13px;
  color: var(--vp-c-text-1);
}

.dsa-toast-action {
  flex-shrink: 0;
  padding: 2px 8px;
  border: 1px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.dsa-toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--vp-c-text-3);
  cursor: pointer;
  padding: 0 4px;
  margin-left: auto;
}
</style>