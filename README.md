# Welcome to the Opinionated DSA Roadmap

This vault contains structured notes, explanations, and perspectives on the field I’ve always tried to escape: *Data Structures and Algorithms*.

> This vault is maintained in [Obsidian](https://obsidian.md/). Obsidian is the recommended way to explore it.

---

## Scope

This is a practical, dependency-ordered roadmap of commonly taught and used data-structure variants—not an exhaustive catalog of every structure ever proposed. It draws on interview and competitive-programming roadmaps, the GeeksforGeeks topic map, cp-algorithms, CLRS, and advanced data-structures course outlines.

Topics are grouped into layers, with each layer building on material introduced earlier.

## Roadmap scale

- **Level 0:** Analysis fundamentals
- **Levels 1–40:** Interview core
- **Levels 41–75:** Hard-interview topics and intermediate competitive programming
- **Levels 76–100:** Expert competitive programming and specialized database or research structures
- **Beyond Level 100:** The limits of modern data structures


---
## Learning flow

The list below is the inventory. This is the order.

Open [[Learning Flow.canvas]]. In Obsidian, the embed is live:

![[Learning Flow.canvas]]

Three tracks, one trunk:

- **Interview:** layers 0–IX (items 0–98). Awareness only past heap, DSU, Dijkstra, trie, segment tree.
- **CP:** trunk first, then X–XIV, plus rollback DSU and HLD.
- **Databases / search / infra:** do not walk the CP string chain. Jump to B+, LSM, bloom, skip list, FM-index, succinct rank-select.

Study loop on every item, in this order: invariant → real cost → when it beats the previous structure → one failure mode → implement the representative → one problem the previous layer cannot solve. No gate, no next layer.

---
## List of Contents (base on scope scale)

### 0. Foundations 
**Must know before item 1:**
1. What a:
	1. [[Problem]] is?
	2. an [[ADT]] is?
	3. a [[00-Foundations/Data Structure|Data Structure]] is?
	4. an [[00-Foundations/Algorithm|Algorithm]] is?
2. [[Time vs. space (input size `n`)]]
3. [[Asymptotic notation (Big-O (upper), Big-Ω (lower), Big-Θ (tight))]]
4. [[Cases (Best, average, worst)]]
5. [[Amortized analysis (aggregate, accounting, potential) ]]
6. Analysis of Algorithms: 
	1. [[Recurrences]]
	2. [[Master theorem]]
	3. [[recursion trees]]
7. [[Divide and conquer (and vocabulary)]]
8. [[Loop invariants]]
9. [[Proof habits (induction, contradiction, exchange argument)]]
10. [[Bits]]:
	1. [[AND]]
	2. [[OR]]
	3. [[XOR]]
	4. [[shifts]]
	5. [[set, clear, test]]
	6. [[popcount]]
11. [[Comparison model vs integer-RAM model]]

 Common classes you must recognize on sight:   
 - `O(1)`
 - `O(log n)`
 - `O(n)`
 - `O(n log n)`
 - `O(n²)`
 - `O(n³)`
 - `O(2ⁿ)`
 - `O(n!)`

>NOTE: If this layer is weak, later items become memorization.

---

### I. Linear memory and primitive access
**Requires**: [[#0. Foundations|Foundations]]

| index |                Name                 |            Type            |
| :---: | :---------------------------------: | :------------------------: |
|   1   |         [[Array (Static)]]          |   [[Data Structure\|DS]]   |
|   2   | [[Dynamic array - resizable array]] |   [[Data Structure\|DS]]   |
|   3   |        [[Matrix - 2D array]]        | [[Data Structure\|DS]]<br> |
|   4   |     [[String (char sequence)]]      | [[Data Structure\|DS]]<br> |
|   5   |       [[Bitset - bit array]]        | [[Data Structure\|DS]]<br> |
*Must know* :
- contiguous layout
- index arithmetic `O(1)`
- cache locality
- resize strategy (usually ×2) and why append is amortized `O(1)`
- row-major vs column-major
- in-place vs extra space

---

### II. Search, scan, and sort on sequences
**Requires**: [[Array (Static)|arrays]]/[[String (char sequence)|strings]] + [[Big-O]] + [[Divide and conquer (and vocabulary)|Divide and conquer]]

| index |                   Name                   |            Type             |
| :---: | :--------------------------------------: | :-------------------------: |
|   6   |            [[Linear search]]             |     [[Algorithm\|Algo]]     |
|   7   |  [[Binary search (on a sorted range)]]   |   [[Algorithm\|Algo]]<br>   |
|   8   | [[Binary search on answer - parametric]] | [[Algorithm\|Algo]]<br><br> |
|   9   |      [[Ternary search (unimodal)]]       |   [[Algorithm\|Algo]]<br>   |
|  10   |             [[Two pointers]]             |       [[Pattern]]<br>       |
|  11   |  [[Sliding window (fixed + variable)]]   |       [[Pattern]]<br>       |
|  12   |             [[Prefix sums]]              |       [[Pattern]]<br>       |
|  13   |           [[Difference array]]           |       [[Pattern]]<br>       |
|  14   |        [[Kadane (max subarray)]]         |   [[Algorithm\|Algo]]<br>   |
|  15   |           [[Merge intervals]]            |       [[Pattern]]<br>       |
|  16   |             [[Bubble sort]]              |   [[Algorithm\|Algo]]<br>   |
|  17   |            [[Selection sort]]            |   [[Algorithm\|Algo]]<br>   |
|  18   |            [[Insertion sort]]            |   [[Algorithm\|Algo]]<br>   |
|  19   |              [[Merge sort]]              |   [[Algorithm\|Algo]]<br>   |
|  20   |     [[Quicksort (incl. randomized)]]     |   [[Algorithm\|Algo]]<br>   |
|  21   |            [[Counting sort]]             |   [[Algorithm\|Algo]]<br>   |
|  22   |              [[Radix sort]]              |   [[Algorithm\|Algo]]<br>   |
|  23   |             [[Bucket sort]]              |   [[Algorithm\|Algo]]<br>   |
|  24   |    [[Quickselect - order statistics]]    |   [[Algorithm\|Algo]]<br>   |
*Must know* :
- binary search is a _decision_ on a monotonic predicate, not “find in array.”
- Lower bound for comparison sorting is `Ω(n log n)`.
- When non-comparison sorts are legal (small integer keys).
- Stable vs unstable.
- In-place vs not.

---
### III. Pointer machines and LIFO/FIFO
**Requires**: [[Array (Static)|arrays]] + [[Big-O]] + [[Recursion]] (later uses the call stack as item 8)

| index |                    Name                    |            Type            |
| :---: | :----------------------------------------: | :------------------------: |
|  25   |           [[Singly linked list]]           |   [[Data Structure\|DS]]   |
|  26   |           [[Doubly linked list]]           |   [[Data Structure\|DS]]   |
|  27   |          [[Circular linked list]]          |   [[Data Structure\|DS]]   |
|  28   |     [[XOR linked list (space trick)]]      | [[Data Structure\|DS]]<br> |
|  29   |                 [[Stack]]                  | [[Data Structure\|DS]]<br> |
|  30   |               [[Queue]]<br>                | [[Data Structure\|DS]]<br> |
|  31   |               [[Deque]]<br>                | [[Data Structure\|DS]]<br> |
|  32   |   [[Circular buffer - ring buffer]]<br>    | [[Data Structure\|DS]]<br> |
|  33   |          [[Monotonic stack]]<br>           |      [[Pattern]]<br>       |
|  34   |          [[Monotonic queue]]<br>           |      [[Pattern]]<br>       |
|  35   | [[Fast-slow pointers (tortoise-hare)]]<br> |      [[Pattern]]<br>       |
*Must know* :
- insert/delete `O(1)` _once you hold the node_; access is `O(n)`.
- [[Sentinel nodes]].
- Stack = DFS / undo / parse.
- Queue = BFS / scheduling.
- Monotonic stack solves next-greater / histogram in `O(n)`.

---
### IV. Hashing
**Requires**: [[Array (Static)|arrays]] + [[Amortized analysis (aggregate, accounting, potential)|amortized analysis]]

| index |                     Name                     |                    Type                    |
| :---: | :------------------------------------------: | :----------------------------------------: |
|  36   |           [[Direct-address table]]           |           [[Data Structure\|DS]]           |
|  37   |        [[Hash table - hash map]]<br>         |           [[Data Structure\|DS]]           |
|  38   |               [[Hash set]]<br>               |           [[Data Structure\|DS]]           |
|  39   |    [[Collision handling (chaining)]]<br>     | [[Data Structure Detailed\|DS Detail]]<br> |
|  40   | [[Collision handling (open addressing)]]<br> | [[Data Structure Detailed\|DS Detail]]<br> |
|  41   |  [[Rolling - string hash (polynomial)]]<br>  |          [[Algorithm\|Algo]]<br>           |
|  42   |             [[Bloom filter]]<br>             |         [[Data Structure\|DS]]<br>         |
|  43   |            [[Cuckoo hashing]]<br>            |         [[Data Structure\|DS]]<br>         |
|  44   |           [[Perfect hashing]]<br>            |         [[Data Structure\|DS]]<br>         |
*Must know* :
- average `O(1)` vs worst `O(n)`.
- Load factor.
- Why hash + sort/two-sum is the default interview move.
- Rolling hash collision risk.
- Bloom: false positives, no false negatives.
- Cuckoo/perfect appear in systems and theory, not routine interviews.

---
### V. Recursion and exhaustive search
**Requires**: [[Stack|stack]] + [[Recurrences|recurrences]]

| index |                  Name                  |     Type     |
| :---: | :------------------------------------: | :----------: |
|  45   |     [[Recursion (as a technique)]]     | [[Pattern]]  |
|  46   | [[Divide and conquer (as a paradigm)]] | [[Paradigm]] |
|  47   |            [[Backtracking]]            | [[Paradigm]] |
|  48   |          [[Branch and bound]]          | [[Paradigm]] |
|  49   |         [[Meet in the middle]]         | [[Pattern]]  |
|  50   |   [[Bitmask enumeration - submasks]]   | [[Pattern]]  |
*Must know* :
- base case, state, call-tree size, tail vs non-tail.
- Backtracking template: choose → explore → unchoose.
- When `2ⁿ` or `n!` is acceptable.
- Meet-in-the-middle turns `2ⁿ` into `2ⁿ/²`.

---
### VI. Trees and heaps
**Requires**: [[Recursion|recursion]] + [[Array (Static)|arrays]] or [[Sentinel nodes|nodes]]

| index |                  Name                   |          Type          |
| :---: | :-------------------------------------: | :--------------------: |
|  51   |      [[Rooted tree - N-ary tree]]       | [[Data Structure\|DS]] |
|  52   |             [[Binary tree]]             | [[Data Structure\|DS]] |
|  53   | [[Tree traversals (pre-in-post-level)]] |  [[Algorithm\|Algo]]   |
|  54   |         [[Binary Search Tree]]          | [[Data Structure\|DS]] |
|  55   |              [[AVL tree]]               | [[Data Structure\|DS]] |
|  56   |           [[Red-Black tree]]            | [[Data Structure\|DS]] |
|  57   |             [[Splay tree]]              | [[Data Structure\|DS]] |
|  58   |          [[B-tree or B+ tree]]          | [[Data Structure\|DS]] |
|  59   |             [[Binary heap]]             | [[Data Structure\|DS]] |
|  60   |              [[Heap sort]]              |  [[Algorithm\|Algo]]   |
|  61   |  [[Priority queue (ADT over a heap)]]   | [[Data Structure\|DS]] |
|  62   |     [[d-ary heap - pairing ideas]]      | [[Data Structure\|DS]] |
|  63   |         [[Trie - prefix tree]]          | [[Data Structure\|DS]] |
|  64   | [[Compressed trie - radix - Patricia]]  | [[Data Structure\|DS]] |
*Must know* :
- height vs size.
- BST invariant.
- Why unbalanced BST degrades to a list.
- AVL = height-balanced
- RB = color-balanced (what `std::map` / TreeMap use).
- B+ tree = databases and filesystems.
- Heap = `O(1)` peek, `O(log n)` push/pop, _not_ a search tree.
- Trie = prefix / autocomplete.

---
### VII. Graphs — core
**Requires**: [[Queue|queues]], [[Stack|stacks]], [[Recursion|recursion]], [[Hash table - hash map|hash]]/[[Hash set|sets]], [[Union-Find - Disjoint Set Union|DSU]] can be learned just before [[Minimum Spanning Tree|MST]].

| index |                    Name                     |          Type          |
| :---: | :-----------------------------------------: | :--------------------: |
|  65   |  [[Graph representations (list - matrix)]]  | [[Data Structure\|DS]] |
|  66   |                   [[DFS]]                   |  [[Algorithm\|Algo]]   |
|  67   |                   [[BFS]]                   |  [[Algorithm\|Algo]]   |
|  68   |                 [[0-1 BFS]]                 |  [[Algorithm\|Algo]]   |
|  69   | [[Cycle detection (directed + undirected)]] |  [[Algorithm\|Algo]]   |
|  70   |          [[Connected components]]           |  [[Algorithm\|Algo]]   |
|  71   |      [[Topological sort (DFS + Kahn)]]      |  [[Algorithm\|Algo]]   |
|  72   |      [[Bipartite check OR 2-coloring]]      |  [[Algorithm\|Algo]]   |
|  73   |     [[Bridges and articulation points]]     |  [[Algorithm\|Algo]]   |
|  74   |      [[Strongly connected components]]      |  [[Algorithm\|Algo]]   |
|  75   |     [[Union-Find - Disjoint Set Union]]     | [[Data Structure\|DS]] |
*Must know* :
- adj list is the default.
- BFS = unweighted shortest path.
- DFS = structure (cycle, topo, SCC).
- DSU: path compression + union by rank → almost `O(1)` amortized (inverse Ackermann).
- Kosaraju and Tarjan for SCC.

---
### VIII. Graphs — weights, trees on graphs
**Requires**: heaps + [[Union-Find - Disjoint Set Union|DSU]] + core graph.

| index |                 Name                 |          Type           |
| :---: | :----------------------------------: | :---------------------: |
|  76   |             [[Dijkstra]]             | [[Algorithm\|Algo]]<br> |
|  77   |           [[Bellman-Ford]]           | [[Algorithm\|Algo]]<br> |
|  78   | [[SPFA (know it-treat as optional)]] | [[Algorithm\|Algo]]<br> |
|  79   |          [[Floyd-Warshall]]          | [[Algorithm\|Algo]]<br> |
|  80   |           [[Kruskal MST]]            | [[Algorithm\|Algo]]<br> |
|  81   |             [[Prim MST]]             | [[Algorithm\|Algo]]<br> |
|  82   |       [[Binary lifting - LCA]]       | [[Algorithm\|Algo]]<br> |
|  83   |       [[Euler tour of a tree]]       |       [[Pattern]]       |
|  84   |   [[Tree diameter - rerooting DP]]   | [[Algorithm\|Algo]]<br> |
*Must know* :
- Dijkstra needs non-negative weights.
- Bellman-Ford handles negatives and detects negative cycles.
- Floyd is `O(n³)` all-pairs.
- Kruskal = sort + DSU.
- Kruskal = sort + DSU
- LCA via binary lifting is the workhorse for tree queries.

---
### IX. Greedy and Dynamic Programming
**Requires**: [[Recursion|recursion]], sorting, DAGs/topo for some DP

| index |                   Name                    |        Type         |
| :---: | :---------------------------------------: | :-----------------: |
|  85   |        [[Greedy (as a paradigm)]]         |    [[Paradigm]]     |
|  86   | [[Activity selection - interval greedy]]  | [[Algorithm\|Algo]] |
|  87   |            [[Huffman coding]]             | [[Algorithm\|Algo]] |
|  88   |          [[Fractional knapsack]]          | [[Algorithm\|Algo]] |
|  89   |     [[DP (memoization + tabulation)]]     |    [[Paradigm]]     |
|  90   |  [[Classic 1D DP (climb, coin, house)]]   | [[Algorithm\|Algo]] |
|  91   |   [[Knapsack family (0-1, unbounded)]]    | [[Algorithm\|Algo]] |
|  92   |        [[LIS - patience sorting]]         | [[Algorithm\|Algo]] |
|  93   |    [[LCS - edit distance - string DP]]    | [[Algorithm\|Algo]] |
|  94   |            [[Grid - path DP]]             | [[Algorithm\|Algo]] |
|  95   |              [[Interval DP]]              | [[Algorithm\|Algo]] |
|  96   |              [[DP on trees]]              | [[Algorithm\|Algo]] |
|  97   |              [[Bitmask DP]]               | [[Algorithm\|Algo]] |
|  98   |               [[Digit DP]]                | [[Algorithm\|Algo]] |
|  99   | [[DP optimizations (D&C DP, Knuth, CHT)]] | [[Algorithm\|Algo]] |
|  100  | [[Matrix exponentiation on recurrences]]  | [[Algorithm\|Algo]] |
*Must know* :
- greedy needs a proof (exchange or stay-ahead).
- DP is recursion + cache: define _state_, _transition_, _base_, _order_.
- If you cannot name the state, you do not have a DP.

>NOTE: That’s 100 numbered items if you stop at interview + standard CP. You asked for _all the way to current complex practice_, so the list continues. Treat 85–100 as the last “must” layer for most engineers. Everything below is specialist.

---
### X. Strings beyond hashing
**Requires**: [[Array (Static)|arrays]], KMP-style prefix thinking, sometimes trees.

| index |               Name                |          Type          |
| :---: | :-------------------------------: | :--------------------: |
|  101  |     [[KMP - prefix function]]     |  [[Algorithm\|Algo]]   |
|  102  |          [[Z-algorithm]]          |  [[Algorithm\|Algo]]   |
|  103  | [[Manacher (longest palindrome)]] |  [[Algorithm\|Algo]]   |
|  104  |         [[Aho-Corasick]]          |  [[Algorithm\|Algo]]   |
|  105  |      [[Suffix array + LCP]]       | [[Data Structure\|DS]] |
|  106  |     [[Suffix tree (Ukkonen)]]     | [[Data Structure\|DS]] |
|  107  |       [[Suffix automaton]]        | [[Data Structure\|DS]] |
|  108  |  [[Burrows-Wheeler + FM-index]]   | [[Data Structure\|DS]] |
*Must know* :
- KMP/Z are linear pattern matchers.
- Suffix array is the practical full-text index; suffix tree is more powerful and heavier.
- Suffix automaton is the CP favorite for “all distinct substrings.”
- FM-index is how real compressors/search engines index text.

---
### XI. Range queries and “contest trees”
**Requires**: trees, prefix sums, recursion, sometimes persistence.

| index |                  Name                   |          Type          |
| :---: | :-------------------------------------: | :--------------------: |
|  109  | [[Sparse table (static idempotent RQ)]] | [[Data Structure\|DS]] |
|  110  |         [[Sqrt decomposition]]          |      [[Pattern]]       |
|  111  |         [[Fenwick tree - BIT]]          | [[Data Structure\|DS]] |
|  112  |            [[Segment tree]]             | [[Data Structure\|DS]] |
|  113  |   [[Segment tree + lazy propagation]]   | [[Data Structure\|DS]] |
|  114  |       [[Persistent segment tree]]       | [[Data Structure\|DS]] |
|  115  |    [[2D Fenwick - 2D segment tree]]     | [[Data Structure\|DS]] |
|  116  |            [[Li Chao tree]]             | [[Data Structure\|DS]] |
|  117  |  [[Sparse table on trees - RMQ ↔ LCA]]  | [[Data Structure\|DS]] |
|  118  |       [[Treap - implicit treap]]        | [[Data Structure\|DS]] |
|  119  | [[Policy-based - order-statistic tree]] | [[Data Structure\|DS]] |
|  120  |            [[Wavelet tree]]             | [[Data Structure\|DS]] |
*Must know* :
- sparse table = static min/max/gcd in `O(1)` after `O(n log n)` preprocess.
- Fenwick = prefix sums + point update, small and fast.
- Segment tree = general range query + update.
- Persistence = keep old versions (k-th in range).
- Wavelet tree = rank/select on sequences; used in compact indexes.

---
### XII. Heavy tree decompositions and dynamic trees
**Requires**: segment trees + LCA + DFS order.

| index |             Name              |          Type          |
| :---: | :---------------------------: | :--------------------: |
|  121  | [[Heavy-Light Decomposition]] |  [[Algorithm\|Algo]]   |
|  122  |  [[Centroid decomposition]]   |  [[Algorithm\|Algo]]   |
|  123  |      [[Euler-tour tree]]      | [[Data Structure\|DS]] |
|  124  |       [[Link-cut tree]]       | [[Data Structure\|DS]] |
*Must know* :
- HLD reduces path queries on trees to `O(log² n)` segment-tree queries.
- Link-cut maintains a forest under link/cut.
- This is the start of _dynamic_ graph DS.

---
### XIII. Flows, matchings, hard graphs
**Requires**: BFS/DFS + residual thinking.

| index |                   Name                   |        Type         |
| :---: | :--------------------------------------: | :-----------------: |
|  125  |    [[Ford-Fulkerson - Edmonds-Karp]]     | [[Algorithm\|Algo]] |
|  126  |                [[Dinic]]                 | [[Algorithm\|Algo]] |
|  127  |             [[Push-relabel]]             | [[Algorithm\|Algo]] |
|  128  |      [[Min-cut (max-flow min-cut)]]      | [[Algorithm\|Algo]] |
|  129  | [[Bipartite matching (Kuhn - Hopcroft)]] | [[Algorithm\|Algo]] |
|  130  |          [[Min-cost max-flow]]           | [[Algorithm\|Algo]] |
|  131  |         [[Hungarian assignment]]         | [[Algorithm\|Algo]] |
|  132  |                [[2-SAT]]                 | [[Algorithm\|Algo]] |
|  133  |  [[Euler path - circuit (Hierholzer)]]   | [[Algorithm\|Algo]] |
|  134  |   [[Hamiltonian ideas - TSP exact DP]]   | [[Algorithm\|Algo]] |
|  135  |  [[Planar graphs - faces (specialist)]]  | [[Algorithm\|Algo]] |
*Must know* :
- flow is the algorithm behind matching, circulation, and many “assignment with capacity” problems.
- Dinic is the default practical max-flow.
- 2-SAT = implication graph + SCC.

---
### XIV. Geometry, algebra, numbers
**Requires**: sorting, stacks (hull), modular arithmetic, sometimes FFT.

| index |                    Name                    |        Type         |
| :---: | :----------------------------------------: | :-----------------: |
|  136  |      [[Orientation - cross product]]       | [[Algorithm\|Algo]] |
|  137  | [[Convex hull (Graham - Andrew - Jarvis)]] | [[Algorithm\|Algo]] |
|  138  |  [[Sweep line (intersections, closest)]]   | [[Algorithm\|Algo]] |
|  139  |           [[Rotating calipers]]            | [[Algorithm\|Algo]] |
|  140  |     [[Line intersection - half-plane]]     | [[Algorithm\|Algo]] |
|  141  |  [[Sieve of Eratosthenes + linear sieve]]  | [[Algorithm\|Algo]] |
|  142  |         [[GCD - extended Euclid]]          | [[Algorithm\|Algo]] |
|  143  |         [[Modular inverse - CRT]]          | [[Algorithm\|Algo]] |
|  144  |    [[Fast pow - binary exponentiation]]    | [[Algorithm\|Algo]] |
|  145  |       [[Primality + factorization]]        | [[Algorithm\|Algo]] |
|  146  |     [[Discrete log - primitive root]]      | [[Algorithm\|Algo]] |
|  147  |               [[FFT - NTT]]                | [[Algorithm\|Algo]] |
|  148  |          [[Gaussian elimination]]          | [[Algorithm\|Algo]] |
*Must know* :
- geometry lives on orientation tests and sweep.
- Number theory in DSA is “arithmetic that must be fast and exact under overflow/mod.”
- FFT is how you multiply big polynomials in `O(n log n)`.

---
### XV. Randomized, online, parallel, hardness
**Requires**: probability + all core paradigms.

| index |                        Name                        |          Type          |
| :---: | :------------------------------------------------: | :--------------------: |
|  149  |       [[Randomized algorithms (as a class)]]       |      [[Paradigm]]      |
|  150  |                   [[Skip list]]                    | [[Data Structure\|DS]] |
|  151  |               [[Reservoir sampling]]               |  [[Algorithm\|Algo]]   |
|  152  |     [[Online algorithms - competitive ratio]]      |      [[Paradigm]]      |
|  153  | [[Streaming - sketching (HyperLogLog, Count-Min)]] | [[Data Structure\|DS]] |
|  154  |     [[NP-completeness (P vs NP, reductions)]]      |       [[Theory]]       |
|  155  |            [[Approximation algorithms]]            |      [[Paradigm]]      |
|  156  |     [[Parallel - PRAM - work-span (CLRS 27)]]      |      [[Paradigm]]      |
*Must know* :
- skip list ≈ probabilistic balanced tree (Redis uses this idea).
- Streaming sketches are how you count distinct / frequencies when the data does not fit.
- NP-completeness tells you when to stop looking for an exact poly-time algorithm.

---
### XVI. Advanced / modern structures (current ceiling)
> These are what “100” means if you keep going: research courses, databases, compact indexes, theoretically optimal dictionaries. Not interview default. 
> Used in production systems or CP at the top end.

| index |                   Name                   |          Type          |
| :---: | :--------------------------------------: | :--------------------: |
|  157  |            [[Fibonacci heap]]            | [[Data Structure\|DS]] |
|  158  |            [[Binomial heap]]             | [[Data Structure\|DS]] |
|  159  |          [[van Emde Boas tree]]          | [[Data Structure\|DS]] |
|  160  |         [[x-fast - y-fast trie]]         | [[Data Structure\|DS]] |
|  161  |             [[Fusion tree]]              | [[Data Structure\|DS]] |
|  162  |            [[Scapegoat tree]]            | [[Data Structure\|DS]] |
|  163  |            [[Cartesian tree]]            | [[Data Structure\|DS]] |
|  164  |            [[Interval tree]]             | [[Data Structure\|DS]] |
|  165  |  [[Range tree - fractional cascading]]   | [[Data Structure\|DS]] |
|  166  |               [[KD-tree]]                | [[Data Structure\|DS]] |
|  167  |      [[Quadtree - Octree - R-tree]]      | [[Data Structure\|DS]] |
|  168  | [[Persistent DS (fat node - path copy)]] | [[Data Structure\|DS]] |
|  169  |  [[Confluent - functional persistence]]  | [[Data Structure\|DS]] |
|  170  | [[Succinct - compact DS (rank-select)]]  | [[Data Structure\|DS]] |
|  171  |               [[LSM-tree]]               | [[Data Structure\|DS]] |
|  172  |           [[Learned indexes]]            | [[Data Structure\|DS]] |
|  173  |   [[Rope - piece table - gap buffer]]    | [[Data Structure\|DS]] |
|  174  |         [[Leftist - skew heap]]          | [[Data Structure\|DS]] |
|  175  |              [[Soft heap]]               | [[Data Structure\|DS]] |
|  176  |   [[Tango tree - dynamic optimality]]    | [[Data Structure\|DS]] |
|  177  |   [[Cuckoo filter - quotient filter]]    | [[Data Structure\|DS]] |
|  178  |       [[Count-Min - Count sketch]]       | [[Data Structure\|DS]] |
|  179  | [[Persistent union-find - rollback DSU]] | [[Data Structure\|DS]] |
|  180  |  [[Dynamic connectivity (Holm et al.)]]  | [[Data Structure\|DS]] |
*Must know at this layer* :
- you are no longer picking “a tree.” You are picking a _model_ (comparison, RAM, I/O, succinct) and a _workload_ (point vs range, static vs dynamic, in-memory vs disk).
- LSM-tree = write-heavy storage (LevelDB, RocksDB).
- B+ tree = read-heavy disk indexes.
- vEB / x-fast = integer keys on a universe `U` in `O(log log U)`.
- Succinct = near-information-theoretic space.
- Persistence = time travel.

---
## How to use this without drowning
Map: [[Learning Flow.canvas]]. Do not start from the tables.

**If the goal is interviews (most engineers):**  
0 → 84, plus 85–98 well. Tries, DSU, Dijkstra, heap, segment-tree _awareness_. Stop before suffix automata and link-cut.

**If the goal is CP:**  
Add 101–122, 125–133, 141–147, rollback DSU, HLD.

**If the goal is databases / search / infra:**  
B+ tree, LSM, skip list, bloom, hash variants, suffix array / FM-index, succinct rank-select.

**Hard trade-off, named:**  
Coverage vs depth. Implementing 180 structures is wasted motion. Implementing each _layer’s representative_ and knowing _when the others win_ is the actual skill.

**Smallest working version of “learn DSA”:**

1. Foundations until you can state complexity without guessing.
2. Array + hash + two pointers + binary search + stack.
3. Recursion → tree DFS → heap → graph BFS/DFS.
4. Dijkstra + DSU + DP on 20 classic states.
5. Only then Fenwick/segment/trie/strings.

**What “must know” means per item, always:**

- Invariant
- Operations and their real complexities (worst vs amortized)
- When it beats the previous structure
- One failure mode (unbalanced BST, hash pile-up, Dijkstra + negatives, greedy without proof)
