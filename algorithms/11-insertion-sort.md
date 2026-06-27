# 11 - Insertion Sort

## The Problem Insertion Sort Solves

**Problem: Sort a small list or a list that is already mostly sorted (nearly sorted data).**

Insertion sort builds the final sorted array one item at a time. It is much like the way many people sort playing cards in their hands.

For each element, it finds the correct position in the already-sorted prefix and inserts it there (by shifting).

## Why It Exists / Classic Problem

You are sorting a stream of incoming numbers that arrive almost in order (e.g., log timestamps that are mostly increasing, with occasional out-of-order entries due to network delay). Insertion sort is very efficient on such data — O(n) in best case.

It is also excellent for very small arrays (hybrid sorts like Timsort use insertion sort for tiny runs).

## Full Implementation

### C#

```csharp
public static void InsertionSort(int[] arr) {
    for (int i = 1; i < arr.Length; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}
```

### Go

```go
func InsertionSort(arr []int) {
    for i := 1; i < len(arr); i++ {
        key := arr[i]
        j := i - 1
        for j >= 0 && arr[j] > key {
            arr[j+1] = arr[j]
            j--
        }
        arr[j+1] = key
    }
}
```

## Complexity

- Best: O(n) — already sorted
- Average/Worst: O(n²)
- Space: O(1)
- **Stable** and **in-place**
- Excellent cache performance on small data

## Real World

- Used inside Timsort, Introsort, and other hybrids for small subarrays (< ~64 elements)
- Sorting small lists in UI (e.g. few items in a dropdown)
- Online sorting (sorting as data arrives)
- Teaching example for "build sorted prefix"

## Comparison to Other Simple Sorts

- Better than bubble on average for nearly sorted data
- Worse than quick/merge/heap for large random data

## Problems That Demonstrate It

- Sort a nearly sorted array efficiently
- Online median or insertion into sorted list
- Hybrid sort implementation

Insertion sort is the practical "small or almost sorted" champion among O(n²) algorithms.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

