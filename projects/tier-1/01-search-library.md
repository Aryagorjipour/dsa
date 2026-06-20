# Build Your Own Search Library

## 1. Motivation & Real-World Context

Search is not a solved problem you call and forget — it is a decision you make based on data shape, access pattern, and distribution. Three production examples illustrate why:

**PostgreSQL B-tree index scans.** When the query planner decides between a sequential scan and an index scan, it is choosing between linear and binary search over pages. For a table of 10 million rows with a selectivity of 0.01%, an index scan wins decisively. For a full-table aggregation, sequential scan wins because it avoids random I/O. The planner encodes exactly this decision.

**API pagination cursors.** Systems like GitHub's REST API and Stripe's list endpoints use opaque cursor tokens that encode a sort key. When the server needs to resume from a cursor in a sorted index, it uses binary search to find the boundary in O(log n). A linear scan here would make paginating through 500,000 records progressively slower — the last page would be 500x slower than the first.

**IDE symbol lookup.** In VS Code and JetBrains IDEs, "Go to Definition" on a large file uses binary search against a sorted symbol table to locate the definition position in microseconds. For fuzzy symbol search (Ctrl+P), a linear scan with early termination is used instead because sorted order is not guaranteed over file names.

The real skill is knowing *which* algorithm to reach for. This project builds all four major search variants and then an adaptive dispatcher that makes that decision for you.

---

## 2. Learning Objectives

By completing this project, you will deeply understand:

1. **Off-by-one correctness in binary search** — why the invariant `lo &lt;= hi` vs `lo &lt; hi` changes what you return, and why mid computation must use `lo + (hi - lo) / 2` to avoid integer overflow. See [Binary Search](/algorithms/07-binary-search).
2. **Monotone predicate abstraction** — how Two Crystal Balls generalizes binary search from "find value" to "find first true in a boolean array," enabling any threshold-based search. See [Binary Search](/algorithms/07-binary-search).
3. **Exponential search mechanics** — how to locate a bound in O(log i) time before binary-searching within it, making unbounded arrays tractable. See [Exponential Search](/algorithms/09-exponential-search).
4. **Distribution-dependent performance** — why Interpolation Search achieves O(log log n) on uniform data but degrades to O(n) on skewed data, and how to detect that skew. See [Linear Search](/algorithms/06-linear-search).
5. **Benchmark methodology** — how to measure nanosecond-level differences fairly, accounting for CPU caches, branch prediction warm-up, and garbage collector pauses.
6. **Generic type design** — how to write a single search implementation that works over any ordered type without sacrificing type safety or performance.
7. **Approximate/fuzzy search** — how to adapt linear scan to return the nearest match within a tolerance, as used in time-series databases like InfluxDB for timestamp lookups.

---

## 3. Project Scope

**In Scope:**
- Linear search (unsorted and sorted early-exit variants)
- Binary search (iterative, to avoid stack overhead)
- Two Crystal Balls problem (monotone predicate variant)
- Exponential search for unbounded ranges
- Interpolation search with skew detection
- Generic type support over any comparable/ordered type
- Benchmarking harness comparing all algorithms on various dataset types
- Adaptive search dispatcher that inspects data properties and selects algorithm
- Fuzzy/approximate search returning closest match within a tolerance

**Out of Scope (for v1):**
- Persistent or disk-backed search (B-tree, LSM)
- Concurrent/thread-safe search structures
- SIMD or vectorized search
- Inverted index or full-text search (separate project)
- Interpolation search on string keys

---

## 4. Core DSA Concepts Used

| Concept | Role in this project | Handbook Link | Difficulty |
|---------|----------------------|---------------|------------|
| Linear Search | Baseline algorithm; also used inside fuzzy search and as fallback for unsorted data | [/algorithms/06-linear-search](/algorithms/06-linear-search) | Beginner |
| Binary Search | Core of three out of four algorithms; off-by-one handling is the central skill | [/algorithms/07-binary-search](/algorithms/07-binary-search) | Beginner |
| Two Crystal Balls | Generalizes binary search to monotone predicates; teaches invariant thinking | [/algorithms/07-binary-search](/algorithms/07-binary-search) | Intermediate |
| Exponential Search | Extends binary search to unbounded inputs; teaches the "find bound first" pattern | [/algorithms/09-exponential-search](/algorithms/09-exponential-search) | Intermediate |
| Interpolation Search | Shows distribution-aware algorithms; teaches when math beats pure comparisons | [/algorithms/06-linear-search](/algorithms/06-linear-search) | Intermediate |
| Dynamic Array | Used for the generated test datasets | [/data-structures/02-dynamic-array](/data-structures/02-dynamic-array) | Beginner |
| Generics / Type Constraints | Enables single implementation over all ordered types without type erasure overhead | [/fundamentals/01-big-o](/fundamentals/01-big-o) | Intermediate |

---

## 5. High-Level Architecture

The library has four layers: the algorithm implementations, a type-abstraction layer, a dataset generator, and the adaptive dispatcher on top.

```mermaid
graph TD
    A[Client Code] --> B[Adaptive Dispatcher]
    B --> C{Data Properties?}
    C -->|Unsorted| D[Linear Search]
    C -->|Sorted, uniform dist| E[Interpolation Search]
    C -->|Sorted, unknown dist| F[Binary Search]
    C -->|Unbounded / stream| G[Exponential Search]
    C -->|Monotone predicate| H[Two Crystal Balls]

    subgraph Core Algorithms
        D
        E
        F
        G
        H
    end

    subgraph Support Layer
        I[Dataset Generator]
        J[Benchmarking Harness]
        K[Fuzzy Search Wrapper]
    end

    B --> K
    A --> I
    I --> J
    J --> Core Algorithms
```

**Key interfaces/abstractions:**

- `Searcher[T]` — a function type `func(data []T, target T) int` (Go) or `Func&lt;T[], T, int&gt;` (C#). Every algorithm implements this signature so the benchmarker can call them uniformly.
- `Predicate[T]` — `func(T) bool` for Two Crystal Balls variant.
- `DatasetConfig` — struct holding size, distribution (uniform/skewed/sorted/reversed), and duplicate ratio. The generator produces deterministic datasets from this config.
- `AdaptiveHints` — flags the caller can pass to the dispatcher: `IsSorted`, `IsUnbounded`, `IsPredicate`, `Distribution`.

---

## 6. Implementation Milestones (with Hints)

### Milestone 1: Implement All Four Algorithms with Correct Boundary Handling

**Goal:** Write `LinearSearch`, `BinarySearch`, `ExponentialSearch`, and `InterpolationSearch`, each returning the index of the target or -1 if not found. Also implement `TwoCrystalBalls` taking a `[]bool` and returning the first true index.

**Key Challenges:**
- Binary search mid computation: `mid = lo + (hi-lo)/2`, never `(lo+hi)/2`. With `lo=1_500_000_000` and `hi=2_000_000_000`, the naive formula overflows int32.
- Binary search loop invariant: use `lo &lt;= hi` with the target-found check inside the loop. Decide what to return when not found (`-1` or the insertion point like `~index`).
- Interpolation search division by zero: if `arr[hi] == arr[lo]`, fall back to linear scan.
- Two Crystal Balls: jump by `sqrt(n)` steps until you overshoot, then linear scan back from the last safe position.

**Hints & Guidance:**
- Start with a test table of known inputs and expected outputs for each algorithm before writing any implementation.
- For Two Crystal Balls, the jump size is `int(math.Sqrt(float64(len(arr))))`. After the first crystal ball breaks (you find a `true`), the second ball scans linearly from the previous jump boundary — not from 0.
- For Exponential Search, double the bound (`1, 2, 4, 8, ...`) until `arr[bound] >= target` or `bound >= len(arr)`. Then binary-search in `[bound/2, min(bound, n-1)]`.
- Test edge cases first: empty slice, single element, target at index 0, target at last index, target not present.

**Success Criteria:**
- All five algorithms return correct results for a manually verified test suite of at least 20 cases.
- Binary search handles arrays of size 1, 2, and 2^31-1 (simulate large with pointer arithmetic or index math).
- Interpolation search handles the case where all elements are identical.
- Two Crystal Balls correctly handles arrays that are all-false and all-true.

---

### Milestone 2: Add Generic Type Support

**Goal:** Lift all five algorithms from `int`-only to work over any ordered type (`int`, `int64`, `float64`, `string`).

**Key Challenges:**
- In Go, you cannot use `&lt;` on a type parameter without a constraint. You need `constraints.Ordered` or define your own.
- In C#, you need either `IComparable&lt;T&gt;` constraint or a `Comparer&lt;T&gt;` parameter. The `Comparer&lt;T&gt;.Default` pattern is idiomatic.
- Interpolation search is fundamentally arithmetic — computing `(target - arr[lo]) * (hi - lo) / (arr[hi] - arr[lo])` requires numeric types. You will need a separate numeric-only variant or a converter function.

**Hints & Guidance:**
- In Go 1.21+: `func BinarySearch[T constraints.Ordered](data []T, target T) int`.
- In C#: `int BinarySearch&lt;T&gt;(T[] data, T target) where T : IComparable&lt;T&gt;`. Use `target.CompareTo(data[mid])` instead of `&lt;` and `>`.
- For Interpolation Search in Go, constrain to `constraints.Integer | constraints.Float`. You will need to convert to `float64` for the position formula to avoid integer division losing precision.
- Write a separate `InterpolationSearchNumeric[T constraints.Integer | constraints.Float]`.

**Success Criteria:**
- All algorithms compile and pass tests for `int`, `int64`, `float64`, and `string` (except Interpolation Search which is numeric-only).
- No use of `interface{}` / `any` in hot paths (type erasure kills performance).

---

### Milestone 3: Add a Benchmarking Harness

**Goal:** Build a harness that runs all five algorithms on datasets of sizes `[100, 1_000, 10_000, 100_000, 1_000_000]` and reports average time per search in nanoseconds.

**Key Challenges:**
- Single-run timing is noisy. You need to run each algorithm at least 1,000 times per dataset size and take the median, not the mean (outliers from GC/OS skew the mean).
- You must search for the same target in each run to ensure comparability. Use a fixed target near the middle.
- Compiler/runtime optimizations may eliminate your search if the result is unused. Capture the return value and XOR it into a global sink variable.

**Hints & Guidance:**
- Go: Use `testing.B` (benchmark functions) for the authoritative measurement. You can also use `time.Now()` / `time.Since()` for a custom harness.
- C#: Use `System.Diagnostics.Stopwatch`. Run a warm-up pass of 100 iterations before timing to allow JIT compilation.
- Print results as a table: algorithm name, dataset size, median time (ns), and ops/sec.
- To prevent dead code elimination in Go: `var Sink int; Sink ^= result`. In C#: `[MethodImpl(MethodImplOptions.NoInlining)]` on the search call or use `GC.KeepAlive`.

**Success Criteria:**
- Harness runs without error for all size/algorithm combinations.
- Results show the expected ordering: Binary/Interpolation dramatically faster than Linear for large sorted inputs.
- Output table is human-readable and reproducible across two runs within 10% variance.

---

### Milestone 4: Add an Adaptive Search Dispatcher

**Goal:** Implement `AdaptiveSearch[T](data []T, target T, hints AdaptiveHints) int` that inspects data properties and selects the best algorithm.

**Key Challenges:**
- Detecting whether data is sorted requires O(n) scan, which defeats the purpose. Use sampling: check 20 random adjacent pairs. If all are non-decreasing, assume sorted.
- Detecting distribution uniformity: sample 10 values and check whether the ratio `(values[i] - values[0]) / (values[n-1] - values[0])` is roughly linear in `i`. A coefficient of variation below 0.1 suggests uniform distribution.
- You cannot run this analysis for free — the dispatcher overhead should be amortized if searching the same dataset repeatedly.

**Hints & Guidance:**
- Define `AdaptiveHints` as a bitmask or struct with `IsSorted bool`, `IsUniform bool`, `IsUnbounded bool`.
- If `!IsSorted`: linear search.
- If `IsSorted && IsUniform && len(data) > 1000`: interpolation search.
- If `IsSorted && !IsUniform`: binary search.
- If `IsUnbounded`: exponential search.
- Add a `Analyze(data []T) AdaptiveHints` helper that does the sampling.

**Success Criteria:**
- Dispatcher selects interpolation search for a uniform-distribution sorted dataset of 100,000 elements and is measurably faster than binary search.
- Dispatcher selects linear search for an unsorted dataset.
- `Analyze()` function is tested against known distribution types.

---

### Milestone 5: Add Fuzzy / Approximate Search

**Goal:** Implement `FuzzySearch(data []float64, target, tolerance float64) int` that returns the index of the element closest to `target` within `tolerance`, or -1 if none is within tolerance.

**Key Challenges:**
- If data is sorted, binary search can find the insertion point and then check the two neighbors — O(log n).
- If data is unsorted, linear scan is required — O(n).
- "Closest within tolerance" is different from "first within tolerance" — you want the nearest, not just any hit.

**Hints & Guidance:**
- For sorted data: use binary search to find where `target` would be inserted (lower bound). Then check indices `pos-1` and `pos` and return whichever is closer, provided it is within `tolerance`.
- For unsorted data: scan all, track `bestIdx` and `bestDist`. Return `bestIdx` if `bestDist &lt;= tolerance`.
- Test with time-series data: an array of Unix timestamps at 1-second intervals, searching for a timestamp that falls between two entries.

**Success Criteria:**
- Fuzzy search returns the nearest element for sorted and unsorted inputs.
- Returns -1 when no element is within tolerance.
- Sorted path is measurably O(log n): doubling dataset size adds only one comparison.

---

## 7. Stretch Goals (for advanced learners)

1. **Fractional cascading.** When searching for the same target across `k` sorted arrays (as in a range tree), fractional cascading reduces the total cost from O(k log n) to O(k + log n). Implement a `CascadedSearch` over a slice of sorted slices.
2. **Eytzinger layout.** Reorder a sorted array into BFS order so that binary search has sequential memory access instead of jumping around. Measure cache miss reduction with `perf stat` (Linux) or ETW (Windows).
3. **Bitset-accelerated linear search.** For integer datasets, pack values into a bitset and use `popcount` to count matches in O(n/64). Useful for database bitmap index scans.
4. **Concurrent search.** Partition the array into CPU-count chunks and search each in a goroutine/Task, then merge. Measure the speedup and explain when it is not worth the overhead.
5. **Interpolation search on non-numeric keys.** Extend interpolation search to strings using their lexicographic position in a known alphabet distribution (e.g., English word frequency tables).

---

## 8. Testing & Validation Strategy

**Correctness tests (table-driven):**
- Empty array → -1 for all algorithms.
- Single-element array, target present → 0; not present → -1.
- Target at index 0 (lo boundary), target at last index (hi boundary).
- Array with all identical elements and target equal to that element.
- Array with all identical elements and target different → -1.
- Large array (10,000 elements): verify all algorithms agree on the same result as `slices.Index` / `Array.IndexOf`.

**Property-based tests:**
- For any sorted array and target present in the array, all sorted-data algorithms must return an index `i` such that `data[i] == target`.
- For any sorted array and target not present, algorithms must return -1 (or insertion point consistently).
- Two Crystal Balls: for any `[]bool` with the pattern `[false, false, ..., true, true, ...]`, must return the exact first `true` index.

**Performance tests:**
- Binary search on 1,000,000 elements completes in under 1 microsecond per lookup.
- Linear search on 1,000,000 elements completes in under 2 milliseconds per lookup (memory bandwidth bound).
- Interpolation search on uniform data of 1,000,000 elements is measurably faster than binary search (fewer iterations).

**Regression tests:**
- The classic overflow bug: search for `target = 1_750_000_000` in a sorted `int32` array with `lo = 1_500_000_000, hi = 2_000_000_000`. Verify no overflow occurs.

---

## 9. C# and Go Implementation Notes

### C#

- **Type constraints:** Use `where T : IComparable&lt;T&gt;` for all search methods. Call `target.CompareTo(data[mid])` which returns negative, zero, or positive — do not compare to literal 0 with `==`, check `&lt; 0`, `> 0`, `== 0`.
- **`Array.BinarySearch` exists** in the BCL — implement from scratch for learning, then compare your results to it. `Array.BinarySearch` returns `~insertionIndex` (bitwise NOT) when not found, not -1.
- **Span for slices:** Use `ReadOnlySpan&lt;T&gt;` instead of `T[]` slices to avoid allocation when passing sub-arrays to recursive calls (though iterative implementations avoid this entirely).
- **Avoid `dynamic`:** Never use `dynamic` for generic search. It forces a DLR dispatch on every comparison — 10–50x slower than `IComparable&lt;T&gt;`.
- **Interpolation search arithmetic:** Cast to `double` before computing the position formula. `(double)(target - data[lo]) / (data[hi] - data[lo])` where both are `long` prevents integer overflow and loss of precision.
- **Benchmarking:** Use `System.Diagnostics.Stopwatch.GetTimestamp()` and `Stopwatch.Frequency` for nanosecond resolution. `DateTime.Now` has only millisecond resolution.

### Go

- **Type constraints:** Use `golang.org/x/exp/constraints.Ordered` for Go &lt; 1.21. For Go 1.21+, use `cmp.Ordered` from the standard library (`golang.org/x/exp` is no longer needed for this).
- **`slices.BinarySearch` (Go 1.21+):** Returns `(index, found bool)` — your implementation should match this signature for compatibility. The standard library version returns the insertion point when not found.
- **Integer overflow:** In Go, `int` is 64-bit on 64-bit platforms, so `(lo + hi) / 2` will not overflow for array indices in practice. However, practice the safe form anyway for portability to 32-bit targets.
- **Avoiding allocations in hot path:** Do not use `interface{}` / `any` for comparisons. A generic function with `constraints.Ordered` compiles to type-specific code with zero boxing.
- **Multi-digit numbers in interpolation search:** Use `float64` for the position formula. `pos := lo + int(float64(hi-lo)*float64(target-arr[lo])/float64(arr[hi]-arr[lo]))`.
- **Benchmark discipline:** In `func BenchmarkBinarySearch(b *testing.B)`, call `b.ResetTimer()` after setup. Use `b.N` as the loop count. Access `result` after the loop to prevent elimination.

---

## 10. Potential Extensions & Related Projects

1. **Build Your Own Sorted Set / Sorted Map** — use binary search as the core lookup primitive inside a sorted slice-backed structure, then compare to a BST-backed implementation. Measures the cache-locality advantage of contiguous arrays.
2. **Build Your Own B-tree** — extend binary search to multi-level page structures as used in PostgreSQL, SQLite, and InnoDB. Binary search runs at every node level.
3. **Build Your Own Trie** — for string-specific search that achieves O(m) time (m = key length) regardless of dataset size, outperforming binary search on large string datasets.
4. **Build Your Own Bloom Filter** — probabilistic membership test that avoids the search entirely for definite non-members, used by databases like RocksDB and Cassandra to skip disk reads.
