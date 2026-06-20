# 19 - Quickselect

## The Problem

Find the **k-th smallest** element without fully sorting the array.

### Canonical Problem: Median of a Stream Chunk

You have 10 million numbers and need the median (k = n/2). Full sort is O(n log n). Quickselect averages O(n).

## How It Works

Like quicksort partition, but recurse only into the side containing index k:

1. Partition around pivot.
2. If pivot index == k, done.
3. Else recurse left or right only.

## Complexity

| Case | Time | Space |
|------|------|-------|
| Average | O(n) | O(1) |
| Worst | O(n²) | O(1) |

Use random pivot or introselect for worst-case guarantees.

## Full Implementation

### C#

```csharp
public static int QuickSelect(int[] arr, int k) {
    int lo = 0, hi = arr.Length - 1;
    while (lo <= hi) {
        int p = Partition(arr, lo, hi);
        if (p == k) return arr[p];
        if (k < p) hi = p - 1;
        else lo = p + 1;
    }
    return -1;
}

static int Partition(int[] arr, int lo, int hi) {
    int pivot = arr[hi], i = lo;
    for (int j = lo; j < hi; j++) {
        if (arr[j] <= pivot) {
            (arr[i], arr[j]) = (arr[j], arr[i]);
            i++;
        }
    }
    (arr[i], arr[hi]) = (arr[hi], arr[i]);
    return i;
}
```

### Go

```go
func QuickSelect(arr []int, k int) int {
    lo, hi := 0, len(arr)-1
    for lo <= hi {
        p := partitionSelect(arr, lo, hi)
        if p == k {
            return arr[p]
        }
        if k < p {
            hi = p - 1
        } else {
            lo = p + 1
        }
    }
    return -1
}
```

## Real World

- Order statistics (median, percentiles)
- `std::nth_element` in C++
- Database query optimizers picking split points

## Summary

Quickselect is quicksort's sibling — partition once per level, recurse one side, find k-th in linear average time.

**Next:** [20 - Reservoir Sampling](20-reservoir-sampling.md)