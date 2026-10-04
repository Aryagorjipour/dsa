---
type: Algorithm
tags:
  - dsa
---

# shifts
Type: Algorithm
Needs: [[Bits]]

## What it is
A shift moves every bit `k` places toward one end. The vacant end is filled. The invariant is that `k` bits leave the other end and do not come back.

## Details
- Real cost: `O(1)` on one word when `k` is within the width. A long bitset costs `O(n / word width)` because the bits cross word boundaries. The case that matters is `k` greater than or equal to the width, which is not a multiply and is not always defined.
- When it beats the previous structure: a left shift beats a general multiply when the factor is `2^k` and the product still fits in the width.
- Failure mode: an arithmetic right shift, which copies the sign bit, used where a logical right shift should fill with 0.

## Uses
- Multiply or divide an unsigned value by a power of two while the result fits.
- Slide a 1 into position `i` to build a mask.
- Align a field to the low end before reading it.

## Pseudocode

```
shift_left(word, k):
    if k < 0 or k >= width:
        stop
    move every bit k places toward the high end
    fill the low end with 0
    return word
```

## Input and stop
- Takes: a word and a distance `k`, plus whether the shift is left, logical right, or arithmetic right.
- Returns: the moved word. Left and logical right fill with 0. Arithmetic right fills with the old sign bit.
- Illegal when: `k` is outside `0` to `width - 1`, or the sign-filling shift is used on a value you are treating as unsigned.
