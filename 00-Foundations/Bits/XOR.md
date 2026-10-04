---
type: Algorithm
tags:
  - dsa
---

# XOR
Type: Algorithm
Needs: [[Bits]]

## What it is
XOR writes 1 in a position when the two inputs differ there. The invariant is that XOR with the same word twice returns the original, and XOR with all zeros changes nothing.

## Details
- Real cost: `O(1)` time and no extra space on one word. On `n` bits, `O(n / word width)`. The case that matters is a second XOR that uses a different word than the first, so the "undo" does not restore the original.
- When it beats the previous structure: it beats borrowing a temporary cell to toggle a flag or to exchange two words.
- Failure mode: reading XOR as OR, or as subtraction. Differing bits become 1. There is no borrow.

## Uses
- Toggle one flag and toggle it back with the same mask.
- Exchange two words by three XORs when a temporary cell is the thing you are avoiding.
- Find which bits differ between two words, including a parity check.

## Pseudocode

```
bit_xor(a, b):
    if the widths differ:
        stop
    for each position i:
        result[i] = 1 only when a[i] differs from b[i]
    return result
```

## Input and stop
- Takes: two words, or two bitsets, of the same width.
- Returns: a value with 1s exactly where the inputs differ.
- Illegal when: the widths differ, or you needed OR or addition and reached for XOR because the symbol looks similar.
