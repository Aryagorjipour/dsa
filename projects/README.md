# Project Lab — Learn by Building Real Systems

> *Turn the handbook from a reference into a workshop.*

A curriculum of **22 applied build projects** covering every data structure and algorithm in this handbook. Each project is a complete "Build Your Own X" specification: motivation, architecture, progressive milestones, and language-specific guidance for C# and Go.

**Discover projects:** [By Category](/projects/discover/by-category) · [By Data Structure](/projects/discover/by-data-structure) · [By Algorithm](/projects/discover/by-algorithm)

Projects are grouped into four difficulty tiers. Work through them in order, or jump directly to the tier that matches your experience.

---

## How to Use These Projects

Each spec gives you a blueprint — not complete code. You are expected to:

1. Read the relevant handbook chapters first.
2. Design your own implementation before looking at hints.
3. Use the milestones as checkpoints, not a step-by-step tutorial.
4. Push beyond the spec with the stretch goals.

The projects intentionally combine 3–7 DSA concepts per project, mirroring how real systems are built.

---

## Tier 1 — Foundations

> **Who:** Comfortable with at least one language. New to DSA or solidifying fundamentals.  
> **What:** Individual, well-understood algorithms. Build from scratch. Understand trade-offs.

| # | Project | DSA Concepts |
|---|---------|--------------|
| 1 | [Build Your Own Search Library](./tier-1/01-search-library.md) | Linear Search, Binary Search, Exponential Search, Interpolation Search |
| 2 | [Build Your Own Sorting Benchmarker](./tier-1/02-sorting-benchmarker.md) | Bubble Sort, Insertion Sort, Merge Sort, Quicksort, Heapsort, Timsort, Counting Sort, Radix Sort |
| 3 | [Build Your Own Stack-Based Expression Evaluator](./tier-1/03-stack-calculator.md) | Stack, Linked List, Dynamic Array, Recursion & Memoization |
| 4 | [Build Your Own Hash Map](./tier-1/04-hash-map-from-scratch.md) | Hash Map, Hash Set, Hashing, Array |

---

## Tier 2 — Core Systems

> **Who:** Comfortable with Tier 1. Ready to build multi-component systems.  
> **What:** 2–4 DSA concepts combined. Systems with real operational characteristics.

| # | Project | DSA Concepts |
|---|---------|--------------|
| 5 | [Build Your Own Cache with Eviction Policies](./tier-2/05-cache-with-eviction.md) | LRU Cache, LFU Cache, Heap, Priority Queue, Hash Map, Linked List |
| 6 | [Build Your Own Task Queue System](./tier-2/06-task-queue-system.md) | Queue, Deque, Ring Buffer, Priority Queue, Topological Sort |
| 7 | [Build Your Own Autocomplete Engine](./tier-2/07-autocomplete-engine.md) | Trie, Trie Operations, BFS, DFS, Priority Queue |
| 8 | [Build Your Own Route Planner](./tier-2/08-route-planner.md) | Graph, BFS, DFS, Dijkstra, Bellman-Ford, Floyd-Warshall, A* |
| 9 | [Build Your Own Statistical Sampler](./tier-2/09-statistical-sampler.md) | Quickselect, Reservoir Sampling, Sorting, Two Pointers, Sliding Window |

---

## Tier 3 — Advanced Systems

> **Who:** Solid foundation. Ready for production-grade complexity and real-system patterns.  
> **What:** 4–7 concepts combined. Systems that mirror real databases, search engines, and analytics.

| # | Project | DSA Concepts |
|---|---------|--------------|
| 10 | [Build Your Own In-Memory Database Index](./tier-3/10-in-memory-db-index.md) | BST, BST Operations, Red-Black Tree, Self-Balancing Trees, Binary Search |
| 11 | [Build Your Own Persistent Key-Value Store](./tier-3/11-key-value-store.md) | B-Tree/B+Tree, Skip List, Hashing, Bloom Filter |
| 12 | [Build Your Own Time-Series Analytics Engine](./tier-3/12-time-series-analytics.md) | Segment Tree, Fenwick Tree, Sliding Window, Two Pointers, Greedy |
| 13 | [Build Your Own Full-Text Search Engine](./tier-3/13-full-text-search-engine.md) | KMP, Rabin-Karp, Boyer-Moore, Z-Algorithm, Aho-Corasick, Trie, Suffix Array |
| 14 | [Build Your Own Dynamic Programming Toolkit](./tier-3/14-dp-toolkit.md) | DP Fundamentals, 0/1 Knapsack, LCS, Edit Distance, Matrix Chain, LIS |
| 15 | [Build Your Own Network Optimizer](./tier-3/15-network-optimizer.md) | Graph, MST (Kruskal + Prim), Disjoint Set (Union-Find), Topological Sort, Greedy |

---

## Tier 4 — Expert / Production

> **Who:** Strong foundation across tiers 1–3. Ready for complex, production-scale designs.  
> **What:** Systems found in real infrastructure. Multiple interacting DSA subsystems.

| # | Project | DSA Concepts |
|---|---------|--------------|
| 16 | [Build Your Own Mini Version Control System](./tier-4/16-mini-version-control.md) | Merkle Tree, Hashing, Graph (DAG), DFS, Backtracking |
| 17 | [Build Your Own Distributed Cache](./tier-4/17-distributed-cache.md) | Consistent Hashing, LRU Cache, Bloom Filter, Cuckoo Filter, Hashing |
| 18 | [Build Your Own API Rate Limiter](./tier-4/18-api-rate-limiter.md) | Token Bucket, Sliding Window Log, Fixed Window, Leaky Bucket, Ring Buffer |
| 19 | [Build Your Own Stream Analytics Pipeline](./tier-4/19-stream-analytics-pipeline.md) | HyperLogLog, Count-Min Sketch, Bloom Filter, Cuckoo Filter, Reservoir Sampling |
| 20 | [Build Your Own Text Editor Engine](./tier-4/20-text-editor-engine.md) | Rope, Gap Buffer, Trie (autocomplete), Edit Distance, Backtracking |
| 21 | [Build Your Own Geospatial Index](./tier-4/21-geospatial-index.md) | Quadtree, KD-Tree, R-Tree, Binary Search |
| 22 | [Build Your Own Constraint Solver](./tier-4/22-constraint-solver.md) | Backtracking, Bit Manipulation, DFS, Recursion, Greedy |

---

## DSA Coverage Map

Every handbook item appears in at least one project.

### Data Structures
| Handbook Item | Project(s) |
|--------------|------------|
| Array | #1, #4 |
| Dynamic Array | #3 |
| Linked List | #3, #5 |
| Stack | #3 |
| Queue | #6 |
| Deque | #6 |
| Ring Buffer | #6, #18 |
| Hash Set | #4 |
| Hash Map | #4, #5 |
| LRU Cache | #5, #17 |
| LFU Cache | #5 |
| N-ary Tree | #10 |
| BST | #10 |
| Red-Black Tree | #10 |
| Heap | #5, #6 |
| Priority Queue | #5, #6, #7, #8 |
| Trie | #7, #13, #20 |
| B-Tree / B+ Tree | #11 |
| Skip List | #11 |
| Segment Tree | #12 |
| Fenwick Tree | #12 |
| Merkle Tree | #16 |
| Graph | #8, #15, #16 |
| Bloom Filter | #11, #17, #19 |
| Disjoint Set (Union-Find) | #15 |
| HyperLogLog | #19 |
| Count-Min Sketch | #19 |
| Cuckoo Filter | #17, #19 |
| Rope | #20 |
| Gap Buffer | #20 |
| Suffix Array | #13 |
| Quadtree | #21 |
| KD Tree | #21 |
| R-Tree | #21 |

### Algorithms
| Handbook Item | Project(s) |
|--------------|------------|
| Linear Search | #1 |
| Binary Search | #1, #21 |
| Exponential Search | #1 |
| Bubble / Insertion Sort | #2 |
| Merge Sort | #2 |
| Quicksort | #2 |
| Heapsort | #2 |
| Timsort | #2 |
| Counting Sort | #2 |
| Radix Sort | #2 |
| Hashing | #4, #16, #17 |
| Quickselect | #9 |
| Reservoir Sampling | #9, #19 |
| BST Operations | #10 |
| Self-Balancing Trees | #10 |
| Trie Operations | #7 |
| BFS | #7, #8 |
| DFS | #7, #8, #16, #22 |
| Topological Sort | #6, #15 |
| Dijkstra | #8 |
| Bellman-Ford | #8 |
| Floyd-Warshall | #8 |
| MST (Kruskal + Prim) | #15 |
| A* | #8 |
| DP Fundamentals | #14 |
| 0/1 Knapsack | #14 |
| LCS | #14 |
| Edit Distance | #14, #20 |
| Matrix Chain Multiplication | #14 |
| LIS | #14 |
| KMP | #13 |
| Rabin-Karp | #13 |
| Boyer-Moore | #13 |
| Z-Algorithm | #13 |
| Aho-Corasick | #13 |
| Backtracking | #16, #20, #22 |
| Bit Manipulation | #22 |
| Bloom Filter Alg | #11, #17, #19 |
| Consistent Hashing | #17 |
| Rate Limiting | #18 |

### Fundamentals
| Handbook Item | Project(s) |
|--------------|------------|
| Big O Notation | All projects |
| Recursion & Memoization | #3, #14, #22 |
| Divide & Conquer | #2 |
| Greedy Paradigm | #12, #15, #22 |
| Two Pointers / Sliding Window | #9, #12, #18 |
