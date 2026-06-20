# 16 - Counting Sort

## The Problem

Sort integers in a **small known range** faster than comparison-based O(n log n).

### Canonical Problem: Sort Ages 0–150

Given 1 million ages (0–150), sort them. Comparison sorts need ~20M comparisons. Counting sort needs one pass to count + one pass to place.

## How It Works

1. Count occurrences of each value in `count[value]`.
2. Prefix-sum `count` to get positions (or output directly in stable variant).
3. Place elements into output array.

## Complexity

| Case | Time | Space |
|------|------|-------|
| All | O(n + k) | O(k) |

k = range of values. Only works when k is reasonable.

## Full Implementation

### C#

```csharp
public static int[] CountingSort(int[] arr, int maxVal) {
    int[] count = new int[maxVal + 1];
    foreach (int x in arr) count[x]++;
    int idx = 0;
    for (int v = 0; v <= maxVal; v++)
        for (int c = 0; c < count[v]; c++)
            arr[idx++] = v;
    return arr;
}
```

### Go

```go
func CountingSort(arr []int, maxVal int) []int {
    count := make([]int, maxVal+1)
    for _, x := range arr {
        count[x]++
    }
    out := make([]int, 0, len(arr))
    for v := 0; v <= maxVal; v++ {
        for c := 0; c < count[v]; c++ {
            out = append(out, v)
        }
    }
    return out
}
```

## Real World

- Sorting small integer keys (ages, grades, byte values)
- Radix sort building block
- Histogram-based bucketing in analytics

## Summary

Counting sort beats comparison sorts when the value range is small — O(n + k) with no comparisons.

**Next:** [17 - Radix Sort](17-radix-sort.md)