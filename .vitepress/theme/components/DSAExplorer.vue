<script setup lang="ts">
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
      { name: 'A* Search', path: '/algorithms/31-astar' },
      { name: 'Dynamic Programming (Knapsack, LCS...)', path: '/algorithms/32-dp-fundamentals' },
      { name: 'Aho-Corasick', path: '/algorithms/42-aho-corasick' },
      { name: 'Rate Limiting', path: '/algorithms/47-rate-limiting' },
      // ... (can be expanded)
    ]
  },
  {
    name: 'Resources',
    children: [
      { name: 'Production Use Cases', path: '/resources/production-use-cases' },
      { name: 'Further Reading', path: '/resources/further-reading' },
    ]
  }
]
</script>

<template>
  <div class="dsa-explorer">
    <div style="font-weight:600; margin-bottom:8px; color: var(--vp-c-text-1);">
      Handbook Structure
    </div>
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
</template>