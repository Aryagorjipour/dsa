<script setup>
import { computed, ref, watch } from 'vue'
import { useTtsConfigModal } from '../composables/useTtsConfigModal'
import { useHandbookTts } from '../composables/useHandbookTts'
import { showToast } from '../composables/useToast'
import {
  PROVIDER_DEFAULTS,
  clearCloudTtsCredentials,
  defaultCloudConfig,
  getCloudApiKey,
  hasStoredApiKey,
  loadCloudTtsConfig,
  maskApiKey,
  saveCloudApiKey,
  saveCloudTtsConfig,
} from '../tts/ttsSecretStore'
import { GEMINI_VOICES, OPENAI_VOICES, isLikelyCorsError, testProviderConnection } from '../tts/providers'

const { visible, closeTtsConfigModal } = useTtsConfigModal()
const {
  glossaryOverrides,
  defaultGlossary,
  addGlossaryOverride,
  removeGlossaryOverride,
  exportGlossaryOverrides,
  importGlossaryOverrides,
  refreshCloudConfigured,
} = useHandbookTts()

const activeTab = ref('cloud')
const provider = ref('openai')
const baseUrl = ref(PROVIDER_DEFAULTS.openai)
const apiKeyInput = ref('')
const hasKey = ref(false)
const maskedKey = ref('')
const model = ref('tts-1')
const voiceId = ref('coral')
const models = ref([])
const voices = ref([])
const testing = ref(false)
const testError = ref('')
const testOk = ref(false)

const newMatch = ref('')
const newSpoken = ref('')
const glossaryFile = ref(null)

const showBaseUrl = computed(() => provider.value === 'custom')
const openaiVoices = OPENAI_VOICES.map(v => ({ id: v, label: v }))

async function loadConfig() {
  const config = await loadCloudTtsConfig()
  provider.value = config.provider
  baseUrl.value = config.baseUrl || PROVIDER_DEFAULTS[config.provider]
  model.value = config.model
  voiceId.value = config.voiceId
  testOk.value = config.configured
  hasKey.value = await hasStoredApiKey()
  if (hasKey.value) {
    const key = await getCloudApiKey()
    maskedKey.value = key ? maskApiKey(key) : ''
  }
}

watch(visible, open => {
  if (open) void loadConfig()
})

watch(provider, p => {
  if (p !== 'custom') baseUrl.value = PROVIDER_DEFAULTS[p]
  const defaults = defaultCloudConfig(p)
  if (!models.value.length) {
    model.value = defaults.model
    voiceId.value = defaults.voiceId
  }
  refreshVoiceOptions()
})

function refreshVoiceOptions() {
  if (provider.value === 'openai' || provider.value === 'custom') {
    voices.value = openaiVoices
    if (!OPENAI_VOICES.includes(voiceId.value)) voiceId.value = 'coral'
  } else if (provider.value === 'gemini') {
    voices.value = GEMINI_VOICES
    if (!GEMINI_VOICES.some(v => v.id === voiceId.value)) voiceId.value = 'Kore'
  } else {
    voices.value = []
  }
}

async function onTestConnection() {
  const key = apiKeyInput.value.trim()
  if (!key && !hasKey.value) {
    testError.value = 'Enter an API key first'
    return
  }
  if (provider.value === 'custom' && !baseUrl.value.trim()) {
    testError.value = 'Enter a base URL for Custom provider'
    return
  }

  testing.value = true
  testError.value = ''
  testOk.value = false

  try {
    const resolvedKey = key || (await getCloudApiKey())
    if (!resolvedKey) throw new Error('No API key available')

    const result = await testProviderConnection(provider.value, baseUrl.value, resolvedKey)
    models.value = result.models
    if (result.models.length && !result.models.includes(model.value)) {
      model.value = result.models[0]
    }
    if (result.voices?.length) {
      voices.value = result.voices
      if (!result.voices.some(v => v.id === voiceId.value)) {
        voiceId.value = result.voices[0].id
      }
    } else {
      refreshVoiceOptions()
    }

    if (key) await saveCloudApiKey(key)
    await saveCloudTtsConfig({
      provider: provider.value,
      baseUrl: baseUrl.value.trim(),
      model: model.value,
      voiceId: voiceId.value,
      configured: true,
    })

    hasKey.value = true
    maskedKey.value = maskApiKey(key || resolvedKey)
    apiKeyInput.value = ''
    testOk.value = true
    await refreshCloudConfigured()
    showToast('Cloud TTS connected')
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Connection failed'
    testError.value = isLikelyCorsError(err)
      ? 'Browser blocked the request — use Custom with a CORS-enabled proxy'
      : msg
  } finally {
    testing.value = false
  }
}

async function onSave() {
  await saveCloudTtsConfig({
    provider: provider.value,
    baseUrl: baseUrl.value.trim(),
    model: model.value.trim(),
    voiceId: voiceId.value,
    configured: testOk.value && hasKey.value,
  })
  if (apiKeyInput.value.trim()) await saveCloudApiKey(apiKeyInput.value.trim())
  await refreshCloudConfigured()
  showToast('Settings saved')
  closeTtsConfigModal()
}

async function onClearCredentials() {
  await clearCloudTtsCredentials()
  apiKeyInput.value = ''
  hasKey.value = false
  maskedKey.value = ''
  testOk.value = false
  models.value = []
  const defaults = defaultCloudConfig(provider.value)
  model.value = defaults.model
  voiceId.value = defaults.voiceId
  showToast('Credentials cleared')
}

function onKeydown(e) {
  if (e.key === 'Escape') closeTtsConfigModal()
}

function onAddOverride() {
  const match = newMatch.value.trim()
  const spoken = newSpoken.value.trim()
  if (!match || !spoken) return
  addGlossaryOverride({ match, spoken })
  newMatch.value = ''
  newSpoken.value = ''
  showToast('Pronunciation rule added')
}

function onExportGlossary() {
  const blob = new Blob([exportGlossaryOverrides()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'dsa-tts-glossary.json'
  a.click()
  URL.revokeObjectURL(url)
}

function onImportClick() {
  glossaryFile.value?.click()
}

function onImportGlossary(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    if (importGlossaryOverrides(String(reader.result))) {
      showToast('Pronunciation rules imported')
    } else {
      showToast('Invalid glossary JSON')
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}

if (typeof window !== 'undefined') refreshVoiceOptions()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="tts-config-backdrop"
      @mousedown.self="closeTtsConfigModal"
    >
      <div
        class="tts-config-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Listen settings"
        @keydown="onKeydown"
      >
        <header class="tts-config-header">
          <h2 class="tts-config-title">Listen settings</h2>
          <button type="button" class="tts-config-close" aria-label="Close" @click="closeTtsConfigModal">✕</button>
        </header>

        <div class="tts-config-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            class="tts-tab"
            :class="{ active: activeTab === 'cloud' }"
            :aria-selected="activeTab === 'cloud'"
            @click="activeTab = 'cloud'"
          >
            Cloud AI
          </button>
          <button
            type="button"
            role="tab"
            class="tts-tab"
            :class="{ active: activeTab === 'pronunciation' }"
            :aria-selected="activeTab === 'pronunciation'"
            @click="activeTab = 'pronunciation'"
          >
            Pronunciation
          </button>
        </div>

        <div class="tts-config-body">
          <div v-show="activeTab === 'cloud'" class="tts-tab-panel">
            <p class="tts-hint">
              API keys are encrypted on this device only — never exported with your notes.
              Direct browser calls may be blocked; use Custom with a proxy if needed.
            </p>

            <label class="tts-field">
              <span class="tts-label">Provider</span>
              <select v-model="provider" class="tts-input">
                <option value="openai">OpenAI</option>
                <option value="gemini">Gemini</option>
                <option value="grok">Grok</option>
                <option value="custom">Custom (OpenAI-compatible)</option>
              </select>
            </label>

            <label v-if="showBaseUrl" class="tts-field">
              <span class="tts-label">Base URL</span>
              <input v-model="baseUrl" class="tts-input" type="url" placeholder="https://your-proxy.example/v1" />
            </label>

            <label class="tts-field">
              <span class="tts-label">API key</span>
              <input
                v-model="apiKeyInput"
                class="tts-input"
                type="password"
                autocomplete="off"
                :placeholder="hasKey ? `Stored: ${maskedKey}` : 'sk-… or provider key'"
              />
            </label>

            <div class="tts-row">
              <label class="tts-field tts-field-grow">
                <span class="tts-label">Model</span>
                <select v-if="models.length" v-model="model" class="tts-input">
                  <option v-for="m in models" :key="m" :value="m">{{ m }}</option>
                </select>
                <input v-else v-model="model" class="tts-input" placeholder="tts-1" />
              </label>

              <label class="tts-field tts-field-grow">
                <span class="tts-label">Voice</span>
                <select v-if="voices.length" v-model="voiceId" class="tts-input">
                  <option v-for="v in voices" :key="v.id" :value="v.id">{{ v.label }}</option>
                </select>
                <input v-else v-model="voiceId" class="tts-input" placeholder="coral" />
              </label>
            </div>

            <p v-if="testError" class="tts-error">{{ testError }}</p>
            <p v-else-if="testOk" class="tts-success">Connected — select Cloud AI in Listen panel to use.</p>

            <div class="tts-actions">
              <button type="button" class="btn-secondary" :disabled="testing" @click="onClearCredentials">
                Clear key
              </button>
              <button type="button" class="btn-secondary" :disabled="testing" @click="onTestConnection">
                {{ testing ? 'Testing…' : 'Test & fetch models' }}
              </button>
              <button type="button" class="btn-primary" @click="onSave">Save</button>
            </div>
          </div>

          <div v-show="activeTab === 'pronunciation'" class="tts-tab-panel">
            <p class="tts-hint">{{ defaultGlossary.length }} handbook rules built in. Add overrides below.</p>
            <ul v-if="glossaryOverrides.length" class="glossary-list">
              <li v-for="(rule, i) in glossaryOverrides" :key="i">
                <span class="glossary-rule">{{ rule.match }} → {{ rule.spoken }}</span>
                <button type="button" class="glossary-remove" @click="removeGlossaryOverride(i)">✕</button>
              </li>
            </ul>
            <div class="glossary-add">
              <input v-model="newMatch" class="tts-input" placeholder="Match (e.g. C#)" />
              <input v-model="newSpoken" class="tts-input" placeholder="Spoken (e.g. C sharp)" />
              <button type="button" class="btn-secondary" @click="onAddOverride">Add rule</button>
            </div>
            <div class="glossary-actions">
              <button type="button" class="btn-secondary" @click="onExportGlossary">Export</button>
              <button type="button" class="btn-secondary" @click="onImportClick">Import</button>
              <input ref="glossaryFile" type="file" accept=".json" hidden @change="onImportGlossary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.tts-config-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.48);
  z-index: 406;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.tts-config-dialog {
  width: min(520px, 100%);
  max-height: min(85vh, 680px);
  display: flex;
  flex-direction: column;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.28);
}

.tts-config-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.tts-config-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.tts-config-close {
  border: none;
  background: transparent;
  color: var(--vp-c-text-3);
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
}

.tts-config-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 8px;
}

.tts-tab {
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-3);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 6px;
}

.tts-tab.active {
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent);
}

.tts-config-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.tts-tab-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tts-hint {
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  color: var(--vp-c-text-3);
}

.tts-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tts-field-grow {
  flex: 1;
  min-width: 0;
}

.tts-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vp-c-text-3);
}

.tts-input {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 13px;
}

.tts-row {
  display: flex;
  gap: 10px;
}

.tts-error {
  margin: 0;
  font-size: 12px;
  color: #f87171;
}

.tts-success {
  margin: 0;
  font-size: 12px;
  color: #34d399;
}

.tts-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

.btn-secondary,
.btn-primary {
  padding: 7px 14px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid var(--vp-c-divider);
}

.btn-secondary {
  background: transparent;
  color: var(--vp-c-text-2);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--vp-c-brand-1);
  color: #fff;
  border-color: var(--vp-c-brand-1);
}

.glossary-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.glossary-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.glossary-rule {
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  color: var(--vp-c-text-2);
}

.glossary-remove {
  border: none;
  background: none;
  color: var(--vp-c-text-3);
  cursor: pointer;
}

.glossary-add {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.glossary-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 480px) {
  .tts-row {
    flex-direction: column;
  }

  .tts-actions {
    flex-direction: column;
  }

  .tts-actions button {
    width: 100%;
  }
}
</style>