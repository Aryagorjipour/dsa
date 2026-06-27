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

- Leaf nodes represent single elements.
- Internal nodes represent the combination (sum, min, max, gcd, etc.) of their children.
- The tree is usually built on top of an array (4×n size is a common trick).

### Canonical Problem: Range Sum Queries with Point Updates (and Lazy Range Updates)

**Problem Description:**

Given an array of integers (size N up to 10⁵), support many operations:

1. **Update**: Add a value V to the element at index i (or set it to a new value).
2. **Query**: Compute the sum (or min/max) of elements from index L to R (inclusive).

A Segment Tree solves this in O(log N) per operation by storing precomputed aggregates in a tree over ranges.

This pattern appears in database range aggregates, time-series analytics, financial running totals, and competitive programming.

## Operations & Complexity

| Operation        | Time     | Space  |
|------------------|----------|--------|
| Build            | O(n)     | O(n)   |
| Range query      | O(log n) | O(n)   |
| Point update     | O(log n) | O(n)   |
| Range update (lazy)| O(log n)| O(n)   |

## Complete Implementation (C#) — Lazy Range Add + Range Sum

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
        Propagate(2 * node + 1, start, mid);
        Propagate(2 * node + 2, mid + 1, end);
        tree[node] = tree[2 * node + 1] + tree[2 * node + 2];
    }

    public void Update(int idx, long val) {
        UpdatePoint(0, 0, n - 1, idx, val);
    }

    private void UpdatePoint(int node, int start, int end, int idx, long val) {
        Propagate(node, start, end);
        if (start == end) {
            tree[node] = val;
            return;
        }
        int mid = (start + end) / 2;
        if (idx <= mid) UpdatePoint(2 * node + 1, start, mid, idx, val);
        else UpdatePoint(2 * node + 2, mid + 1, end, idx, val);
        Propagate(2 * node + 1, start, mid);
        Propagate(2 * node + 2, mid + 1, end);
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
        return Query(2 * node + 1, start, mid, l, r) +
               Query(2 * node + 2, mid + 1, end, l, r);
    }
}
```

## Complete Implementation (Go)

From `examples/go/segment_tree_range_sum.go`, expanded with lazy range add.

```go
type SegmentTree struct {
    tree, lazy []int64
    n          int
}

func NewSegmentTree(arr []int) *SegmentTree {
    n := len(arr)
    st := &SegmentTree{
        tree: make([]int64, 4*n),
        lazy: make([]int64, 4*n),
        n:    n,
    }
    st.build(arr, 0, 0, n-1)
    return st
}

func (st *SegmentTree) build(arr []int, node, start, end int) {
    if start == end {
        st.tree[node] = int64(arr[start])
        return
    }
    mid := (start + end) / 2
    st.build(arr, 2*node+1, start, mid)
    st.build(arr, 2*node+2, mid+1, end)
    st.tree[node] = st.tree[2*node+1] + st.tree[2*node+2]
}

func (st *SegmentTree) propagate(node, start, end int) {
    if st.lazy[node] != 0 {
        st.tree[node] += int64(end-start+1) * st.lazy[node]
        if start != end {
            st.lazy[2*node+1] += st.lazy[node]
            st.lazy[2*node+2] += st.lazy[node]
        }
        st.lazy[node] = 0
    }
}

func (st *SegmentTree) Update(idx, val int) {
    st.updatePoint(0, 0, st.n-1, idx, int64(val))
}

func (st *SegmentTree) updatePoint(node, start, end, idx int, val int64) {
    st.propagate(node, start, end)
    if start == end {
        st.tree[node] = val
        return
    }
    mid := (start + end) / 2
    if idx <= mid {
        st.updatePoint(2*node+1, start, mid, idx, val)
    } else {
        st.updatePoint(2*node+2, mid+1, end, idx, val)
    }
    st.propagate(2*node+1, start, mid)
    st.propagate(2*node+2, mid+1, end)
    st.tree[node] = st.tree[2*node+1] + st.tree[2*node+2]
}

func (st *SegmentTree) UpdateRange(l, r int, val int64) {
    st.updateRange(0, 0, st.n-1, l, r, val)
}

func (st *SegmentTree) updateRange(node, start, end, l, r int, val int64) {
    st.propagate(node, start, end)
    if start > end || start > r || end < l {
        return
    }
    if l <= start && end <= r {
        st.lazy[node] += val
        st.propagate(node, start, end)
        return
    }
    mid := (start + end) / 2
    st.updateRange(2*node+1, start, mid, l, r, val)
    st.updateRange(2*node+2, mid+1, end, l, r, val)
    st.propagate(2*node+1, start, mid)
    st.propagate(2*node+2, mid+1, end)
    st.tree[node] = st.tree[2*node+1] + st.tree[2*node+2]
}

func (st *SegmentTree) Query(l, r int) int64 {
    return st.query(0, 0, st.n-1, l, r)
}

func (st *SegmentTree) query(node, start, end, l, r int) int64 {
    st.propagate(node, start, end)
    if start > end || start > r || end < l {
        return 0
    }
    if l <= start && end <= r {
        return st.tree[node]
    }
    mid := (start + end) / 2
    return st.query(2*node+1, start, mid, l, r) +
        st.query(2*node+2, mid+1, end, l, r)
}
```

**Runnable example:** `examples/go/segment_tree_range_sum.go`

## Lazy Propagation (The Power Move)

When you need to update a **range** (add 5 to all elements from L to R), naive approaches are slow.

Lazy propagation defers updates. You mark a node as "this whole range needs +5 later" and only push the update down when you actually need to look at children.

## Real World Uses

### 1. Competitive Programming

Almost every hard range query problem uses segment trees or fenwick trees.

### 2. Databases & Analytics Systems

Some column stores and time-series databases use segment-tree-like structures for range aggregates.

### 3. Finance

Risk calculations over ranges of trades, order book range statistics, time-series aggregations.

### 4. Gaming

Range updates on grids (damage over area + queries).

## Segment Tree vs Other Structures

| Feature                  | Segment Tree       | Fenwick Tree          |
|--------------------------|--------------------|-----------------------|
| Code length              | Longer             | Very short            |
| Min / Max / custom       | Easy               | Hard                  |
| Range updates (lazy)     | Natural            | Possible with tricks  |
| Sum queries              | Excellent          | Excellent             |

## Summary

Segment tree = binary tree over array ranges that lets you query and update ranges in logarithmic time.

It is one of the most powerful "array + range" tools in the algorithmic toolbox.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Time-Series Analytics Engine](/projects/tier-3/12-time-series-analytics) — range queries and updates on streaming metrics.
:::

**Next:** [21 - Fenwick Tree (Binary Indexed Tree)](21-fenwick-tree.md)