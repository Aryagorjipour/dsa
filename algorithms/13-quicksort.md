# 13 - Quicksort

## The Idea

Pick a **pivot**, partition the array so that elements less than pivot are on left, greater are on right, then recursively sort the partitions.

The "combine" step is free because partitioning already puts elements in the right place.

## Famous for Average Case

Average: O(n log n)
Worst: O(n²) — but with good pivot selection (random or median-of-three), worst case is extremely rare in practice.

## Real World

- The default sort in many C libraries historically (`qsort`)
- .NET `Array.Sort` for primitives uses a highly optimized quicksort variant (introsort hybrid actually)
- Many database engines use quicksort for in-memory sorting
- Still one of the fastest in practice for in-memory sorts when implemented well

## Important Implementation Details

- Hoare vs Lomuto partition schemes
- Handling duplicates well (3-way partition Dutch National Flag style is excellent)
- Random pivot or median-of-medians for worst-case protection

## Why It Often Beats Merge Sort in Practice

- Better cache locality (in-place)
- Less memory movement
- Excellent average constants

## Famous Problem It Enables

Quickselect (next major algorithm) — finding the k-th smallest element in linear time on average.

## Summary

Quicksort is the "fast in practice, divide and conquer, partition-based" king of sorting for in-memory data.
