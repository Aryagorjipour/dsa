import { ref, computed } from 'vue'
import { getPlaygroundState, setPlaygroundState } from './useStorage'
import { assertOnline } from '../utils/networkFeatures'

export type PlaygroundLang = 'go' | 'csharp'

const DEFAULT_GO = `package main

import "fmt"

func main() {
\tfmt.Println("Hello from DSA Playground!")
}`

const DEFAULT_CSHARP = `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello from DSA Playground!");
    }
}`

export function usePlayground() {
  const lang = ref<PlaygroundLang>('go')
  const code = ref(DEFAULT_GO)
  const stdin = ref('')
  const output = ref('')
  const running = ref(false)
  const compilerName = ref('')
  const permalink = ref('')
  const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)

  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => { isOnline.value = true })
    window.addEventListener('offline', () => { isOnline.value = false })
  }

  const canRunOnline = computed(() => isOnline.value)

  async function loadPersisted() {
    const state = await getPlaygroundState()
    if (state.go) code.value = lang.value === 'go' ? state.go : code.value
    if (state.csharp) code.value = lang.value === 'csharp' ? state.csharp : code.value
  }

  async function persist() {
    const state = await getPlaygroundState()
    if (lang.value === 'go') {
      await setPlaygroundState({ ...state, go: code.value })
    } else {
      await setPlaygroundState({ ...state, csharp: code.value })
    }
  }

  function setLang(newLang: PlaygroundLang) {
    lang.value = newLang
    getPlaygroundState().then(state => {
      code.value = newLang === 'go'
        ? (state.go || DEFAULT_GO)
        : (state.csharp || DEFAULT_CSHARP)
    })
  }

  function setCode(newCode: string) {
    code.value = newCode
    persist()
  }

  async function runWandbox() {
    const check = assertOnline('wandbox', navigator.onLine)
    if (!check.ok) {
      output.value = `${check.title}\n\n${check.message}`
      return
    }

    running.value = true
    output.value = 'Fetching compilers and compiling on Wandbox...'
    permalink.value = ''

    try {
      const listRes = await fetch('https://wandbox.org/api/list.json')
      if (!listRes.ok) throw new Error('Failed to fetch compiler list')
      const compilersList = await listRes.json()

      let selected = ''
      if (lang.value === 'go') {
        const goComp = compilersList.find((c: { language: string; name: string }) =>
          c.language === 'Go' || c.name.toLowerCase().startsWith('go-') || c.name === 'go-head'
        )
        selected = goComp ? goComp.name : 'go-head'
      } else {
        const csComp = compilersList.find((c: { language: string; name: string }) =>
          c.language === 'C#' || c.name.toLowerCase().includes('mono') ||
          c.name.toLowerCase().includes('csc') || c.name === 'mcs-head'
        )
        selected = csComp ? csComp.name : 'mcs-head'
      }
      compilerName.value = selected

      const res = await fetch('https://wandbox.org/api/compile.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compiler: selected,
          code: code.value,
          stdin: stdin.value,
          options: '',
          'compiler-option-raw': '',
          'runtime-option-raw': '',
        }),
      })

      const text = await res.text()
      let data: {
        program_message?: string
        compiler_message?: string
        status?: string
        url?: string
      }

      try {
        data = JSON.parse(text)
      } catch {
        output.value = `Wandbox API error (status ${res.status}). Response was not JSON:\n${text.substring(0, 500)}\n\nTry "Open in Wandbox" and paste the code manually.`
        running.value = false
        return
      }

      let out = ''
      if (data.program_message) out += data.program_message + '\n'
      if (data.compiler_message) out += 'Compiler output:\n' + data.compiler_message + '\n'
      if (data.status !== undefined) out += `Status: ${data.status}\n`
      if (data.url) {
        permalink.value = data.url
        out += `Permalink: ${data.url}\n`
      }

      output.value = out.trim() || 'No output returned. The code may have compiled but produced no stdout.'

      if (!res.ok || data.status !== '0') {
        output.value += '\n\nTip: Click "Open in Wandbox" to debug on the official site.'
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      const offlineHint = navigator.onLine
        ? '\n\nYour code is saved locally. Try "Open in Wandbox" to debug on the official site.'
        : '\n\nYou appear to be offline. Your code is saved locally — try again when connected.'
      output.value = `Error calling Wandbox API: ${msg}${offlineHint}`
    }

    running.value = false
    await persist()
  }

  function openWandbox() {
    window.open('https://wandbox.org/', '_blank', 'noopener')
  }

  function reset() {
    code.value = lang.value === 'go' ? DEFAULT_GO : DEFAULT_CSHARP
    output.value = ''
    permalink.value = ''
    persist()
  }

  return {
    lang,
    code,
    stdin,
    output,
    running,
    compilerName,
    permalink,
    canRunOnline,
    loadPersisted,
    persist,
    setLang,
    setCode,
    runWandbox,
    openWandbox,
    reset,
    DEFAULT_GO,
    DEFAULT_CSHARP,
  }
}