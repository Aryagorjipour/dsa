import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'DSA Handbook',
  description: 'From Zero to "I Actually Get It and Use It Daily" — A complete, real-world guide to Data Structures & Algorithms in C# and Go.',
  base: '/dsa/',
  srcDir: '.',
  cleanUrls: true,

  head: [
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    ['link', { rel: 'apple-touch-icon', href: '/favicon.svg', sizes: '180x180' }],
    ['link', { rel: 'mask-icon', href: '/favicon.svg', color: '#6366f1' }]
  ],

  // Ensure favicon works well on GitHub Pages
  vite: {
    publicDir: '.vitepress/public'
  },

  themeConfig: {
    logo: '/images/logo.svg',

    nav: [
      { text: 'GitHub', link: 'https://github.com/Aryagorjipour/dsa' },
      { text: 'Handbook', link: '/README' }
    ],

    sidebar: [
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
        ]
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
        ]
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
          { text: '24. Trie Operations', link: '/algorithms/23-trie-operations' },
          { text: '25. BFS', link: '/algorithms/24-bfs' },
          { text: '26. DFS', link: '/algorithms/25-dfs' },
          { text: '27. Topological Sort', link: '/algorithms/26-topological-sort' },
          { text: '28. Dijkstra', link: '/algorithms/27-dijkstra' },
          { text: '29. Bellman-Ford', link: '/algorithms/28-bellman-ford' },
          { text: '30. Floyd-Warshall', link: '/algorithms/29-floyd-warshall' },
          { text: '31. Minimum Spanning Tree', link: '/algorithms/30-mst-kruskal-prim' },
          { text: '32. A* Search', link: '/algorithms/31-astar' },
          { text: '33. DP Fundamentals', link: '/algorithms/32-dp-fundamentals' },
          { text: '34. 0/1 Knapsack', link: '/algorithms/33-0-1-knapsack' },
          { text: '35. LCS', link: '/algorithms/34-lcs' },
          { text: '36. Edit Distance', link: '/algorithms/35-edit-distance' },
          { text: '37. Matrix Chain Multiplication', link: '/algorithms/36-matrix-chain-multiplication' },
          { text: '38. LIS', link: '/algorithms/37-longest-increasing-subsequence' },
          { text: '39. KMP', link: '/algorithms/38-kmp' },
          { text: '40. Rabin-Karp', link: '/algorithms/39-rabin-karp' },
          { text: '41. Boyer-Moore', link: '/algorithms/40-boyer-moore' },
          { text: '42. Z-Algorithm', link: '/algorithms/41-z-algorithm' },
          { text: '43. Aho-Corasick', link: '/algorithms/42-aho-corasick' },
          { text: '44. Backtracking', link: '/algorithms/43-backtracking' },
          { text: '45. Bit Manipulation', link: '/algorithms/44-bit-manipulation' },
          { text: '46. Bloom Filter (Alg)', link: '/algorithms/45-bloom-filter-alg' },
          { text: '47. Consistent Hashing', link: '/algorithms/46-consistent-hashing' },
          { text: '48. Rate Limiting', link: '/algorithms/47-rate-limiting' },
        ]
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
          { text: 'Implementations', link: '/resources/implementations' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Aryagorjipour/dsa' }
    ],

    editLink: {
      pattern: 'https://github.com/Aryagorjipour/dsa/edit/main/:path',
      text: 'Edit this page on GitHub'
    },

    footer: {
      message: 'Made with ❤️ for learners everywhere.',
      copyright: 'Copyright © Aryagorjipour'
    }
  }
})