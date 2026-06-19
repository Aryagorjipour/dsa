# 10 - Bubble Sort

## The Problem Bubble Sort Solves (and Why It Still Exists)

**Problem: Sort a small or nearly sorted list of items where simplicity matters more than raw speed.**

Bubble sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. Each pass "bubbles" the largest (or smallest) element to its correct position.

### Classic Motivating Example

You have a list of 20 recent stock prices that is almost sorted because only a few new prices came in out of order. You want a dead-simple sort that is easy to implement and verify, and the O(n²) cost is acceptable because n is tiny.

In teaching, it is the first sorting algorithm because the logic is intuitive: "larger items sink to the bottom like bubbles".

## Detailed Implementation (Optimized with early exit)

### C#

```csharp
public static void BubbleSort(int[] arr) {
    int n = arr.Length;
    bool swapped;
    for (int i = 0; i < n - 1; i++) {
        swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                (arr[j], arr[j + 1]) = (arr[j + 1], arr[j]);
                swapped = true;
            }
        }
        if (!swapped) break; // already sorted
    }
}
```

### Go

```go
func BubbleSort(arr []int) {
    n := len(arr)
    for i := 0; i < n-1; i++ {
        swapped := false
        for j := 0; j < n-i-1; j++ {
            if arr[j] > arr[j+1] {
                arr[j], arr[j+1] = arr[j+1], arr[j]
                swapped = true
            }
        }
        if !swapped {
            break
        }
    }
}
```

## Complexity

- Best: O(n) with early exit (nearly sorted)
- Average/Worst: O(n²)
- Space: O(1)

## Real World (Limited but Real)

- Educational tool
- Very small datasets
- Situations where code size and readability trump performance (embedded with tiny n)
- Sometimes used in graphics for very small lists or as a building block

## Why Learn It?

It introduces the concept of **in-place** sorting, **adjacent comparisons**, and **optimization via early termination**.

Most modern systems use better sorts, but understanding bubble sort helps understand why we moved to insertion, selection, then divide-and-conquer.

## Problems

- Sort an array using only adjacent swaps (natural for bubble)
- Implement cocktail shaker sort (bidirectional bubble)

Bubble sort is the "hello world" of sorting algorithms.
