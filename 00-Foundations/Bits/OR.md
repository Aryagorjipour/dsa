---
type: Algorithm
tags:
  - dsa
---

# OR
Type: Algorithm
Needs: [[Bits]]

## What it is
OR writes 1 in a position when either input has 1 there. The invariant is that every 1 in either input survives in the result.

## Details
- Real cost: `O(1)` time and no extra space on one word. On `n` bits, `O(n / word width)`. The case that matters is a position you meant to leave 0 that was already 1 in the other word.
- When it beats the previous structure: it beats a read-modify that sets flags one by one and can drop a 1 it failed to copy.
- Failure mode: using OR as addition. There is no carry. `1 OR 1` is 1, not 0 with a carry.

## Uses
- Turn a set of flags on without clearing the flags already on.
- Union two sets stored as bits.
- Build a mask by combining single-bit masks.

## Pseudocode

```
bit_or(a, b):
    if the widths differ:
        stop
    for each position i:
        result[i] = 1 when a[i] or b[i] is 1
    return result
```

## Input and stop
- Takes: two words, or two bitsets, of the same width.
- Returns: a value of that width with every 1 from either side.
- Illegal when: the widths differ and the extra positions have no defined value.
