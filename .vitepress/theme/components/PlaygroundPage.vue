<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import { normalizePagePath } from '../utils/normalizePagePath'
import { EditorView, keymap } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { basicSetup } from 'codemirror'
import { go } from '@codemirror/lang-go'
import { cpp } from '@codemirror/lang-cpp'

import { defaultKeymap } from '@codemirror/commands'
import { usePlayground } from '../composables/usePlayground'
import { getSnippets, setSnippets, generateId, getPlaygroundState } from '../composables/useStorage'
import { showToast } from '../composables/useToast'

const editorEl = ref(null)
let editorView = null
let themeObserver = null

const {
  lang, code, stdin, output, running, compilerName, permalink,
  loadPersisted, setLang, setCode, runWandbox, openWandbox, reset,
  persist, DEFAULT_GO, DEFAULT_CSHARP,
} = usePlayground()

const route = useRoute()
const snippets = ref([])
const pageTitle = ref('Playground')
const isDark = ref(false)

function parseCodeParam(raw: string | null): string | null {
  if (!raw) return null
  try {
    let decoded = decodeURIComponent(raw)
    if (decoded.includes('%')) {
      try {
        decoded = decodeURIComponent(decoded)
      } catch {
        /* use single-decoded value */
      }
    }
    return decoded
  } catch {
    return raw
  }
}

const lightTheme = EditorView.theme({
  '&': { backgroundColor: '#fafafa', color: '#383a42' },
  '.cm-content': { caretColor: '#383a42' },
  '.cm-gutters': { backgroundColor: '#f0f0f0', color: '#9d9d9f', border: 'none' },
})

const darkTheme = EditorView.theme({
  '&': { backgroundColor: '#1e1e1e', color: '#d4d4d4' },
  '.cm-content': { caretColor: '#d4d4d4' },
  '.cm-gutters': { backgroundColor: '#1e1e1e', color: '#858585', border: 'none' },
}, { dark: true })

function getTheme() {
  return isDark.value ? darkTheme : lightTheme
}

function createEditor() {
  if (!editorEl.value) return
  if (editorView) {
    editorView.destroy()
    editorView = null
  }

  const language = lang.value === 'go' ? go() : cpp()

  editorView = new EditorView({
    state: EditorState.create({
      doc: code.value,
      extensions: [
        basicSetup,
        language,
        getTheme(),
        keymap.of(defaultKeymap),
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            setCode(update.state.doc.toString())
          }
        }),
        EditorView.theme({
          '&': { fontSize: '13px', height: '100%' },
          '.cm-scroller': { fontFamily: 'ui-monospace, monospace' },
        }),
      ],
    }),
    parent: editorEl.value,
  })
}

async function switchLang(newLang) {
  await persist()
  setLang(newLang)
  const state = await getPlaygroundState()
  code.value = newLang === 'go' ? (state.go || DEFAULT_GO) : (state.csharp || DEFAULT_CSHARP)
  createEditor()
}

async function loadFromPage() {
  if (typeof window === 'undefined') return

  const params = new URLSearchParams(window.location.search)
  const from = normalizePagePath(params.get('from') || '')
  const codeParam = parseCodeParam(params.get('code'))
  const langParam = params.get('lang')

  if (from && from !== '/') {
    pageTitle.value = from.split('/').pop()?.replace(/-/g, ' ') || 'Playground'
  } else {
    pageTitle.value = 'Playground'
  }

  if (langParam === 'go' || langParam === 'csharp') {
    lang.value = langParam
  }

  if (codeParam) {
    code.value = codeParam
    await nextTick()
    createEditor()
    return
  }

  if (from && from !== '/') {
    try {
      const base = import.meta.env.BASE_URL || '/dsa/'
      const res = await fetch(`${base}examples-manifest.json`)
      if (res.ok) {
        const manifest = await res.json()
        const examples = manifest[from]
        if (examples?.[lang.value]) {
          code.value = examples[lang.value]
          await nextTick()
          createEditor()
          return
        }
      }
    } catch { /* fall through */ }
  }

  await loadPersisted()
  await nextTick()
  createEditor()
}

async function saveSnippet() {
  const title = prompt('Snippet name:', pageTitle.value)
  if (!title) return
  const all = await getSnippets()
  const snippet = {
    id: generateId(),
    title,
    lang: lang.value,
    code: code.value,
    sourcePage: new URLSearchParams(window.location.search).get('from') || undefined,
    createdAt: Date.now(),
  }
  await setSnippets([snippet, ...all])
  snippets.value = await getSnippets()
  showToast('Snippet saved')
}

async function loadSnippet(snippet) {
  lang.value = snippet.lang
  code.value = snippet.code
  createEditor()
}

function copyCode() {
  navigator.clipboard.writeText(code.value)
  showToast('Code copied')
}

function handleReset() {
  reset()
  createEditor()
}

onMounted(async () => {
  isDark.value = document.documentElement.classList.contains('dark')
  themeObserver = new MutationObserver(() => {
    isDark.value = document.documentElement.classList.contains('dark')
    createEditor()
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

  snippets.value = await getSnippets()
  await loadFromPage()
})

if (typeof window !== 'undefined') {
  watch(
    () => window.location.search,
    async () => {
      if (normalizePagePath(route.path).endsWith('/playground')) {
        await loadFromPage()
      }
    }
  )
}

onUnmounted(() => {
  editorView?.destroy()
  themeObserver?.disconnect()
  persist()
})
</script>

<template>
  <div class="playground-page">
    <div class="playground-header">
      <a href="javascript:history.back()" class="back-link">← Back</a>
      <h2>Playground — {{ pageTitle }}</h2>
      <div class="lang-tabs">
        <button :class="{ active: lang === 'go' }" @click="switchLang('go')">Go</button>
        <button :class="{ active: lang === 'csharp' }" @click="switchLang('csharp')">C#</button>
      </div>
    </div>

    <div class="playground-body">
      <div class="editor-pane">
        <div ref="editorEl" class="editor-container" />
      </div>
      <div class="output-pane">
        <div class="output-header">Output</div>
        <pre v-if="output" class="output-content">{{ output }}</pre>
        <p v-else class="output-empty">Run your code to see output here.</p>
        <a v-if="permalink" :href="permalink" target="_blank" rel="noopener" class="permalink">
          Open Wandbox permalink →
        </a>
      </div>
    </div>

    <div class="playground-controls">
      <button class="btn primary" :disabled="running" @click="runWandbox">
        {{ running ? 'Running...' : '▶ Run with Wandbox' }}
      </button>
      <button class="btn" @click="openWandbox">Open Wandbox</button>
      <button class="btn" @click="copyCode">Copy</button>
      <button class="btn" @click="saveSnippet">Save Snippet</button>
      <button class="btn" @click="handleReset">Reset</button>
      <div class="stdin-row">
        <label for="stdin">Stdin:</label>
        <input id="stdin" v-model="stdin" type="text" placeholder="Optional stdin" class="stdin-input" />
      </div>
      <span v-if="compilerName" class="compiler-tag">{{ compilerName }}</span>
    </div>

    <div v-if="snippets.length" class="snippets-list">
      <h4>Saved Snippets</h4>
      <ul>
        <li v-for="s in snippets.slice(0, 10)" :key="s.id">
          <button @click="loadSnippet(s)">{{ s.title }} ({{ s.lang }})</button>
        </li>
      </ul>
    </div>

    <p class="hint">
      Powered by <a href="https://wandbox.org" target="_blank" rel="noopener">wandbox.org</a>.
      Code is saved locally in your browser.
    </p>
  </div>
</template>

<style scoped>
.playground-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px 48px;
}

.playground-header {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.playground-header h2 {
  margin: 0;
  flex: 1;
  font-size: 20px;
}

.back-link {
  color: var(--vp-c-text-2);
  text-decoration: none;
  font-size: 14px;
}

.lang-tabs {
  display: flex;
  gap: 4px;
}

.lang-tabs button {
  padding: 4px 14px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 13px;
}

.lang-tabs button.active {
  background: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-1);
}

.playground-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  min-height: 360px;
}

@media (max-width: 768px) {
  .playground-body {
    grid-template-columns: 1fr;
  }
}

.editor-pane, .output-pane {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.editor-container {
  height: 360px;
  overflow: auto;
}

.output-header {
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

.output-content {
  padding: 12px;
  margin: 0;
  font-size: 13px;
  white-space: pre-wrap;
  font-family: ui-monospace, monospace;
  max-height: 320px;
  overflow: auto;
}

.output-empty {
  padding: 12px;
  font-size: 13px;
  color: var(--vp-c-text-3);
  margin: 0;
}

.permalink {
  display: block;
  padding: 8px 12px;
  font-size: 12px;
  color: var(--vp-c-brand-1);
}

.playground-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-top: 12px;
}

.btn {
  padding: 6px 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
}

.btn.primary {
  background: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-1);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.stdin-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 200px;
}

.stdin-row label {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.stdin-input {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  font-size: 13px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.compiler-tag {
  font-size: 11px;
  color: var(--vp-c-text-3);
}

.snippets-list {
  margin-top: 16px;
}

.snippets-list h4 {
  font-size: 13px;
  margin: 0 0 8px;
}

.snippets-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.snippets-list button {
  padding: 4px 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.hint {
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin-top: 12px;
}
</style>