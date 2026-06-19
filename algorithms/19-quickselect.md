# 19 - Quickselect

## The Problem

Find the **k-th smallest** (or largest) element in an unordered array **without fully sorting**.

Example: Find the 5th smallest element in [3,2,1,5,6,4] → 4

## Why It Exists

Sorting is O(n log n). We can do better on average for selection: O(n) average, O(n²) worst (like quicksort).

## The Algorithm

Exactly like quicksort, but only recurse into the side that contains the k-th element.

After partitioning:
- If pivot index == k → done
- If k < pivot → recurse left
- Else recurse right

## Real World

- Finding median income, median house price, etc.
- "Top K" problems when you only need the boundary
- Order statistics in analytics
- Quickselect is used internally in many library functions for median, percentiles, etc.

## Variants

- Median of medians for guaranteed O(n) worst case (mostly theoretical)
- Introselect (hybrid) — what many standard libraries actually use

## Summary

Quickselect is the "I don't need the whole sorted list, just the k-th" algorithm.
