# 13 - Quicksort

## The Problem Quicksort Solves

Sort an array **in place** with excellent average-case performance. Quicksort is the classic divide-and-conquer sorter: partition around a pivot, then recursively sort left and right partitions.

### Canonical Problem: Sort a Large In-Memory Array Fast

You have millions of integers in RAM. Merge sort needs O(n) extra space. Quicksort sorts in place with O(log n) stack depth on average and often wins on cache locality.

## How It Works

1. Pick a **pivot** (last element, random, or median-of-three).
2. **Partition** so elements `< pivot` are left, `> pivot` are right.
3. Recursively sort `[left, pivot-1]` and `[pivot+1, right]`.

The combine step is free — partitioning already places the pivot correctly.

## Complexity

| Case | Time | Space |
|------|------|-------|
| Average | O(n log n) | O(log n) stack |
| Worst | O(n²) | O(n) stack |
| Best | O(n log n) | O(log n) |

Worst case happens on already-sorted input with naive last-element pivot. Use random pivot or 3-way partition for duplicates.

## Full Implementation

### C# (Lomuto partition)

```csharp
public static void QuickSort(int[] arr, int lo, int hi) {
    if (lo >= hi) return;
    int p = Partition(arr, lo, hi);
    QuickSort(arr, lo, p - 1);
    QuickSort(arr, p + 1, hi);
}

static int Partition(int[] arr, int lo, int hi) {
    int pivot = arr[hi];
    int i = lo;
    for (int j = lo; j < hi; j++) {
        if (arr[j] < pivot) {
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
func QuickSort(arr []int, lo, hi int) {
    if lo >= hi {
        return
    }
    p := partition(arr, lo, hi)
    QuickSort(arr, lo, p-1)
    QuickSort(arr, p+1, hi)
}

func partition(arr []int, lo, hi int) int {
    pivot := arr[hi]
    i := lo
    for j := lo; j < hi; j++ {
        if arr[j] < pivot {
            arr[i], arr[j] = arr[j], arr[i]
            i++
        }
    }
    arr[i], arr[hi] = arr[hi], arr[i]
    return i
}
```

### 3-Way Partition (Dutch National Flag) for many duplicates

When many equal elements exist, 3-way partition avoids O(n²) behavior:

```csharp
static void QuickSort3Way(int[] arr, int lo, int hi) {
    if (lo >= hi) return;
    int lt = lo, gt = hi, i = lo + 1;
    int pivot = arr[lo];
    while (i <= gt) {
        if (arr[i] < pivot) (arr[lt++], arr[i++]) = (arr[i++], arr[lt++]);
        else if (arr[i] > pivot) (arr[i], arr[gt--]) = (arr[gt--], arr[i]);
        else i++;
    }
    QuickSort3Way(arr, lo, lt - 1);
    QuickSort3Way(arr, gt + 1, hi);
}
```

## Real World

- Historical `qsort` in C standard library
- .NET `Array.Sort` uses **introsort** (quicksort + heapsort fallback + insertion sort for small ranges)
- Database in-memory sorts and external sort runs often use quicksort variants
- Still among the fastest practical in-memory sorters when implemented well

## Summary

Quicksort is the in-memory speed king with great cache behavior. Pair it with random pivot or 3-way partition for production robustness.

::: tip Project Lab
**Build it yourself:** [Sorting Benchmarker](/projects/tier-1/02-sorting-benchmarker)
:::

**Next:** [14 - Heapsort](14-heapsort.md)