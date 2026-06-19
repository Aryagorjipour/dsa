# 16 - Counting Sort

## The Idea

When the range of values is small (or can be mapped to small), count frequencies instead of comparing.

Then reconstruct the sorted output.

Linear time when range is reasonable.

## When It Wins

- Integers in small range (e.g. 0 to 10^5 or 10^6)
- As a subroutine inside Radix Sort
- When stability is required

## Real World

- Sorting small integer keys in databases and analytics
- Histogram computation
- Coordinate compression prep
- Some graphics and image processing (pixel value sorting)

## Limitation

O(range) space. If range is huge, it fails.

## Summary

Counting sort shows that comparison is not always necessary for sorting.
