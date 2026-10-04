---
type: Algorithm
tags:
  - dsa
---

# set, clear, test
Type: Algorithm
Needs: [[Bits]], [[OR]], [[AND]], [[shifts]]

## What it is
Set turns bit `i` on, clear turns bit `i` off, and test reads bit `i` without writing. The invariant is that set and clear change no position except `i`, and test changes nothing.

## Details
- Real cost: `O(1)` time and no extra space on a word, using a one-bit mask shifted into place. The case that matters is an `i` outside the width, where the mask is no longer a single bit in this word.
- When it beats the previous structure: it beats rewriting the whole word from a boolean array when only one flag changes.
- Failure mode: the mask is shifted the wrong way, so a neighboring flag flips and the intended flag stays.

## Uses
- Turn on feature flag `i` and leave the other flags.
- Turn off flag `i` before reusing the word.
- Ask whether flag `i` is on before taking a branch.

## Pseudocode

```
set(word, i):
    if i is outside the width:
        stop
    return word OR a 1 shifted to position i

clear(word, i):
    if i is outside the width:
        stop
    return word AND the complement of a 1 shifted to position i

test(word, i):
    if i is outside the width:
        stop
    return whether (word AND a 1 shifted to position i) is nonzero
```

## Input and stop
- Takes: a word and an index `i` inside its width.
- Returns: the updated word from set and clear, or a yes-or-no from test.
- Illegal when: `i` is outside the width, or test is written so that it stores the masked word back.
