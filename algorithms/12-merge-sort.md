# 12 - Merge Sort

## The Problem Merge Sort Solves

You need a **stable**, **guaranteed O(n log n)** sorting algorithm that performs well even in worst case and works great for linked structures and external sorting (data too big for memory).

## How Merge Sort Works

Classic divide and conquer:

1. Divide the array into two halves
2. Recursively sort each half
3. Merge the two sorted halves into one sorted array

The merge step is the key — it can merge two sorted arrays in linear time.

## Complexity

| Case | Time | Space | Stable |
|------|------|-------|--------|
| All | O(n log n) | O(n) | Yes |

## Full Implementation

### C#

```csharp
public static void MergeSort(int[] arr, int left, int right) {
    if (left >= right) return;
    int mid = left + (right - left) / 2;
    MergeSort(arr, left, mid);
    MergeSort(arr, mid + 1, right);
    Merge(arr, left, mid, right);
}

private static void Merge(int[] arr, int left, int mid, int right) {
    int[] temp = new int[right - left + 1];
    int i = left, j = mid + 1, k = 0;
    while (i <= mid && j <= right) {
        if (arr[i] <= arr[j]) temp[k++] = arr[i++];
        else temp[k++] = arr[j++];
    }
    while (i <= mid) temp[k++] = arr[i++];
    while (j <= right) temp[k++] = arr[j++];
    for (int p = 0; p < temp.Length; p++) arr[left + p] = temp[p];
}
```

### Go

```go
func MergeSort(arr []int) []int {
    if len(arr) <= 1 {
        return arr
    }
    mid := len(arr) / 2
    left := MergeSort(arr[:mid])
    right := MergeSort(arr[mid:])
    return merge(left, right)
}

func merge(a, b []int) []int {
    out := make([]int, 0, len(a)+len(b))
    i, j := 0, 0
    for i < len(a) && j < len(b) {
        if a[i] <= b[j] {
            out = append(out, a[i])
            i++
        } else {
            out = append(out, b[j])
            j++
        }
    }
    out = append(out, a[i:]...)
    out = append(out, b[j:]...)
    return out
}
```

## Real World

- External merge sort when data does not fit in RAM (databases, big data pipelines)
- Stable sort requirements in financial systems and UI lists
- Core idea inside **Timsort** (Python, Java object sorts)
- Git merge has conceptual similarity (combine ordered histories)

## Summary

Merge sort is the reliable, predictable, stable workhorse. Choose it when stability and worst-case guarantees matter more than in-place memory use.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Sorting Benchmarker](/projects/tier-1/02-sorting-benchmarker)
:::

**Next:** [13 - Quicksort](13-quicksort.md)