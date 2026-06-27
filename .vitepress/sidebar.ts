export interface SidebarLink {
  text: string
  link: string
}

export interface SidebarGroup {
  text: string
  collapsed?: boolean
  items: (SidebarLink | SidebarGroup)[]
}

export function isSidebarGroup(item: SidebarLink | SidebarGroup): item is SidebarGroup {
  return 'items' in item && !('link' in item)
}

/** Single source of truth for handbook navigation */
export const sidebar: SidebarGroup[] = [
  {
    text: 'Fundamentals',
    collapsed: false,
    items: [
      { text: 'What is a Data Structure?', link: '/fundamentals/00-what-is-a-data-structure' },
      { text: 'What is an Algorithm?', link: '/fundamentals/00-what-is-an-algorithm' },
      { text: 'Big O Notation', link: '/fundamentals/01-big-o' },
      { text: 'Recursion and Memoization', link: '/fundamentals/02-recursion-and-memoization' },
      { text: 'Divide and Conquer', link: '/fundamentals/03-divide-and-conquer' },
      { text: 'Greedy Paradigm', link: '/fundamentals/04-greedy-paradigm' },
      { text: 'Two Pointers and Sliding Window', link: '/fundamentals/05-two-pointers-sliding-window' },
    ],
  },
  {
    text: 'Data Structures',
    collapsed: true,
    items: [
      { text: '1. Array', link: '/data-structures/01-array' },
      { text: '2. Dynamic Array', link: '/data-structures/02-dynamic-array' },
      { text: '3. Linked List', link: '/data-structures/03-linked-list' },
      { text: '4. Stack', link: '/data-structures/04-stack' },
      { text: '5. Queue', link: '/data-structures/05-queue' },
      { text: '6. Deque', link: '/data-structures/06-deque' },
      { text: '7. Ring Buffer', link: '/data-structures/07-ring-buffer' },
      { text: '8. Hash Set', link: '/data-structures/08-hash-set' },
      { text: '9. Hash Map', link: '/data-structures/09-hash-map' },
      { text: '10. LRU Cache', link: '/data-structures/10-lru-cache' },
      { text: '11. LFU Cache', link: '/data-structures/11-lfu-cache' },
      { text: '12. General Tree (N-ary)', link: '/data-structures/12-tree-n-ary' },
      { text: '13. Binary Search Tree', link: '/data-structures/13-binary-search-tree' },
      { text: '14. Red-Black Tree', link: '/data-structures/14-red-black-tree' },
      { text: '15. Heap', link: '/data-structures/15-heap' },
      { text: '16. Priority Queue', link: '/data-structures/16-priority-queue' },
      { text: '17. Trie', link: '/data-structures/17-trie' },
      { text: '18. B-Tree & B+ Tree', link: '/data-structures/18-btree-bplustree' },
      { text: '19. Skip List', link: '/data-structures/19-skip-list' },
      { text: '20. Segment Tree', link: '/data-structures/20-segment-tree' },
      { text: '21. Fenwick Tree', link: '/data-structures/21-fenwick-tree' },
      { text: '22. Merkle Tree', link: '/data-structures/22-merkle-tree' },
      { text: '23. Graph', link: '/data-structures/23-graph' },
      { text: '24. Bloom Filter', link: '/data-structures/24-bloom-filter' },
      { text: '25. Disjoint Set (Union-Find)', link: '/data-structures/25-disjoint-set-union-find' },
      { text: '26. HyperLogLog', link: '/data-structures/26-hyperloglog' },
      { text: '27. Count-Min Sketch', link: '/data-structures/27-count-min-sketch' },
      { text: '28. Cuckoo Filter', link: '/data-structures/28-cuckoo-filter' },
      { text: '29. Rope', link: '/data-structures/29-rope' },
      { text: '30. Gap Buffer', link: '/data-structures/30-gap-buffer' },
      { text: '31. Suffix Array', link: '/data-structures/31-suffix-array' },
      { text: '32. Quadtree', link: '/data-structures/32-quadtree' },
      { text: '33. KD Tree', link: '/data-structures/33-kd-tree' },
      { text: '34. R-Tree', link: '/data-structures/34-rtree' },
    ],
  },
  {
    text: 'Algorithms',
    collapsed: true,
    items: [
      { text: '0. What is an Algorithm?', link: '/fundamentals/00-what-is-an-algorithm' },
      { text: '1. Big O', link: '/fundamentals/01-big-o' },
      { text: '2. Recursion and Memoization', link: '/fundamentals/02-recursion-and-memoization' },
      { text: '3. Divide and Conquer', link: '/fundamentals/03-divide-and-conquer' },
      { text: '4. Greedy Paradigm', link: '/fundamentals/04-greedy-paradigm' },
      { text: '5. Two Pointers & Sliding Window', link: '/fundamentals/05-two-pointers-sliding-window' },
      { text: '6. Linear Search', link: '/algorithms/06-linear-search' },
      { text: '7. Binary Search (Two Crystal Balls)', link: '/algorithms/07-binary-search' },
      { text: '8. Pseudocode Binary Search', link: '/algorithms/08-pseudocode-binary-search' },
      { text: '9. Exponential Search', link: '/algorithms/09-exponential-search' },
      { text: '10. Bubble Sort', link: '/algorithms/10-bubble-sort' },
      { text: '11. Insertion Sort', link: '/algorithms/11-insertion-sort' },
      { text: '12. Merge Sort', link: '/algorithms/12-merge-sort' },
      { text: '13. Quicksort', link: '/algorithms/13-quicksort' },
      { text: '14. Heapsort', link: '/algorithms/14-heapsort' },
      { text: '15. Timsort', link: '/algorithms/15-timsort' },
      { text: '16. Counting Sort', link: '/algorithms/16-counting-sort' },
      { text: '17. Radix Sort', link: '/algorithms/17-radix-sort' },
      { text: '18. Hashing', link: '/algorithms/18-hashing' },
      { text: '19. Quickselect', link: '/algorithms/19-quickselect' },
      { text: '20. Reservoir Sampling', link: '/algorithms/20-reservoir-sampling' },
      { text: '21-22. BST Operations', link: '/algorithms/21-bst-operations' },
      { text: '23. Self-balancing Trees', link: '/algorithms/23-self-balancing-trees' },
      { text: '24. Trie Operations', link: '/algorithms/24-trie-operations' },
      { text: '25. BFS', link: '/algorithms/25-bfs' },
      { text: '26. DFS', link: '/algorithms/26-dfs' },
      { text: '27. Topological Sort', link: '/algorithms/27-topological-sort' },
      { text: '28. Dijkstra', link: '/algorithms/28-dijkstra' },
      { text: '29. Bellman-Ford', link: '/algorithms/29-bellman-ford' },
      { text: '30. Floyd-Warshall', link: '/algorithms/30-floyd-warshall' },
      { text: '31. Minimum Spanning Tree', link: '/algorithms/31-mst-kruskal-prim' },
      { text: '32. A* Search', link: '/algorithms/32-astar' },
      { text: '33. DP Fundamentals', link: '/algorithms/33-dp-fundamentals' },
      { text: '34. 0/1 Knapsack', link: '/algorithms/34-0-1-knapsack' },
      { text: '35. LCS', link: '/algorithms/35-lcs' },
      { text: '36. Edit Distance', link: '/algorithms/36-edit-distance' },
      { text: '37. Matrix Chain Multiplication', link: '/algorithms/37-matrix-chain-multiplication' },
      { text: '38. LIS', link: '/algorithms/38-longest-increasing-subsequence' },
      { text: '39. KMP', link: '/algorithms/39-kmp' },
      { text: '40. Rabin-Karp', link: '/algorithms/40-rabin-karp' },
      { text: '41. Boyer-Moore', link: '/algorithms/41-boyer-moore' },
      { text: '42. Z-Algorithm', link: '/algorithms/42-z-algorithm' },
      { text: '43. Aho-Corasick', link: '/algorithms/43-aho-corasick' },
      { text: '44. Backtracking', link: '/algorithms/44-backtracking' },
      { text: '45. Bit Manipulation', link: '/algorithms/45-bit-manipulation' },
      { text: '46. Bloom Filter (Alg)', link: '/algorithms/46-bloom-filter-alg' },
      { text: '47. Consistent Hashing', link: '/algorithms/47-consistent-hashing' },
      { text: '48. Rate Limiting', link: '/algorithms/48-rate-limiting' },
    ],
  },
  {
    text: 'Resources',
    collapsed: true,
    items: [
      { text: 'Further Reading', link: '/resources/further-reading' },
      { text: 'Books', link: '/resources/books' },
      { text: 'Papers', link: '/resources/papers' },
      { text: 'Visualizations', link: '/resources/visualizations' },
      { text: 'Production Use Cases', link: '/resources/production-use-cases' },
      { text: 'Complexity Cheat Sheet', link: '/resources/complexity-cheatsheet' },
      { text: 'Implementations', link: '/resources/implementations' },
    ],
  },
  {
    text: 'Project Lab',
    collapsed: true,
    items: [
      { text: 'Overview', link: '/projects/README' },
      { text: 'Discover by Category', link: '/projects/discover/by-category' },
      { text: 'Discover by Data Structure', link: '/projects/discover/by-data-structure' },
      { text: 'Discover by Algorithm', link: '/projects/discover/by-algorithm' },
      { text: 'Contributing', link: '/projects/contributing' },
      {
        text: 'Tier 1 — Foundations',
        collapsed: false,
        items: [
          { text: '1. Search Library', link: '/projects/tier-1/01-search-library' },
          { text: '2. Sorting Benchmarker', link: '/projects/tier-1/02-sorting-benchmarker' },
          { text: '3. Stack-Based Expression Evaluator', link: '/projects/tier-1/03-stack-calculator' },
          { text: '4. Hash Map from Scratch', link: '/projects/tier-1/04-hash-map-from-scratch' },
        ],
      },
      {
        text: 'Tier 2 — Core Systems',
        collapsed: false,
        items: [
          { text: '5. Cache with Eviction Policies', link: '/projects/tier-2/05-cache-with-eviction' },
          { text: '6. Task Queue System', link: '/projects/tier-2/06-task-queue-system' },
          { text: '7. Autocomplete Engine', link: '/projects/tier-2/07-autocomplete-engine' },
          { text: '8. Route Planner', link: '/projects/tier-2/08-route-planner' },
          { text: '9. Statistical Sampler', link: '/projects/tier-2/09-statistical-sampler' },
        ],
      },
      {
        text: 'Tier 3 — Advanced Systems',
        collapsed: false,
        items: [
          { text: '10. In-Memory Database Index', link: '/projects/tier-3/10-in-memory-db-index' },
          { text: '11. Persistent Key-Value Store', link: '/projects/tier-3/11-key-value-store' },
          { text: '12. Time-Series Analytics Engine', link: '/projects/tier-3/12-time-series-analytics' },
          { text: '13. Full-Text Search Engine', link: '/projects/tier-3/13-full-text-search-engine' },
          { text: '14. Dynamic Programming Toolkit', link: '/projects/tier-3/14-dp-toolkit' },
          { text: '15. Network Optimizer', link: '/projects/tier-3/15-network-optimizer' },
        ],
      },
      {
        text: 'Tier 4 — Expert / Production',
        collapsed: false,
        items: [
          { text: '16. Mini Version Control System', link: '/projects/tier-4/16-mini-version-control' },
          { text: '17. Distributed Cache', link: '/projects/tier-4/17-distributed-cache' },
          { text: '18. API Rate Limiter', link: '/projects/tier-4/18-api-rate-limiter' },
          { text: '19. Stream Analytics Pipeline', link: '/projects/tier-4/19-stream-analytics-pipeline' },
          { text: '20. Text Editor Engine', link: '/projects/tier-4/20-text-editor-engine' },
          { text: '21. Geospatial Index', link: '/projects/tier-4/21-geospatial-index' },
          { text: '22. Constraint Solver', link: '/projects/tier-4/22-constraint-solver' },
        ],
      },
    ],
  },
]

export function flattenSidebar(groups: (SidebarLink | SidebarGroup)[]): SidebarLink[] {
  const result: SidebarLink[] = []
  for (const item of groups) {
    if (isSidebarGroup(item)) {
      result.push(...flattenSidebar(item.items))
    } else if (item.link) {
      result.push({ text: item.text, link: item.link })
    }
  }
  return result
}

/** Handbook chapter sequence for prev/next navigation */
export function getChapterOrder(): SidebarLink[] {
  const handbookSections = ['Fundamentals', 'Data Structures', 'Algorithms']
  const order: SidebarLink[] = []
  const seen = new Set<string>()

  for (const group of sidebar) {
    if (!handbookSections.includes(group.text)) continue
    for (const item of flattenSidebar(group.items)) {
      if (seen.has(item.link)) continue
      seen.add(item.link)
      order.push(item)
    }
  }
  return order
}

export function getSectionMap(): Record<string, string> {
  const map: Record<string, string> = {}
  for (const group of sidebar) {
    for (const item of flattenSidebar(group.items)) {
      map[item.link] = group.text
    }
  }
  return map
}

export interface ExplorerSection {
  name: string
  children: SidebarLink[]
}

export function getExplorerTree(): ExplorerSection[] {
  return sidebar.map(group => ({
    name: group.text,
    children: flattenSidebar(group.items),
  }))
}