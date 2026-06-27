# 15 - Timsort

## The Problem Timsort Solves

Real-world data is often **partially sorted**. Pure merge sort or quicksort ignore existing order. Timsort exploits **natural runs** (already sorted subsequences) and merges them efficiently.

## How It Works

1. Identify **runs** (ascending or strictly descending reversed to ascending).
2. Sort small runs with **insertion sort** (threshold ~32–64).
3. **Merge** runs using a stack and galloping mode when one run is much smaller.

## Complexity

| Case | Time | Space | Stable |
|------|------|-------|--------|
| Best (sorted) | O(n) | O(n) | Yes |
| Average | O(n log n) | O(n) | Yes |
| Worst | O(n log n) | O(n) | Yes |

## Educational Implementation (simplified)

### C#

```csharp
public static void TimSort(int[] arr) {
    const int minRun = 32;
    int n = arr.Length;
    for (int i = 0; i < n; i += minRun) {
        int end = Math.Min(i + minRun - 1, n - 1);
        InsertionSort(arr, i, end);
    }
    for (int size = minRun; size < n; size *= 2) {
        for (int left = 0; left < n; left += 2 * size) {
            int mid = Math.Min(left + size - 1, n - 1);
            int right = Math.Min(left + 2 * size - 1, n - 1);
            if (mid < right) Merge(arr, left, mid, right);
        }
    }
}

static void InsertionSort(int[] arr, int lo, int hi) {
    for (int i = lo + 1; i <= hi; i++) {
        int key = arr[i], j = i - 1;
        while (j >= lo && arr[j] > key) { arr[j + 1] = arr[j]; j--; }
        arr[j + 1] = key;
    }
}

static void Merge(int[] arr, int l, int m, int r) {
    int[] left = arr[l..(m + 1)];
    int[] right = arr[(m + 1)..(r + 1)];
    int i = 0, j = 0, k = l;
    while (i < left.Length && j < right.Length)
        arr[k++] = left[i] <= right[j] ? left[i++] : right[j++];
    while (i < left.Length) arr[k++] = left[i++];
    while (j < right.Length) arr[k++] = right[j++];
}
```

### Go

```go
func TimSort(arr []int) {
    const minRun = 32
    n := len(arr)
    for i := 0; i < n; i += minRun {
        end := min(i+minRun-1, n-1)
        insertionSort(arr, i, end)
    }
    for size := minRun; size < n; size *= 2 {
        for left := 0; left < n; left += 2 * size {
            mid := min(left+size-1, n-1)
            right := min(left+2*size-1, n-1)
            if mid < right {
                mergeInPlace(arr, left, mid, right)
            }
        }
    }
}
```

Production Timsort adds run detection, merge stack invariants, and galloping — see CPython and OpenJDK sources.

## Real World Dominance

- **Python** `list.sort()` and `sorted()` (since 2002)
- **Java** `Arrays.sort()` for objects (since Java 7)
- **Android**, **V8** (Node.js), and many other runtimes

## Summary

Timsort proves the best sorter often exploits patterns in real data rather than theoretical purity alone.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

**Next:** [16 - Counting Sort](16-counting-sort.md)