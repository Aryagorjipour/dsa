<script setup>
import { ref } from 'vue'
import { usePwaInstall } from '../composables/usePwaInstall'
import { showToast } from '../composables/useToast'

const { canInstall, isStandalone, swRegistered, installable, installBrowser, promptInstall } = usePwaInstall()
const showSteps = ref(false)

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
    <template v-else-if="installBrowser === 'ios'">
      <button class="install-btn subtle" @click="showSteps = !showSteps">
        {{ showSteps ? 'Hide install steps' : 'Add to Home Screen' }}
      </button>
      <ol v-if="showSteps" class="install-steps">
        <li>Tap the <strong>Share</strong> button in Safari</li>
        <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
        <li>Tap <strong>Add</strong> to install</li>
      </ol>
    </template>
    <template v-else-if="installBrowser === 'firefox-desktop'">
      <button class="install-btn subtle" @click="showSteps = !showSteps">
        {{ showSteps ? 'Hide install steps' : 'Install as app' }}
      </button>
      <ol v-if="showSteps" class="install-steps">
        <li>Open the <strong>menu</strong> (☰) in the toolbar</li>
        <li>Choose <strong>Install Site as App</strong> or <strong>Install</strong></li>
        <li>Confirm to add DSA Handbook to your apps</li>
      </ol>
      <p v-else class="install-hint">Firefox can install this handbook as a desktop app for offline use.</p>
    </template>
    <template v-else-if="installBrowser === 'firefox-android'">
      <button class="install-btn subtle" @click="showSteps = !showSteps">
        {{ showSteps ? 'Hide install steps' : 'Add to Home screen' }}
      </button>
      <ol v-if="showSteps" class="install-steps">
        <li>Tap the <strong>menu</strong> (⋮) in Firefox</li>
        <li>Tap <strong>Install</strong> or <strong>Add to Home screen</strong></li>
        <li>Confirm — offline reading works after the first online visit</li>
      </ol>
      <p v-else class="install-hint">Firefox Android supports adding this site to your home screen.</p>
    </template>
    <template v-else-if="installBrowser === 'zen'">
      <button class="install-btn subtle" @click="showSteps = !showSteps">
        {{ showSteps ? 'Hide install steps' : 'Install as app' }}
      </button>
      <ol v-if="showSteps" class="install-steps">
        <li>Open the <strong>Zen menu</strong> in the toolbar</li>
        <li>Look for <strong>Install</strong> or <strong>Add to Home Screen</strong></li>
        <li>Confirm to install for offline reading</li>
      </ol>
      <p v-else class="install-hint">Zen can install this handbook when a service worker is active.</p>
    </template>
    <template v-else>
      <button class="install-btn subtle" @click="showSteps = !showSteps">
        {{ showSteps ? 'Hide install steps' : 'Install for offline' }}
      </button>
      <ol v-if="showSteps" class="install-steps">
        <li>Open your browser <strong>menu</strong></li>
        <li>Choose <strong>Install app</strong>, <strong>Add to Home screen</strong>, or similar</li>
        <li>Visit once online so pages are cached for offline reading</li>
      </ol>
      <p v-else class="install-hint">Use your browser menu to install this app for offline access.</p>
    </template>

    <p v-if="!isStandalone && !swRegistered" class="install-warn">
      Finish loading this page while online — then install options will appear.
    </p>
    <p v-else-if="!isStandalone && installable && !canInstall && installBrowser !== 'ios'" class="install-hint subtle-ready">
      Ready to install — follow the steps above.
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

.install-hint.subtle-ready {
  color: var(--vp-c-text-2);
}

.install-warn {
  font-size: 11px;
  color: #fbbf24;
  margin: 6px 0 0;
  line-height: 1.4;
}

.install-steps {
  margin: 6px 0 0;
  padding-left: 18px;
  font-size: 11px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
</style>