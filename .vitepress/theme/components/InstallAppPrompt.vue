<script setup>
import { ref } from 'vue'
import { usePwaInstall } from '../composables/usePwaInstall'
import { showToast } from '../composables/useToast'

const { canInstall, isIos, isStandalone, promptInstall } = usePwaInstall()
const showIosHelp = ref(false)

async function handleInstall() {
  const accepted = await promptInstall()
  if (accepted) {
    showToast('App installed — open from your home screen')
  }
}
</script>

<template>
  <div class="install-prompt">
    <p v-if="isStandalone" class="install-status installed">
      Running as installed app
    </p>
    <template v-else-if="canInstall">
      <button class="install-btn" @click="handleInstall">Install app</button>
      <p class="install-hint">Add to home screen for offline reading on the go.</p>
    </template>
    <template v-else-if="isIos">
      <button class="install-btn subtle" @click="showIosHelp = !showIosHelp">
        {{ showIosHelp ? 'Hide install steps' : 'Add to Home Screen' }}
      </button>
      <ol v-if="showIosHelp" class="ios-steps">
        <li>Tap the <strong>Share</strong> button in Safari</li>
        <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
        <li>Tap <strong>Add</strong> to install</li>
      </ol>
    </template>
    <p v-else class="install-hint">
      Use your browser menu to install this app for offline access.
    </p>
  </div>
</template>

<style scoped>
.install-prompt {
  margin-top: 4px;
  min-width: 0;
  max-width: 100%;
  overflow-wrap: break-word;
  word-break: break-word;
}

.install-status {
  font-size: 11px;
  margin: 0;
  color: var(--vp-c-text-3);
}

.install-status.installed {
  color: #22c55e;
}

.install-btn {
  display: block;
  width: 100%;
  max-width: 100%;
  padding: 6px 10px;
  margin-bottom: 4px;
  border: 1px solid var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
  color: #fff;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  text-align: left;
  min-height: 36px;
  box-sizing: border-box;
  white-space: normal;
}

.install-btn.subtle {
  background: var(--vp-c-bg);
  color: var(--vp-c-brand-1);
}

.install-hint {
  font-size: 11px;
  color: var(--vp-c-text-3);
  margin: 0 0 6px;
  line-height: 1.4;
}

.ios-steps {
  margin: 6px 0 0;
  padding-left: 18px;
  font-size: 11px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
</style>