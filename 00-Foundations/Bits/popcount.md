---
type: Algorithm
tags:
  - dsa
---

# popcount
Type: Algorithm
Needs: [[Bits]], [[set, clear, test]]

## What it is
Popcount is the number of 1 bits in a word. The invariant is that the result counts those 1s and is not the numeric value of the word.

## Details
- Real cost: a machine that has a population-count step does one word in `O(1)`. Clearing the lowest 1 bit until the word is 0 takes time proportional to the number of 1 bits, not to the width. Scanning every position is proportional to the width. The case that matters is a dense word if you chose the "clear lowest 1" loop, and a sparse word if you scan the whole width.
- When it beats the previous structure: it beats calling [[set, clear, test|test]] once per position when the only question is "how many flags are on."
- Failure mode: stopping at the sign bit, or counting the integer value instead of the 1s.

## Uses
- Measure the size of a small set stored as bits.
- Compute the Hamming distance as the popcount of an XOR.
- Take the parity of a word as the popcount modulo 2.

## Pseudocode

```
popcount(word):
    count = 0
    while word is not 0:
        clear the lowest 1 bit in word
        count = count + 1
    return count
```

## Input and stop
- Takes: one word, read as an unsigned row of bits.
- Returns: the integer count of 1 bits.
- Illegal when: the word is interpreted as signed and the high bit is skipped, or the caller wanted the numeric value.
