# 21 - Fenwick Tree (Binary Indexed Tree)

## What is a Fenwick Tree?

A **Fenwick Tree** (also called Binary Indexed Tree or BIT) is a data structure that provides extremely efficient **prefix sum** queries and **point updates**.

It was invented by Peter Fenwick in 1994 and is famous in competitive programming because it is:
- Much simpler to code than a segment tree for sum queries
- Uses less memory
- Slightly faster in practice for the operations it supports

## The Core Insight

Instead of storing the actual values, each position in the Fenwick tree stores the **sum of a specific range** whose size is a power of two.

The magic is in the binary representation of the index.

To compute prefix sum up to index `x`, you repeatedly subtract the lowest set bit.

To update index `x`, you repeatedly add the lowest set bit.

This gives O(log n) for both operations using a tiny amount of code.

![Fenwick Tree](/images/fenwick-tree.png)

## Operations & Complexity

| Operation              | Time     | Space |
|------------------------|----------|-------|
| Build (from array)     | O(n log n) or O(n) | O(n) |
| Point update           | O(log n) | O(n)  |
| Prefix sum             | O(log n) | O(n)  |
| Range sum [l, r]       | O(log n) | O(n)  |

## Complete Implementation (C#)

```csharp
public class FenwickTree {
    private long[] tree;
    private int n;

    public FenwickTree(int size) {
        n = size + 1;
        tree = new long[n];
    }

    public void Update(int idx, long delta) {
        idx++;
        while (idx < n) {
            tree[idx] += delta;
            idx += idx & -idx;
        }
    }

    public long PrefixSum(int idx) {
        idx++;
        long sum = 0;
        while (idx > 0) {
            sum += tree[idx];
            idx -= idx & -idx;
        }
        return sum;
    }

    public long RangeSum(int left, int right) {
        return PrefixSum(right) - PrefixSum(left - 1);
    }
}
```

## Complete Implementation (Go)

```go
type FenwickTree struct {
    tree []int64
    n    int
}

func NewFenwickTree(size int) *FenwickTree {
    return &FenwickTree{
        tree: make([]int64, size+1),
        n:    size + 1,
    }
}

func (ft *FenwickTree) Update(idx int, delta int64) {
    idx++
    for idx < ft.n {
        ft.tree[idx] += delta
        idx += idx & -idx
    }
}

func (ft *FenwickTree) PrefixSum(idx int) int64 {
    idx++
    var sum int64
    for idx > 0 {
        sum += ft.tree[idx]
        idx -= idx & -idx
    }
    return sum
}

func (ft *FenwickTree) RangeSum(left, right int) int64 {
    return ft.PrefixSum(right) - ft.PrefixSum(left-1)
}
```

### Canonical Problem: Count Inversions in an Array

**Problem Description:**

Given an array of integers, count the number of inversions: pairs (i, j) where i < j but arr[i] > arr[j].

Naive: O(n²). Fenwick Tree solves it in O(n log n) after coordinate compression.

**C#**

```csharp
public static long CountInversions(int[] arr) {
    var sorted = arr.Distinct().OrderBy(x => x).ToList();
    var rank = new Dictionary<int, int>();
    for (int i = 0; i < sorted.Count; i++) rank[sorted[i]] = i + 1;

    var ft = new FenwickTree(sorted.Count + 1);
    long inv = 0;
    for (int i = arr.Length - 1; i >= 0; i--) {
        int r = rank[arr[i]];
        inv += ft.PrefixSum(r - 1);
        ft.Update(r, 1);
    }
    return inv;
}
```

**Go**

```go
import "sort"

func CountInversions(arr []int) int64 {
    sorted := uniqueSorted(arr)
    rank := make(map[int]int, len(sorted))
    for i, v := range sorted {
        rank[v] = i + 1
    }

    ft := NewFenwickTree(len(sorted) + 1)
    var inv int64
    for i := len(arr) - 1; i >= 0; i-- {
        r := rank[arr[i]]
        inv += ft.PrefixSum(r - 1)
        ft.Update(r, 1)
    }
    return inv
}

func uniqueSorted(arr []int) []int {
    m := make(map[int]struct{})
    for _, v := range arr {
        m[v] = struct{}{}
    }
    sorted := make([]int, 0, len(m))
    for v := range m {
        sorted = append(sorted, v)
    }
    sort.Ints(sorted)
    return sorted
}
```

## Real World Uses

### 1. Competitive Programming

Fenwick trees are everywhere in CP for inversion count, range sum with updates, and order statistic problems.

### 2. Analytics & Time Series

When you have a stream of events at different times and want prefix counts or sums up to a certain time.

### 3. Order Statistic Trees

With coordinate compression + Fenwick, you can answer "how many numbers ≤ X have been inserted so far" efficiently.

### 4. Some Database Components

Certain counting and aggregation structures in column stores or OLAP engines use Fenwick or Fenwick-like structures.

## Fenwick vs Segment Tree

| Feature                  | Fenwick Tree       | Segment Tree          |
|--------------------------|--------------------|-----------------------|
| Code length              | Very short         | Longer                |
| Memory                   | Less               | More                  |
| Sum queries              | Excellent          | Excellent             |
| Min / Max / custom       | Hard               | Easy                  |
| Range updates (lazy)     | Possible with tricks | Natural               |
| Speed                    | Slightly faster    | Very fast             |

## Summary

Fenwick Tree = one of the most elegant data structures ever invented for prefix sums.

It shows how deep understanding of binary representation can lead to incredibly simple and fast code.

::: tip Project Lab
**Build it yourself:** [Time-Series Analytics](/projects/tier-3/12-time-series-analytics)
:::

**Next:** [22 - Merkle Tree](22-merkle-tree.md)