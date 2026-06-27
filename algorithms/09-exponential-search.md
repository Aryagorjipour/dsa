# 09 - Exponential Search

## The Problem That Shows Why Exponential Search Exists

**Problem: Search for a target in a sorted array whose size is unknown or infinite (unbounded array).**

You cannot use normal binary search because you don't know `high`.

Classic use cases:
- Searching in a very large sorted file where you don't want to read the whole size first.
- Finding the range in which a value lies before applying binary search.
- "Find the first position where f(x) becomes true" in an unbounded domain (e.g. find minimal x where a function exceeds a value).

### Concrete Problem Statement (Unbounded Sorted Array Search)

You are given a sorted array that conceptually goes on forever (or is very large). You are given a target. Find its index or return -1. You can access any index (assume it returns a very large number or special value for out of bound, or you have a way to check length lazily).

Naive linear = too slow.
Standard binary needs length.

**Exponential Search Solution:**
1. Find a range where the target might lie by exponentially increasing the bound: 1, 2, 4, 8, 16... until arr[bound] >= target or bound exceeds.
2. Once you have a bounded range [prev, current], run standard binary search inside it.

This is O(log i) where i is the index of the target — very efficient when target is not too far.

## Detailed Implementation

### C#

```csharp
public static int ExponentialSearch(int[] arr, int target) {
    if (arr.Length == 0) return -1;
    if (arr[0] == target) return 0;

    // Find range
    int i = 1;
    while (i < arr.Length && arr[i] <= target) {
        i *= 2;
    }

    // Binary search in [i/2, min(i, n-1)]
    return BinarySearchRange(arr, target, i / 2, Math.Min(i, arr.Length - 1));
}

private static int BinarySearchRange(int[] arr, int target, int left, int right) {
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
```

### Go

```go
func ExponentialSearch(arr []int, target int) int {
    if len(arr) == 0 {
        return -1
    }
    if arr[0] == target {
        return 0
    }

    i := 1
    for i < len(arr) && arr[i] <= target {
        i *= 2
    }

    return binarySearchRange(arr, target, i/2, min(i, len(arr)-1))
}

func binarySearchRange(arr []int, target, left, right int) int {
    for left <= right {
        mid := left + (right-left)/2
        if arr[mid] == target {
            return mid
        }
        if arr[mid] < target {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }
    return -1
}

func min(a, b int) int {
    if a < b {
        return a
    }
    return b
}
```

## Real World

- Unbounded binary search in competitive programming (find minimal x where condition holds)
- Database index probing when cardinality is unknown
- Some search in time-series data or log files

## Related to Two Crystal Balls

The exponential + binary idea is related to optimal jump strategies when you have limited "probes".

## Summary

Exponential search elegantly solves the "I don't know how big the search space is" problem by first exponentially expanding to find a bound, then binary searching inside.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

