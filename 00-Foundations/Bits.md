---
type: Data Structure
tags:
  - dsa
---

# Bits
Type: Data Structure
Needs: [[Data Structure]]

## What it is
A bit is a cell that holds 0 or 1. A machine word is a fixed row of those cells. The invariant is that the width stays fixed: a bit that shifts past either end is gone.

## Details
- Real cost: test, set, and clear on one word are `O(1)`. A long bitset of `n` bits costs `O(n / word width)` to shift or to scan. The case that matters is the long bitset, not the single register.
- When it beats the previous structure: it beats an array of boolean cells for a small set of flags, because one word holds many flags and the machine updates them together.
- Failure mode: a signed word, where the high bit is a sign, so a shift copies the sign or walks into the next field.

## Uses
- Store a set of small integers as the positions of 1 bits.
- Pack several flags into one word.
- Build the masks that [[AND]], [[OR]], [[XOR]], and [[shifts]] then use.

## Pseudocode

```
test(word, i):
    if i is outside the width:
        stop
    return the bit at position i
```

## Operations
- test(i): `O(1)` on a word. Read bit `i` and change nothing.
- set(i) / clear(i): `O(1)` on a word. Change only bit `i`.
- shift(k): `O(1)` on a word, `O(n / word width)` on a long bitset.
- popcount: `O(1)` if the machine counts a word in one step, otherwise linear in the number of 1 bits or in the width.
