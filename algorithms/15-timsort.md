# 15 - Timsort

## What It Is

Timsort is a **hybrid** sorting algorithm derived from merge sort and insertion sort.

It was designed specifically to perform well on **real-world data** that is often partially sorted.

## Key Ideas

- Find natural "runs" (already sorted sequences) in the data
- Use insertion sort for small runs
- Merge the runs using a sophisticated merge strategy (inspired by merge sort)
- Use galloping mode when one run is much smaller than the other

## Real World Dominance

- Python's `list.sort()` (since 2002)
- Java's `Arrays.sort()` for objects (since Java 7)
- Android, V8 (Node.js), and many other runtimes

It is stable and has excellent performance on the kind of data humans and programs actually produce.

## Summary

Timsort proves that the "best" sorting algorithm is often the one that exploits patterns in real data rather than the theoretical pure one.
