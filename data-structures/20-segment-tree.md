# 20 - Segment Tree

## What Problem Does a Segment Tree Solve?

You have a large array.

You want to answer queries like:
- "What is the sum from index L to R?"
- "What is the minimum / maximum in range L to R?"
- "What is the count of numbers > X in range L to R?"

And you also want to **update** individual elements or ranges efficiently.

Naive array: O(n) per query → too slow for large data + many queries.

Segment tree: O(log n) per query and update.

## The Core Idea

![Segment Tree](/images/segment-tree.png)

A segment tree is a **binary tree** over the array where each node represents a **range** (segment) of the array.

![Advanced Segment Tree Example](/images/segment-tree-advanced.png)

### Canonical Problem: Range Sum Queries with Point Updates (and Lazy Range Updates)

**Problem Description:**

You are given an array of integers, say of size N (up to 10^5). You need to support two types of operations many times (up to 10^5):

1. **Update**: Add a value V to the element at index i (or set it to a new value).
2. **Query**: Compute the sum (or min/max) of elements from index L to R (inclusive).

Naive approach (loop each time) is O(N) per operation → too slow for large N and Q.

A Segment Tree solves this in O(log N) per operation by storing precomputed aggregates in a tree over ranges.

This is one of the most fundamental "why Segment Tree exists" problems. It appears in:
- Database range aggregates
- Time-series analytics (sum of sales in date ranges + corrections)
- Competitive programming (hundreds of problems on Codeforces, AtCoder, etc.)
- Financial systems (running portfolio value over periods with updates)

Without lazy propagation, range updates would be slow. Lazy allows deferring range updates.

**Full Implementation (Point Update + Range Sum + Lazy Range Add)**

**C#**

```csharp
public class SegmentTree {
    private long[] tree;
    private long[] lazy;
    private int n;

    public SegmentTree(int[] arr) {
        n = arr.Length;
        tree = new long[4 * n];
        lazy = new long[4 * n];
        Build(arr, 0, 0, n - 1);
    }

    private void Build(int[] arr, int node, int start, int end) {
        if (start == end) {
            tree[node] = arr[start];
            return;
        }
        int mid = (start + end) / 2;
        Build(arr, 2 * node + 1, start, mid);
        Build(arr, 2 * node + 2, mid + 1, end);
        tree[node] = tree[2 * node + 1] + tree[2 * node + 2];
    }

    private void Propagate(int node, int start, int end) {
        if (lazy[node] != 0) {
            tree[node] += (end - start + 1) * lazy[node];
            if (start != end) {
                lazy[2 * node + 1] += lazy[node];
                lazy[2 * node + 2] += lazy[node];
            }
            lazy[node] = 0;
        }
    }

    public void UpdateRange(int l, int r, long val) {
        UpdateRange(0, 0, n - 1, l, r, val);
    }

    private void UpdateRange(int node, int start, int end, int l, int r, long val) {
        Propagate(node, start, end);
        if (start > end || start > r || end < l) return;
        if (l <= start && end <= r) {
            lazy[node] += val;
            Propagate(node, start, end);
            return;
        }
        int mid = (start + end) / 2;
        UpdateRange(2 * node + 1, start, mid, l, r, val);
        UpdateRange(2 * node + 2, mid + 1, end, l, r, val);
        tree[node] = tree[2 * node + 1] + tree[2 * node + 2];
    }

    public long Query(int l, int r) {
        return Query(0, 0, n - 1, l, r);
    }

    private long Query(int node, int start, int end, int l, int r) {
        Propagate(node, start, end);
        if (start > end || start > r || end < l) return 0;
        if (l <= start && end <= r) return tree[node];
        int mid = (start + end) / 2;
        return Query(2 * node + 1, start, mid, l, r) + Query(2 * node + 2, mid + 1, end, l, r);
    }
}
```

**Go** (similar structure with lazy)

(The Go version follows the exact same logic as C# above, using slices for tree and lazy.)

This full implementation (with lazy) shows the power for real complicated use cases. See the algorithms chapter for more DP/graph integrations.

**Runnable example**: examples/go/segment_tree_range_sum.go and C# equivalent.

- Leaf nodes represent single elements.
- Internal nodes represent the combination (sum, min, max, gcd, etc.) of their children.

The tree is usually built on top of an array (4*n size is a common trick).

## Visual (Sum Segment Tree on [1,3,5,7,9,11])

Indices: 0  1  2  3  4  5
Values:  1  3  5  7  9 11

Tree nodes (conceptual):
- Root: sum [0-5] = 36
  - Left: sum [0-2] = 9
    - ...
  - Right: sum [3-5] = 27

## Operations

- Build: O(n)
- Range Query (sum/min/max/...): O(log n)
- Point Update: O(log n)
- Range Update (with lazy propagation): O(log n)

## Lazy Propagation (The Power Move)

When you need to update a **range** (add 5 to all elements from L to R), naive would be slow.

Lazy propagation defers updates. You mark a node as "this whole range needs +5 later" and only push the update down when you actually need to look at children.

This is essential for many advanced use cases.

## C# Conceptual Implementation (Point Update + Range Sum)

```csharp
public class SegmentTree {
    private long[] tree;
    private int n;

    public SegmentTree(int[] arr) {
        n = arr.Length;
        tree = new long[4 * n];
        Build(arr, 0, 0, n - 1);
    }

    private void Build(int[] arr, int node, int start, int end) {
        if (start == end) {
            tree[node] = arr[start];
            return;
        }
        int mid = (start + end) / 2;
        Build(arr, 2 * node + 1, start, mid);
        Build(arr, 2 * node + 2, mid + 1, end);
        tree[node] = tree[2 * node + 1] + tree[2 * node + 2];
    }

    public long Query(int l, int r) => Query(0, 0, n - 1, l, r);

    private long Query(int node, int start, int end, int l, int r) {
        if (r < start || end < l) return 0;
        if (l <= start && end <= r) return tree[node];
        int mid = (start + end) / 2;
        return Query(2 * node + 1, start, mid, l, r) +
               Query(2 * node + 2, mid + 1, end, l, r);
    }

    public void Update(int idx, long val) => Update(0, 0, n - 1, idx, val);

    private void Update(int node, int start, int end, int idx, long val) {
        if (start == end) {
            tree[node] = val;
            return;
        }
        int mid = (start + end) / 2;
        if (idx <= mid)
            Update(2 * node + 1, start, mid, idx, val);
        else
            Update(2 * node + 2, mid + 1, end, idx, val);
        tree[node] = tree[2 * node + 1] + tree[2 * node + 2];
    }
}
```

## Real World Uses

### 1. Competitive Programming (Heavy)

Almost every hard range query problem uses segment trees or fenwick trees.

### 2. Databases & Analytics Systems

Some column stores and time-series databases use segment-tree like structures for range aggregates.

### 3. Graphics & Computational Geometry

Range minimum queries on terrains, visibility computations.

### 4. Finance

- Risk calculations over ranges of trades
- Order book range statistics
- Time-series aggregations

### 5. Gaming

- Range updates on grids (damage over area + queries)
- Some AI planning structures

### 6. Operating Systems / Memory Management

Some allocators track free ranges using segment-tree-like structures for fast "find a free block of size X" queries.

## Variants

- Sum segment tree
- Min/Max segment tree
- Segment tree with lazy propagation
- Segment tree beats (advanced)
- 2D segment trees (rare but powerful)
- Persistent segment trees (versioned history)

## Segment Tree vs Other Structures

- Vs Fenwick Tree: Segment tree is more flexible (can do min, max, gcd, custom merge). Fenwick is simpler and faster for pure prefix sums.
- Vs B+ Tree: B+ tree is for disk + persistence. Segment tree is usually in-memory.

## When You Should Learn It Deeply

If you ever work on:
- Analytics engines
- High-frequency trading systems
- Game engines with complex state queries
- Any system doing heavy range aggregation on arrays

...segment trees (or fenwick) will appear.

## Summary

Segment tree = binary tree over array ranges that lets you query and update ranges in logarithmic time.

It is one of the most powerful "array + range" tools in the algorithmic toolbox.


::: tip Project Lab
**Build it yourself:** [Time-Series Analytics Engine](/projects/tier-3/12-time-series-analytics) — range queries and updates on streaming metrics.
:::

**Next:** [21 - Fenwick Tree (Binary Indexed Tree)](21-fenwick-tree.md)
