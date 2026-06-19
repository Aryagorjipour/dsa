# 17 - Radix Sort

## The Idea

Sort numbers by processing them digit by digit (from least or most significant).

Each digit position is sorted using a stable subroutine sort (usually counting sort).

## Complexity

O(d * (n + b)) where d = number of digits, b = base.

Can be faster than O(n log n) comparison sorts when d is small.

## Real World

- Sorting large arrays of integers or strings in some databases and systems
- Old mainframe sort utilities
- Some suffix array construction algorithms
- IP address and string sorting at scale

## LSD vs MSD

- LSD (Least Significant Digit) — easier, stable
- MSD (Most Significant Digit) — can be more cache friendly for strings

## Summary

Radix sort is the "I can sort faster than comparison-based if I exploit the structure of the keys" algorithm.
