# 12 - Merge Sort

## The Problem Merge Sort Solves

You need a **stable**, **guaranteed O(n log n)** sorting algorithm that performs well even in worst case and works great for linked structures and external sorting (data too big for memory).

## How Merge Sort Works

Classic divide and conquer:

1. Divide the array into two halves
2. Recursively sort each half
3. Merge the two sorted halves into one sorted array

The merge step is the key — it can merge two sorted arrays in linear time.

## Implementation (C#)

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

    for (int p = 0; p < temp.Length; p++) {
        arr[left + p] = temp[p];
    }
}
```

## Go Version (similar structure)

## Real World

- Used in many database sort operations (especially when data doesn't fit in memory — external merge sort)
- Python's `list.sort` is Timsort (hybrid), but merge sort ideas are core
- Many stable sort requirements in financial systems, UI sorting, etc.
- Git merge operations have conceptual similarity

## Properties

- **Stable**: Equal elements keep original order
- **O(n log n)** worst, average, best
- **O(n)** extra space (can be optimized but usually not in-place)

## Summary

Merge sort is the reliable, predictable, stable workhorse of sorting algorithms.

It is often the answer when you need "I don't care about constants, just give me guaranteed good behavior and stability."

We will see Quicksort next for contrast.
