# 06 - Linear Search

## What is Linear Search?

Linear Search (also called Sequential Search) is the simplest searching algorithm. It sequentially checks each element of the list until a match is found or the whole list has been searched.

## The Problem That Shows Why Linear Search Exists

**Problem: Find the position of a specific colored stone in a row of boxes.**

You are given a row of boxes, each containing one colored stone. The colors are not sorted in any particular order. You are told a specific color (e.g., "red stone") and need to find which box contains it (return the index), or determine it doesn't exist.

Real-life version: Searching for your keys in a messy drawer by checking item by item. Or looking for a specific log entry in an unsorted log file.

This is the fundamental "I have no order, I must scan everything" problem.

Linear search is the baseline. All other search algorithms try to do better than this O(n) by exploiting structure (sorted order, hashing, trees, etc.).

## Detailed Implementation

### C#

```csharp
public static int LinearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.Length; i++) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1;
}

// Variant: Find first occurrence in case of duplicates
public static int LinearSearchFirst(int[] arr, int target) {
    for (int i = 0; i < arr.Length; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}
```

### Go

```go
func LinearSearch(arr []int, target int) int {
    for i, v := range arr {
        if v == target {
            return i
        }
    }
    return -1
}
```

## Complexity

- Time: O(n) worst and average, O(1) best case
- Space: O(1)

## When to Use Linear Search

- Unsorted data
- Very small arrays (overhead of better algos not worth it)
- You only need to find if something exists once and rarely repeat searches
- As a fallback

## Real World

- Small configuration lookups
- Scanning log files for a specific error without index
- Checking if a value exists in a small in-memory list before using a set
- First pass in many algorithms before building better structures

## Variants & Problems

- Find all occurrences
- Search in linked list (no random access)
- Sentinel linear search (optimization to avoid bounds check)

This is the starting point. Everything else improves on it when possible.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Search Library](/projects/tier-1/01-search-library)
:::

