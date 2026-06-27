# 07 - Binary Search

## The Problem That Shows Why Binary Search Exists

### The Two Crystal Balls Problem (Classic)

You have a 100-story building.

You have **exactly two identical crystal balls**.

You need to find the **lowest floor** F such that dropping a ball from floor F or higher will break it.

- From floors below F, the ball survives.
- From F and above, it breaks.
- You can reuse a surviving ball.
- A broken ball is gone.
- Minimize the **worst-case** number of drops.

If you only had **one** ball, you would start at floor 1 and go up one by one. Worst case = 100 drops.

With two balls, you can do much better.

### Algorithmic Thinking Applied

This is not a pure binary search problem because you have limited "lives" (only 2 balls).

If you do naive binary search and the first ball breaks at floor 50, you are forced to check floors 1-49 linearly with the second ball. That can be up to 50 drops — bad worst case.

The optimal strategy is to make **decreasing size jumps** with the first ball.

The math: With 2 balls and at most `x` drops in the worst case, the maximum floors you can cover is:

`x + (x-1) + (x-2) + ... + 1 = x(x+1)/2`

Solve for x such that `x(x+1)/2 >= 100` → x ≈ 14.

You drop the first ball from floors that allow at most 14 drops in the worst case:
Floors roughly: 14, 27, 39, 50, 60, 69, 77, 84, 90, 95, 99, 100

When the first ball breaks between two drops, you use the second ball to linearly search the interval.

**Worst case: 14 drops.**

This problem beautifully teaches:
- Binary search is about halving, but the **cost model** matters.
- Different constraints require different strategies.
- Always think about **worst case**.

We will implement both classic binary search and a version of this problem.

## Classic Binary Search

![Binary Search Steps](/images/binary-search-steps.png)

Assuming a sorted array, find the index of `target`, or -1.

### C# Implementation (Careful With Overflows)

```csharp
int BinarySearch(int[] arr, int target) {
    int left = 0;
    int right = arr.Length - 1;

    while (left <= right) {
        // Safe mid calculation
        int mid = left + (right - left) / 2;

        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
```

### Go Implementation

```go
func BinarySearch(arr []int, target int) int {
    left, right := 0, len(arr)-1
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
```

## Complexity

| Variant | Time | Space |
|---------|------|-------|
| Classic binary search | O(log n) | O(1) |
| Two Crystal Balls | O(√n) worst-case drops | O(1) |

## Key Variants

1. **First occurrence** of target in sorted array with duplicates
2. **Last occurrence**
3. **Lower bound** (first position >= target)
4. **Upper bound**
5. Search in rotated sorted array
6. Find minimum in rotated sorted array
7. Peak element
8. Search in 2D matrix (treat as sorted 1D)

All of these are extremely common in real systems and interviews.

## Real World Use of Binary Search

- Every database index lookup (B+ tree internal binary search on keys)
- Git bisect
- Package managers finding compatible version ranges
- Font rendering, layout engines (binary search on line breaks)
- Almost every "guess the number" or "find the boundary" problem

## Full Two Crystal Balls Implementation

```go
func FindBreakingFloor(floors int) int {
    // Compute optimal first jump size
    jump := 0
    for jump*(jump+1)/2 < floors {
        jump++
    }

    prev := 0
    for current := jump; current < floors; current += jump-1 {
        // Simulate drop with first ball
        // In real code, this would be an actual drop function
        broke := Drop(current) // assume this exists
        if broke {
            // Linear search with second ball in [prev+1, current]
            for i := prev + 1; i <= current; i++ {
                if Drop(i) {
                    return i
                }
            }
            return current // if exactly at current
        }
        prev = current
        jump--
    }
    // Check remaining
    for i := prev + 1; i < floors; i++ {
        if Drop(i) {
            return i
        }
    }
    return floors // never breaks
}
```

(The C# version is analogous.)

This is the mindset shift binary search teaches.

## Summary

Binary search is not just "search in sorted array".

It is a **mindset** of "I can discard half the search space every time" and carefully managing the cost of mistakes (the crystal balls).

It appears in almost every system that needs to find boundaries or perform fast lookups in sorted data.


::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Search Library](/projects/tier-1/01-search-library) — binary, exponential, and interpolation search with benchmarks.
:::

**Next:** We will implement many of the variants and related algorithms (exponential search, etc.).
