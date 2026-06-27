# Complexity & Structure Choice Cheat Sheet

Quick reference for picking the right data structure or algorithm. Full explanations live in the handbook chapters linked below.

See also: [Production Use Cases](production-use-cases.md) for where these appear in real systems.

---

## Complexity Classes (Fastest → Slowest Growth)

| Class | Name | n = 1,000 | n = 1,000,000 | Typical use |
|-------|------|-----------|---------------|-------------|
| O(1) | Constant | ~1 step | ~1 step | Hash lookup, array index |
| O(log n) | Logarithmic | ~10 steps | ~20 steps | Binary search, balanced tree ops |
| O(n) | Linear | ~1,000 | ~1,000,000 | Single scan, hash iteration |
| O(n log n) | Linearithmic | ~10,000 | ~20,000,000 | Efficient sorting |
| O(n²) | Quadratic | ~1,000,000 | impractical | Small n only, naive nested loops |
| O(2^n) | Exponential | impractical | impractical | Needs DP or pruning |
| O(n!) | Factorial | impractical | impractical | Permutation search only |

**Rule of thumb:** At n = 1,000,000, O(n log n) is acceptable; O(n²) is not.

---

## Data Structures — Operations & When to Use

### Linear Structures

| Structure | Access | Insert | Delete | Search | Space | When to use | Chapter |
|-----------|--------|--------|--------|--------|-------|-------------|---------|
| Array | O(1) | O(n) | O(n) | O(n) | O(n) | Fixed size, cache-friendly sequential data | [Array](../data-structures/01-array.md) |
| Dynamic Array | O(1) | O(1)* | O(n) | O(n) | O(n) | Default sequential container; random access | [Dynamic Array](../data-structures/02-dynamic-array.md) |
| Linked List | O(n) | O(1)† | O(1)† | O(n) | O(n) | Frequent head inserts; no random access needed | [Linked List](../data-structures/03-linked-list.md) |
| Stack | O(n) | O(1) | O(1) | O(n) | O(n) | LIFO: parsing, undo, DFS, monotonic stack | [Stack](../data-structures/04-stack.md) |
| Queue | O(n) | O(1) | O(1) | O(n) | O(n) | FIFO: BFS, scheduling, buffering | [Queue](../data-structures/05-queue.md) |
| Deque | O(n) | O(1) | O(1) | O(n) | O(n) | O(1) at both ends; sliding window | [Deque](../data-structures/06-deque.md) |
| Ring Buffer | O(n) | O(1) | O(1) | O(n) | O(n) | Bounded producer-consumer; zero alloc | [Ring Buffer](../data-structures/07-ring-buffer.md) |

*Amortized. †At known position.

### Hashing & Caching

| Structure | Lookup | Insert | Delete | Space | When to use | Chapter |
|-----------|--------|--------|--------|-------|-------------|---------|
| Hash Set | O(1)* | O(1)* | O(1)* | O(n) | Uniqueness, membership, dedup | [Hash Set](../data-structures/08-hash-set.md) |
| Hash Map | O(1)* | O(1)* | O(1)* | O(n) | Key-value lookup; no ordering needed | [Hash Map](../data-structures/09-hash-map.md) |
| LRU Cache | O(1) | O(1) | O(1) | O(n) | Recency-based eviction; temporal locality | [LRU Cache](../data-structures/10-lru-cache.md) |
| LFU Cache | O(1) | O(1) | O(1) | O(n) | Frequency-based eviction; hot-key skew | [LFU Cache](../data-structures/11-lfu-cache.md) |

*Average case; O(n) worst with bad hashing.

### Trees & Heaps

| Structure | Search | Insert | Delete | Min/Max | When to use | Chapter |
|-----------|--------|--------|--------|---------|-------------|---------|
| N-ary Tree | O(n) | O(1) | O(1) | — | Hierarchies: filesystems, org charts | [N-ary Tree](../data-structures/12-tree-n-ary.md) |
| BST | O(h) | O(h) | O(h) | O(h) | Ordered in-memory data; degrades if skewed | [BST](../data-structures/13-binary-search-tree.md) |
| Red-Black Tree | O(log n) | O(log n) | O(log n) | O(log n) | Guaranteed balanced ordered map | [Red-Black Tree](../data-structures/14-red-black-tree.md) |
| Heap | O(n) | O(log n) | O(log n) | O(1) | Priority extraction; heap sort | [Heap](../data-structures/15-heap.md) |
| Priority Queue | O(1) peek | O(log n) | O(log n) | O(1) | Scheduling, Dijkstra, event simulation | [Priority Queue](../data-structures/16-priority-queue.md) |
| Trie | O(m) | O(m) | O(m) | — | Prefix search, autocomplete (m = key length) | [Trie](../data-structures/17-trie.md) |
| B+/B-Tree | O(log n) | O(log n) | O(log n) | — | Disk-backed indexes; databases | [B-Tree & B+ Tree](../data-structures/18-btree-bplustree.md) |
| Skip List | O(log n)* | O(log n)* | O(log n)* | — | Probabilistic ordered map; Redis sorted sets | [Skip List](../data-structures/19-skip-list.md) |

### Range Queries & Graphs

| Structure | Query | Update | Build | When to use | Chapter |
|-----------|-------|--------|-------|-------------|---------|
| Segment Tree | O(log n) | O(log n) | O(n) | Range aggregates with point updates | [Segment Tree](../data-structures/20-segment-tree.md) |
| Fenwick Tree | O(log n) | O(log n) | O(n) | Prefix sums; simpler than segment tree | [Fenwick Tree](../data-structures/21-fenwick-tree.md) |
| Merkle Tree | O(log n) | O(log n) | O(n) | Integrity verification; Git, blockchains | [Merkle Tree](../data-structures/22-merkle-tree.md) |
| Graph (adj list) | O(V+E) | O(1) edge | O(V+E) | Relationships, networks, dependencies | [Graph](../data-structures/23-graph.md) |

### Probabilistic & Sketching

| Structure | Query | Insert | Space | Accuracy | When to use | Chapter |
|-----------|-------|--------|-------|----------|-------------|---------|
| Bloom Filter | O(k) | O(k) | O(m) bits | No false negatives* | "Probably seen?" dedup | [Bloom Filter](../data-structures/24-bloom-filter.md) |
| Union-Find | O(α(n)) | O(α(n)) | O(n) | Exact | Connectivity, Kruskal MST | [Union-Find](../data-structures/25-disjoint-set-union-find.md) |
| HyperLogLog | O(1) | O(1) | O(log log n) | ~2% error | Approximate distinct count | [HyperLogLog](../data-structures/26-hyperloglog.md) |
| Count-Min Sketch | O(d) | O(d) | O(d×w) | Overestimate | Stream frequency estimation | [Count-Min Sketch](../data-structures/27-count-min-sketch.md) |
| Cuckoo Filter | O(k) | O(k) | O(n) bits | Deletable bloom alternative | Membership with deletion | [Cuckoo Filter](../data-structures/28-cuckoo-filter.md) |

*May have false positives; never false negatives.

### Text & Spatial

| Structure | Operation | Time | When to use | Chapter |
|-----------|-----------|------|-------------|---------|
| Rope | Insert/delete at index | O(log n) | Large document editing | [Rope](../data-structures/29-rope.md) |
| Gap Buffer | Insert at cursor | O(1) amortized | Local text editing | [Gap Buffer](../data-structures/30-gap-buffer.md) |
| Suffix Array | Substring search | O(m log n) | Static text indexing | [Suffix Array](../data-structures/31-suffix-array.md) |
| Quadtree | Range query 2D | O(log n + k) | Game collision, GIS points | [Quadtree](../data-structures/32-quadtree.md) |
| KD-Tree | Nearest neighbor | O(log n) avg | k-D point search | [KD-Tree](../data-structures/33-kd-tree.md) |
| R-Tree | Spatial range | O(log n) | GIS bounding-box queries | [R-Tree](../data-structures/34-rtree.md) |

---

## Algorithms — Time/Space & When to Use

### Search

| Algorithm | Time | Space | When to use | Chapter |
|-----------|------|-------|-------------|---------|
| Linear Search | O(n) | O(1) | Unsorted data; tiny n | [Linear Search](../algorithms/06-linear-search.md) |
| Binary Search | O(log n) | O(1) | Sorted array; answer space monotonic | [Binary Search](../algorithms/07-binary-search.md) |
| Exponential Search | O(log n) | O(1) | Unbounded sorted array | [Exponential Search](../algorithms/09-exponential-search.md) |

### Sorting

| Algorithm | Best | Avg | Worst | Stable | When to use | Chapter |
|-----------|------|-----|-------|--------|-------------|---------|
| Bubble Sort | O(n) | O(n²) | O(n²) | Yes | Teaching; nearly sorted tiny n | [Bubble Sort](../algorithms/10-bubble-sort.md) |
| Insertion Sort | O(n) | O(n²) | O(n²) | Yes | Online; small or nearly sorted | [Insertion Sort](../algorithms/11-insertion-sort.md) |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | Yes | Stable sort; external sort | [Merge Sort](../algorithms/12-merge-sort.md) |
| Quicksort | O(n log n) | O(n log n) | O(n²) | No | General-purpose in-memory sort | [Quicksort](../algorithms/13-quicksort.md) |
| Heapsort | O(n log n) | O(n log n) | O(n log n) | No | In-place O(n log n) | [Heapsort](../algorithms/14-heapsort.md) |
| Timsort | O(n) | O(n log n) | O(n log n) | Yes | Real-world hybrid (Python, Java) | [Timsort](../algorithms/15-timsort.md) |
| Counting Sort | O(n+k) | O(n+k) | O(n+k) | Yes | Small integer range | [Counting Sort](../algorithms/16-counting-sort.md) |
| Radix Sort | O(d(n+k)) | O(n+k) | O(d(n+k)) | Yes | Fixed-width integers/strings | [Radix Sort](../algorithms/17-radix-sort.md) |

### Selection & Hashing

| Algorithm | Time | Space | When to use | Chapter |
|-----------|------|-------|-------------|---------|
| Hashing (Two Sum) | O(n) | O(n) | Pair lookup, dedup | [Hashing](../algorithms/18-hashing.md) |
| Quickselect | O(n) avg | O(1) | Kth element without full sort | [Quickselect](../algorithms/19-quickselect.md) |
| Reservoir Sampling | O(n) | O(k) | Uniform sample from stream | [Reservoir Sampling](../algorithms/20-reservoir-sampling.md) |

### Graph

| Algorithm | Time | Space | When to use | Chapter |
|-----------|------|-------|-------------|---------|
| BFS | O(V+E) | O(V) | Shortest path unweighted | [BFS](../algorithms/25-bfs.md) |
| DFS | O(V+E) | O(V) | Explore, cycles, components | [DFS](../algorithms/26-dfs.md) |
| Topological Sort | O(V+E) | O(V) | Dependency ordering | [Topological Sort](../algorithms/27-topological-sort.md) |
| Dijkstra | O((V+E) log V) | O(V) | Non-negative weighted shortest path | [Dijkstra](../algorithms/28-dijkstra.md) |
| Bellman-Ford | O(VE) | O(V) | Negative edges; cycle detection | [Bellman-Ford](../algorithms/29-bellman-ford.md) |
| Floyd-Warshall | O(V³) | O(V²) | All-pairs shortest paths | [Floyd-Warshall](../algorithms/30-floyd-warshall.md) |
| Kruskal/Prim MST | O(E log E) | O(V) | Minimum spanning tree | [MST](../algorithms/31-mst-kruskal-prim.md) |
| A* | O(b^d)† | O(b^d) | Heuristic pathfinding | [A*](../algorithms/32-astar.md) |

†Depends on heuristic quality and branching factor.

### Dynamic Programming

| Problem | Time | Space | Pattern | Chapter |
|---------|------|-------|---------|---------|
| 0/1 Knapsack | O(nW) | O(nW) | 2D DP table | [Knapsack](../algorithms/34-0-1-knapsack.md) |
| LCS | O(mn) | O(mn) | 2D string DP | [LCS](../algorithms/35-lcs.md) |
| Edit Distance | O(mn) | O(mn) | 2D string DP | [Edit Distance](../algorithms/36-edit-distance.md) |
| Matrix Chain | O(n³) | O(n²) | Interval DP | [Matrix Chain](../algorithms/37-matrix-chain-multiplication.md) |
| LIS | O(n log n) | O(n) | Patience sorting / DP | [LIS](../algorithms/38-longest-increasing-subsequence.md) |

### String Matching

| Algorithm | Time | Space | When to use | Chapter |
|-----------|------|-------|-------------|---------|
| KMP | O(n+m) | O(m) | Single pattern; preprocessing pays off | [KMP](../algorithms/39-kmp.md) |
| Rabin-Karp | O(n+m) avg | O(1) | Multiple patterns; rolling hash | [Rabin-Karp](../algorithms/40-rabin-karp.md) |
| Boyer-Moore | O(n/m) best | O(σ) | Long patterns; English text | [Boyer-Moore](../algorithms/41-boyer-moore.md) |
| Z-Algorithm | O(n+m) | O(n+m) | Prefix function analysis | [Z-Algorithm](../algorithms/42-z-algorithm.md) |
| Aho-Corasick | O(n+m+z) | O(m) | Multi-pattern dictionary | [Aho-Corasick](../algorithms/43-aho-corasick.md) |

### Systems & Paradigms

| Topic | Time | Space | When to use | Chapter |
|-------|------|-------|-------------|---------|
| Backtracking | O(b^d) | O(d) | Constraint satisfaction with pruning | [Backtracking](../algorithms/44-backtracking.md) |
| Bit Manipulation | O(1)–O(n) | O(1) | Subset enumeration, XOR tricks | [Bit Manipulation](../algorithms/45-bit-manipulation.md) |
| Bloom Filter (sizing) | O(k) | O(m) | URL dedup; tune m, k for false positive rate | [Bloom Filter Alg](../algorithms/46-bloom-filter-alg.md) |
| Consistent Hashing | O(log n) | O(n) | Distributed cache routing | [Consistent Hashing](../algorithms/47-consistent-hashing.md) |
| Rate Limiting | O(1) | O(1)–O(n) | API protection; token bucket vs sliding window | [Rate Limiting](../algorithms/48-rate-limiting.md) |

---

## Decision Guide

### "I need fast lookup by key"
→ **Hash Map** (unordered) or **Red-Black Tree / B+ Tree** (ordered + range queries)

### "I need the k-th smallest or range scan"
→ **BST** (in-memory) or **B+ Tree** (disk). Never use a plain array for range queries on large data.

### "I need shortest path"
→ **BFS** (unweighted) → **Dijkstra** (non-negative weights) → **Bellman-Ford** (negative edges) → **A*** (with heuristic on grids/maps)

### "I need to count unique visitors at scale"
→ **HyperLogLog** (approximate, ~2 KB) — not HashSet (gigabytes at billions of uniques)

### "I need to check if URL was crawled before"
→ **Bloom Filter** (probabilistic) — accept rare false positives

### "I need range sum with updates"
→ **Segment Tree** or **Fenwick Tree** (Fenwick simpler for prefix sums only)

### "I need autocomplete / prefix search"
→ **Trie** — not linear scan or hash map

### "I need spatial queries in 2D"
→ **Quadtree** (points) or **R-Tree** (bounding boxes) or **KD-Tree** (nearest neighbor)

### "I need exact distinct count for billing"
→ **Hash Set** — never HyperLogLog or Bloom Filter

### "Problem smells like overlapping subproblems"
→ **Dynamic Programming** or **Memoization** — not naive recursion

### "Problem needs all combinations with constraints"
→ **Backtracking** with pruning — watch for exponential blowup

---

## Fundamentals Quick Reference

| Topic | Key idea | Chapter |
|-------|----------|---------|
| Big O | Growth rate as n → ∞; drop constants | [Big O](../fundamentals/01-big-o.md) |
| Recursion | Base case + recursive case; watch stack depth | [Recursion](../fundamentals/02-recursion-and-memoization.md) |
| Divide & Conquer | Split → solve → combine; merge/quick sort | [D&C](../fundamentals/03-divide-and-conquer.md) |
| Greedy | Local optimal choice; needs proof it works | [Greedy](../fundamentals/04-greedy-paradigm.md) |
| Two Pointers | Opposite/converging pointers; sliding window | [Two Pointers](../fundamentals/05-two-pointers-sliding-window.md) |