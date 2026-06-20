<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const collapsed = ref(false)
const focusMode = ref(false)

const tree = [
  {
    name: 'Fundamentals',
    children: [
      { name: 'What is a Data Structure?', path: '/fundamentals/00-what-is-a-data-structure' },
      { name: 'What is an Algorithm?', path: '/fundamentals/00-what-is-an-algorithm' },
      { name: 'Big O Notation', path: '/fundamentals/01-big-o' },
      { name: 'Recursion & Memoization', path: '/fundamentals/02-recursion-and-memoization' },
      { name: 'Divide and Conquer', path: '/fundamentals/03-divide-and-conquer' },
      { name: 'Greedy Paradigm', path: '/fundamentals/04-greedy-paradigm' },
      { name: 'Two Pointers & Sliding Window', path: '/fundamentals/05-two-pointers-sliding-window' },
    ]
  },
  {
    name: 'Data Structures',
    children: [
      { name: '01. Array', path: '/data-structures/01-array' },
      { name: '02. Dynamic Array', path: '/data-structures/02-dynamic-array' },
      { name: '03. Linked List', path: '/data-structures/03-linked-list' },
      { name: '04. Stack', path: '/data-structures/04-stack' },
      { name: '05. Queue', path: '/data-structures/05-queue' },
      { name: '06. Deque', path: '/data-structures/06-deque' },
      { name: '07. Ring Buffer', path: '/data-structures/07-ring-buffer' },
      { name: '08. Hash Set', path: '/data-structures/08-hash-set' },
      { name: '09. Hash Map', path: '/data-structures/09-hash-map' },
      { name: '10. LRU Cache', path: '/data-structures/10-lru-cache' },
      { name: '11. LFU Cache', path: '/data-structures/11-lfu-cache' },
      { name: '12. N-ary Tree', path: '/data-structures/12-tree-n-ary' },
      { name: '13. Binary Search Tree', path: '/data-structures/13-binary-search-tree' },
      { name: '14. Red-Black Tree', path: '/data-structures/14-red-black-tree' },
      { name: '15. Heap', path: '/data-structures/15-heap' },
      { name: '16. Priority Queue', path: '/data-structures/16-priority-queue' },
      { name: '17. Trie', path: '/data-structures/17-trie' },
      { name: '18. B+ Tree', path: '/data-structures/18-btree-bplustree' },
      { name: '19. Skip List', path: '/data-structures/19-skip-list' },
      { name: '20. Segment Tree', path: '/data-structures/20-segment-tree' },
      { name: '21. Fenwick Tree', path: '/data-structures/21-fenwick-tree' },
      { name: '22. Merkle Tree', path: '/data-structures/22-merkle-tree' },
      { name: '23. Graph', path: '/data-structures/23-graph' },
      { name: '24. Bloom Filter', path: '/data-structures/24-bloom-filter' },
      { name: '25. Disjoint Set', path: '/data-structures/25-disjoint-set-union-find' },
      { name: '26. HyperLogLog', path: '/data-structures/26-hyperloglog' },
      { name: '27. Count-Min Sketch', path: '/data-structures/27-count-min-sketch' },
      { name: '28. Cuckoo Filter', path: '/data-structures/28-cuckoo-filter' },
      { name: '29. Rope', path: '/data-structures/29-rope' },
      { name: '30. Gap Buffer', path: '/data-structures/30-gap-buffer' },
      { name: '31. Suffix Array', path: '/data-structures/31-suffix-array' },
      { name: '32. Quadtree', path: '/data-structures/32-quadtree' },
      { name: '33. KD Tree', path: '/data-structures/33-kd-tree' },
      { name: '34. R-Tree', path: '/data-structures/34-rtree' },
    ]
  },
  {
    name: 'Algorithms',
    children: [
      { name: 'Binary Search (+ Two Crystal Balls)', path: '/algorithms/07-binary-search' },
      { name: 'Merge Sort / Quicksort / Heapsort', path: '/algorithms/12-merge-sort' },
      { name: 'A* Search', path: '/algorithms/32-astar' },
      { name: 'Dynamic Programming (Knapsack, LCS...)', path: '/algorithms/33-dp-fundamentals' },
      { name: 'Aho-Corasick', path: '/algorithms/43-aho-corasick' },
      { name: 'Rate Limiting', path: '/algorithms/48-rate-limiting' },
    ]
  },
  {
    name: 'Resources',
    children: [
      { name: 'Production Use Cases', path: '/resources/production-use-cases' },
      { name: 'Further Reading', path: '/resources/further-reading' },
    ]
  },
  {
    name: 'Project Lab',
    children: [
      { name: 'Overview', path: '/projects/README' },
      { name: 'Discover by Category', path: '/projects/discover/by-category' },
      { name: 'Tier 1: Search Library', path: '/projects/tier-1/01-search-library' },
      { name: 'Tier 2: Cache & Eviction', path: '/projects/tier-2/05-cache-with-eviction' },
      { name: 'Tier 2: Route Planner', path: '/projects/tier-2/08-route-planner' },
      { name: 'Tier 3: KV Store', path: '/projects/tier-3/11-key-value-store' },
      { name: 'Tier 4: Distributed Cache', path: '/projects/tier-4/17-distributed-cache' },
    ]
  }
]

function toggleCollapse() {
  collapsed.value = !collapsed.value
}

function toggleFocus() {
  focusMode.value = !focusMode.value
  if (focusMode.value) {
    document.documentElement.classList.add('focus-mode')
  } else {
    document.documentElement.classList.remove('focus-mode')
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key.toLowerCase() === 'f' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault()
    toggleFocus()
  }
  if (e.key === 'Escape' && focusMode.value) {
    toggleFocus()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.documentElement.classList.remove('focus-mode')
})
</script>

<template>
  <div class="dsa-explorer" :class="{ collapsed: collapsed }">
    <div class="explorer-header">
      <span>Handbook Structure</span>
      <button class="toggle-btn" @click="toggleCollapse" :title="collapsed ? 'Expand' : 'Collapse'">
        {{ collapsed ? '▲' : '▼' }}
      </button>
    </div>

    <div class="explorer-content" :class="{ 'is-collapsed': collapsed }">
      <ul>
        <li v-for="section in tree" :key="section.name">
          <div class="folder">{{ section.name }}</div>
          <ul>
            <li v-for="item in section.children" :key="item.path">
              <a :href="item.path">{{ item.name }}</a>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <div class="explorer-footer">
      <button class="focus-btn" @click="toggleFocus" :title="focusMode ? 'Exit Focus (Esc)' : 'Focus Mode (⌘F / Ctrl+F)'">
        {{ focusMode ? 'Exit Focus' : 'Focus' }}
      </button>
      <button class="collapse-btn" @click="toggleCollapse" :title="collapsed ? 'Expand tree' : 'Collapse from bottom'">
        {{ collapsed ? 'Expand ↑' : 'Collapse' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.dsa-explorer {
  font-size: 13px;
  line-height: 1.45;
  transition: all 0.2s ease;
}

.explorer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--vp-c-text-1);
  font-size: 13px;
}

.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--vp-c-text-2);
  padding: 2px 6px;
  line-height: 1;
}

.explorer-content {
  max-height: 420px;
  overflow-y: auto;
  transition: max-height 0.25s ease;
}

.dsa-explorer.collapsed .explorer-content {
  max-height: 0;
  overflow: hidden;
}

.dsa-explorer ul {
  list-style: none;
  padding-left: 10px;
  margin: 1px 0;
}

.dsa-explorer > ul {
  padding-left: 0;
}

.dsa-explorer .folder {
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-top: 6px;
  font-size: 12px;
}

.dsa-explorer a {
  color: var(--vp-c-text-2);
  text-decoration: none;
  display: block;
  padding: 1px 0;
}

.dsa-explorer a:hover {
  color: var(--vp-c-brand-1);
}

.explorer-footer {
  margin-top: 8px;
  display: flex;
  gap: 6px;
}

.focus-btn, .collapse-btn {
  font-size: 11px;
  padding: 2px 8px;
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
  border-radius: 4px;
  cursor: pointer;
}

.focus-btn:hover, .collapse-btn:hover {
  background: var(--vp-c-bg-alt);
}
</style>