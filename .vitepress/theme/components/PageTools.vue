<script setup>
import { ref, computed, onMounted } from 'vue'
import { useData, useRoute } from 'vitepress'

const { page, frontmatter } = useData()
const route = useRoute()

const showPlayground = ref(false)
const lang = ref('go')
const code = ref('')
const output = ref('')
const running = ref(false)

const title = computed(() => page.value.title || 'DSA Topic')

// Simple mapping for related examples based on path/title
const exampleMap = {
  'binary-search': {
    go: `package main

import "fmt"

func BinarySearch(arr []int, target int) int {
    low, high := 0, len(arr)-1
    for low <= high {
        mid := low + (high-low)/2
        if arr[mid] == target {
            return mid
        }
        if arr[mid] < target {
            low = mid + 1
        } else {
            high = mid - 1
        }
    }
    return -1
}

func main() {
    arr := []int{1, 3, 5, 7, 9, 11}
    fmt.Println(BinarySearch(arr, 7)) // 3
}`,
    csharp: `using System;

class Program {
    static int BinarySearch(int[] arr, int target) {
        int low = 0, high = arr.Length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }
    static void Main() {
        int[] arr = {1,3,5,7,9,11};
        Console.WriteLine(BinarySearch(arr, 7));
    }
}`
  },
  'segment-tree': {
    go: `// Simplified Segment Tree for range sum
package main
import "fmt"

type SegTree struct { tree []int; n int }
func NewSegTree(a []int) *SegTree { /* ... full impl from handbook ... */ return nil }
func main() { fmt.Println("Run range sum example") }`,
    csharp: `// See full SegmentTree class in the chapter`
  }
}

function loadExample() {
  const path = route.path.toLowerCase()
  let ex = null
  if (path.includes('binary') || path.includes('search')) ex = exampleMap['binary-search']
  else if (path.includes('segment')) ex = exampleMap['segment-tree']
  
  if (ex) {
    code.value = lang.value === 'go' ? ex.go : ex.csharp
  } else {
    // default template
    code.value = lang.value === 'go' 
      ? 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello from Wandbox!")\n}'
      : 'using System;\nclass Program { static void Main() { System.Console.WriteLine("Hello C#"); } }'
  }
}

async function runWandbox() {
  running.value = true
  output.value = 'Compiling on Wandbox...'
  
  const compiler = lang.value === 'go' ? 'go-1.21.5' : 'mono-6.12.0.122'
  
  try {
    const res = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        compiler,
        code: code.value,
        stdin: '',
        options: '',
        'compiler-option-raw': '',
        'runtime-option-raw': ''
      })
    })
    
    const data = await res.json()
    let out = ''
    if (data.program_message) out += data.program_message + '\n'
    if (data.compiler_message) out += 'Compiler: ' + data.compiler_message + '\n'
    if (data.status) out += 'Status: ' + data.status + '\n'
    
    output.value = out || 'No output (check compiler)'
  } catch (e) {
    output.value = 'Error calling Wandbox API. Try the "Open in Wandbox" button.\n' + e
  }
  running.value = false
}

function openWandbox() {
  // Best effort: open the site. User can paste code.
  window.open('https://wandbox.org/', '_blank')
  // In future we can try to construct permlink if API supports direct creation
}

function sharePage() {
  navigator.clipboard.writeText(window.location.href)
  alert('Link copied to clipboard!')
}

function giveToAI() {
  const prompt = `You are an expert tutor on Data Structures and Algorithms.

Please explain the following topic from the "DSA Handbook" in a clear, beginner-friendly way. Include:
- The core problem it solves
- Intuitive explanation
- Real-world use cases
- Simple code examples in Go and C#

Topic: ${title.value}

Page: ${window.location.href}

Start your explanation now.`

  navigator.clipboard.writeText(prompt)
  const choice = confirm('Prompt copied!\n\nOpen ChatGPT?')
  if (choice) {
    window.open(`https://chat.openai.com/?q=${encodeURIComponent(prompt)}`, '_blank')
  }
}

onMounted(() => {
  // Auto load a sensible example when playground opens
})
</script>

<template>
  <div class="page-tools">
    <div class="actions">
      <button @click="sharePage" class="btn">🔗 Share</button>
      <button @click="giveToAI" class="btn">🤖 Give to AI</button>
      <button @click="() => { showPlayground = true; loadExample() }" class="btn primary">
        ▶️ Play in Wandbox
      </button>
    </div>

    <!-- Playground Modal -->
    <div v-if="showPlayground" class="playground-modal" @click.self="showPlayground = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Playground — {{ title }}</h3>
          <button @click="showPlayground = false">✕</button>
        </div>

        <div class="lang-tabs">
          <button :class="{active: lang==='go'}" @click="lang='go'; loadExample()">Go</button>
          <button :class="{active: lang==='csharp'}" @click="lang='csharp'; loadExample()">C#</button>
        </div>

        <textarea v-model="code" class="code-editor" rows="12" placeholder="Paste or edit your code here..."></textarea>

        <div class="controls">
          <button @click="runWandbox" :disabled="running" class="btn primary">
            {{ running ? 'Running on Wandbox...' : 'Run with Wandbox' }}
          </button>
          <button @click="openWandbox" class="btn">Open full Wandbox →</button>
        </div>

        <pre v-if="output" class="output"><code>{{ output }}</code></pre>

        <p class="hint">
          Powered by <a href="https://wandbox.org" target="_blank">wandbox.org</a>. 
          Paste code from the chapter above for best results.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-tools {
  margin: 40px 0 20px;
  padding-top: 16px;
  border-top: 1px solid var(--vp-c-divider);
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  padding: 6px 12px;
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

.playground-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}
.modal-content {
  background: var(--vp-c-bg);
  width: 92%;
  max-width: 720px;
  border-radius: 12px;
  padding: 16px;
  max-height: 85vh;
  overflow: auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.code-editor {
  width: 100%;
  font-family: ui-monospace, monospace;
  font-size: 13px;
  padding: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: #0f172a;
  color: #e2e8f0;
}
.output {
  background: #111827;
  padding: 12px;
  border-radius: 8px;
  white-space: pre-wrap;
  font-size: 13px;
  margin-top: 12px;
  max-height: 180px;
  overflow: auto;
}
.lang-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}
.lang-tabs button {
  padding: 4px 12px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.lang-tabs button.active {
  background: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-1);
}
.hint {
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin-top: 8px;
}
</style>