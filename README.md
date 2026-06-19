# DSA Handbook: From Zero to "I Actually Get It and Use It Daily"

> A complete, no-hand-waving, no-placeholders, real-world-first guide to **Data Structures** and **Algorithms**.  
> Written for the person who says: "I know the words, but I have zero clue how these actually live in the software I use every day."

**Tone promise:** Professional but playful. We explain hard things with simple words. When we must use fancy terms, we immediately explain them like you're a smart friend who just hasn't seen this yet.

**Languages:** Full, detailed, runnable-style code in **C# (.NET)** and **Go**. Why? Because both power real production systems everywhere:
- C#/.NET: ASP.NET Core, Azure services, Unity, enterprise backends, Windows, high-performance services.
- Go: Kubernetes, Docker, Terraform, CockroachDB, many cloud infrastructure tools, high-throughput APIs.

You will see not only "textbook" code, but also "how the real thing is built" notes.

---

## How to Use This Handbook

1. **Start at the beginning** — Even if you think you know "What is a Data Structure?", read the fundamentals. The mindset matters more than the code.
2. **Read the "Why does this exist?" problem first** for algorithms.
3. **Read the full implementation** — we don't skip lines.
4. **Play with the code** — copy the examples into real projects.
5. **Look for "Real World" boxes** — this is where it clicks.

Each topic includes:
- Simple definition + intuition
- How it actually works (step by step)
- Time & Space complexity (Big O) explained in context
- Full C# implementation
- Full Go implementation
- Real-world use cases with actual products/tools
- Common pitfalls & daily usage tips
- At least one canonical problem with complete solution (for algorithms)

---

## Table of Contents

### Fundamentals

- [00 - What is a Data Structure? How to use it?](fundamentals/00-what-is-a-data-structure.md)
- [00 - What is an Algorithm? Algorithmic Thinking](fundamentals/00-what-is-an-algorithm.md)
- [01 - Big O Notation (and Friends)](fundamentals/01-big-o.md)
- [02 - Recursion and Memoization](fundamentals/02-recursion-and-memoization.md)
- [03 - Divide and Conquer](fundamentals/03-divide-and-conquer.md)
- [04 - Greedy Paradigm](fundamentals/04-greedy-paradigm.md)
- [05 - Two Pointers and Sliding Window](fundamentals/05-two-pointers-sliding-window.md)

### Data Structures

1. [Array](data-structures/01-array.md)
2. [Dynamic Array](data-structures/02-dynamic-array.md)
3. [Linked List](data-structures/03-linked-list.md)
4. [Stack](data-structures/04-stack.md)
5. [Queue](data-structures/05-queue.md)
6. [Deque](data-structures/06-deque.md)
7. [Ring Buffer (Circular Buffer)](data-structures/07-ring-buffer.md)
8. [Hash Set](data-structures/08-hash-set.md)
9. [Hash Map / Dictionary](data-structures/09-hash-map.md)
10. [LRU Cache](data-structures/10-lru-cache.md)
11. [LFU Cache](data-structures/11-lfu-cache.md)
12. [General Tree (N-ary Tree)](data-structures/12-tree-n-ary.md)
13. [Binary Search Tree (BST)](data-structures/13-binary-search-tree.md)
14. [Self-Balancing BST: Red-Black Tree](data-structures/14-red-black-tree.md)
15. [Heap](data-structures/15-heap.md)
16. [Priority Queue](data-structures/16-priority-queue.md)
17. [Trie (Prefix Tree)](data-structures/17-trie.md)
18. [B-Tree and B+ Tree](data-structures/18-btree-bplustree.md)
19. [Skip List](data-structures/19-skip-list.md)
20. [Segment Tree](data-structures/20-segment-tree.md)
21. [Fenwick Tree (Binary Indexed Tree)](data-structures/21-fenwick-tree.md)
22. [Merkle Tree](data-structures/22-merkle-tree.md)
23. [Graph](data-structures/23-graph.md)
24. [Bloom Filter](data-structures/24-bloom-filter.md)
25. [Disjoint Set (Union-Find)](data-structures/25-disjoint-set-union-find.md)
26. [HyperLogLog](data-structures/26-hyperloglog.md)
27. [Count-Min Sketch](data-structures/27-count-min-sketch.md)
28. [Cuckoo Filter](data-structures/28-cuckoo-filter.md)
29. [Rope](data-structures/29-rope.md)
30. [Gap Buffer](data-structures/30-gap-buffer.md)
31. [Suffix Array](data-structures/31-suffix-array.md)
32. [Quadtree](data-structures/32-quadtree.md)
33. [KD Tree](data-structures/33-kd-tree.md)
34. [R-Tree](data-structures/34-rtree.md)

### Algorithms (Complete - 0 to 48 with dedicated problem + full impl for each)

0. [What is an Algorithm? Algorithmic Thinking](fundamentals/00-what-is-an-algorithm.md)
1. [Big O](fundamentals/01-big-o.md)
2. [Recursion and Memoization](fundamentals/02-recursion-and-memoization.md)
3. [Divide and Conquer](fundamentals/03-divide-and-conquer.md)
4. [Greedy Paradigm](fundamentals/04-greedy-paradigm.md)
5. [Two Pointers and Sliding Window](fundamentals/05-two-pointers-sliding-window.md)
6. [Linear Search](algorithms/06-linear-search.md) — Problem: Finding item in unsorted collection (stone in boxes)
7. [Binary Search](algorithms/07-binary-search.md) — **Two Crystal Balls Problem** + variants
8. [Pseudocode Binary Search + Variants](algorithms/08-pseudocode-binary-search.md)
9. [Exponential Search](algorithms/09-exponential-search.md) — Unbounded / infinite sorted array search
10. [Bubble Sort](algorithms/10-bubble-sort.md) — Nearly sorted small lists
11. [Insertion Sort](algorithms/11-insertion-sort.md) — Online / small / nearly-sorted
12. [Merge Sort](algorithms/12-merge-sort.md)
13. [Quicksort](algorithms/13-quicksort.md)
14. [Heapsort](algorithms/14-heapsort.md)
15. [Timsort](algorithms/15-timsort.md)
16. [Counting Sort](algorithms/16-counting-sort.md)
17. [Radix Sort](algorithms/17-radix-sort.md)
18. [Hashing (Deep Dive)](algorithms/18-hashing.md) — Two Sum and dedup problems
19. [Quickselect](algorithms/19-quickselect.md) — Kth smallest without full sort
20. [Reservoir Sampling](algorithms/20-reservoir-sampling.md) — Uniform sample from infinite stream
21. [BST Operations](algorithms/21-bst-operations.md) — Kth smallest, Validate BST, LCA in BST
22. [Self-balancing Trees Operations](algorithms/23-self-balancing-trees.md)
23. [Trie Operations](algorithms/23-trie-operations.md) — Word Search II on board
24. [Breadth-First Search (BFS)](algorithms/24-bfs.md) — Shortest path unweighted
25. [Depth-First Search (DFS)](algorithms/25-dfs.md)
26. [Topological Sort](algorithms/26-topological-sort.md) — Dependency ordering (build tools)
27. [Dijkstra's Shortest Path](algorithms/27-dijkstra.md)
28. [Bellman-Ford](algorithms/28-bellman-ford.md) — Currency arbitrage (negative cycle)
29. [Floyd-Warshall](algorithms/29-floyd-warshall.md) — All-pairs shortest paths
30. [Minimum Spanning Tree (Kruskal + Prim)](algorithms/30-mst-kruskal-prim.md)
31. [A* Search](algorithms/31-astar.md)
32. [Dynamic Programming Fundamentals](algorithms/32-dp-fundamentals.md)
33. [0/1 Knapsack](algorithms/33-0-1-knapsack.md) — Classic thief knapsack
34. [Longest Common Subsequence (LCS)](algorithms/34-lcs.md)
35. [Edit Distance (Levenshtein)](algorithms/35-edit-distance.md)
36. [Matrix Chain Multiplication](algorithms/36-matrix-chain-multiplication.md)
37. [Longest Increasing Subsequence (LIS)](algorithms/37-longest-increasing-subsequence.md)
38. [Knuth-Morris-Pratt (KMP)](algorithms/38-kmp.md)
39. [Rabin-Karp](algorithms/39-rabin-karp.md)
40. [Boyer-Moore](algorithms/40-boyer-moore.md)
41. [Z-Algorithm](algorithms/41-z-algorithm.md)
42. [Aho-Corasick](algorithms/42-aho-corasick.md) — Multi-pattern matching (virus sigs, moderation)
43. [Backtracking](algorithms/43-backtracking.md)
44. [Bit Manipulation](algorithms/44-bit-manipulation.md)
45. [Bloom Filter Algorithms](algorithms/45-bloom-filter-alg.md)
46. [Consistent Hashing](algorithms/46-consistent-hashing.md)
47. [Rate Limiting Algorithms](algorithms/47-rate-limiting.md)

**Complete Treatment Applied to All Items:**

For **every** Data Structure and Algorithm in the lists:

- Dedicated "Canonical / Motivating Problem" section with full descriptive text (problem statement, why the technique exists, real-world motivation, complexity context).
- Full, production-style implementation in C# and Go.
- Where helpful: Diagrams from images/.
- References to resources/ for papers, books, production links.
- Runnable examples in examples/ for key/complex ones (with more added for advanced topics).

Simpler ones have clear motivating examples (e.g. parentheses for Stack, two sum for HashMap, valid path for BFS).
Complex/confusing ones (Segment/Fenwick, A*, Aho-Corasick, spatial trees, probabilistic sketches, advanced string/DP/graph) have been given extra depth with detailed problems, code, images, and examples.

See updated resources/production-use-cases.md and examples/ for the full set.

This handbook now has comprehensive coverage for all 0-34 DS and 0-47 Algos as requested.

---

## The Mindset Shift You Need

Most people treat DSA like a checklist of interview trivia.

**Real engineers** treat them like **tools in a toolbox**.

- You don't use a hammer for screws.
- You don't use a linked list when you need O(1) random access.
- You don't use a hash map when you need ordered data + range queries (you reach for a tree or a sorted structure).

This handbook will teach you **when your gut should say**:
> "This smells like a sliding window + hash map problem"
> "This screams segment tree"
> "We need a priority queue here, not a list"

---

## Real Systems That Use These (Sneak Peek)

- **PostgreSQL / MySQL / SQLite**: B+ trees everywhere (tables, indexes)
- **Redis**: Hash tables, sorted sets (skip lists + ziplists), HyperLogLog, Bloom filters (in modules)
- **Linux kernel**: Red-black trees (process scheduling, virtual memory areas), rbtree for many things
- **Git**: Merkle trees (actually DAG of trees + blobs), content-addressable storage
- **Cassandra / ScyllaDB**: Bloom filters for SSTables, consistent hashing
- **Kubernetes / etcd**: B+ trees (boltdb), watch mechanisms often use some form of trees/graphs
- **Google Maps / Uber**: Graphs + A* / variants of Dijkstra, quadtrees for geospatial
- **Chrome / Firefox**: LRU caches everywhere, gap buffers in text editors, tries for autocomplete
- **Docker / container runtimes**: Union filesystems (often Merkle-ish), graphs of layers
- **Netflix / CDNs**: Consistent hashing for cache distribution
- **Twitter / Facebook / LinkedIn**: Graphs at insane scale, bloom filters for recommendations, HyperLogLog for unique counts (DAU)
- **.NET**: `List<T>` = dynamic array, `Dictionary<TKey,TValue>` = hash map (with some tricks), `SortedSet<T>` = red-black tree, `ConcurrentQueue` uses linked list segments internally, `PriorityQueue<T>` (since .NET 6)
- **Go standard library**: slices (dynamic arrays), maps (hashmap), `container/heap`, `container/list`, `container/ring`, sync primitives

You are not learning abstract math. You are learning the **internal organs** of the software you already use.

---

## A Note on "Gathering Everything in Detail"

Every page contains:
- Complete working code (no "..." or "implement this yourself")
- Complexity analysis with explanations
- Multiple variants where they matter in real life
- At least one motivating problem with full solution walk-through for algorithms
- Production notes ("What .NET actually does", "How Go's runtime map works")

Let's go.

---

**Next step:** Start with [fundamentals/00-what-is-a-data-structure.md](fundamentals/00-what-is-a-data-structure.md)

The complete journey is here:
- All Data Structures with deep explanations + full C# and Go code
- All Algorithms with real motivating problems + detailed implementations
- Real-world references from actual products and systems (.NET, Go, databases, distributed systems, games, browsers, etc.)

---

## Project Status

This handbook contains **full, detailed, no-shortcut** coverage of:

- 35+ Data Structures
- 48 Algorithms (including fundamentals)
- Canonical problems for each major algorithm (Two Crystal Balls, LCS, Edit Distance, MST, Topological Sort, Rate Limiting, etc.)
- Production context for C#/.NET and Go

Runnable examples are in the `examples/` folder.

---

Happy building. Now go make something that uses these structures and algorithms properly.

---

## Related Projects

If you enjoy this handbook, check out **Structura** — a dark fantasy RPG that teaches the same concepts through boss fights, visualizations, and actual coding challenges in 6 languages (Go, C#, etc.).

- GitHub: https://github.com/Aryagorjipour/structura
- Play: https://aryagorjipour.github.io/structura/

## Visual Aids & Extra Resources

- **images/**: 10+ educational diagrams (BST, Red-Black Tree, Trie, Segment Tree, Bloom Filter, Binary Search steps, Heap, Array vs Linked List, B+ Tree, BFS Graph, etc.) embedded directly in the chapters.
- **resources/further-reading.md**: Curated books, classic papers, visualizations, real system source code links, and "good to know but not core" topics.
- **resources/complexity-cheatsheet.md**: Quick reference for choosing the right structure/algorithm.

These directories are intentionally kept and actively used to enhance the handbook.
