---
type: Algorithm
tags:
  - dsa
---

# AND
Type: Algorithm
Needs: [[Bits]]

## What it is
AND writes 1 in a position only when both inputs have 1 there. The invariant is that every 0 in either input is 0 in the result.

## Details
- Real cost: `O(1)` time and no extra space on one word. On a bitset of `n` bits the cost is `O(n / word width)`. The case that matters is a mask whose width does not match the word you apply it to.
- When it beats the previous structure: it beats testing each flag with its own branch, because one AND keeps a whole field and clears the rest.
- Failure mode: AND used as a filter when you meant to turn bits on. A 0 in the mask wipes that position.

## Uses
- Keep a field and clear every bit outside it.
- Test whether a flag is on by masking that single position.
- Intersect two sets that are stored as bits.

## Pseudocode

```
bit_and(a, b):
    if the widths differ:
        stop
    for each position i:
        result[i] = 1 only when a[i] and b[i] are both 1
    return result
```

## Input and stop
- Takes: two words, or two bitsets, of the same width.
- Returns: a value of that width with the shared 1 bits.
- Illegal when: the widths differ and you have not said which extra bits are dropped.
