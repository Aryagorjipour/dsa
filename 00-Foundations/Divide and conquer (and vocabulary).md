---
type: Paradigm
tags:
  - dsa
---

# Divide and conquer (and vocabulary)
Type: Paradigm
Needs: [[Recursion]], [[Recurrences]]

## What it is
Divide and conquer splits the input, conquers each piece by the same method, and combines the answers. The invariant is that each conquered piece is an independent smaller problem of the same kind.

## Details
- Real cost: the [[Recurrences|recurrence]] is the number of pieces times `T` on the piece size, plus the split and the combine. The case that matters is a combine that scans the whole input again and hides a worse term inside `f(n)`.
- When it beats the previous structure: it beats solving the whole input in one lump once the pieces do not need each other's unfinished work.
- Failure mode: pieces that share a writable region, so the "independent" solves overwrite each other.

## Uses
- Sort by splitting the range, sorting both sides, and merging.
- Count inversions while merging, instead of checking every pair.
- Find a peak or a binary-search answer by throwing away one side.

## Pseudocode

```
solve(input):
    if input is small enough:
        return the direct answer
    pieces = split(input)
    answers = solve each piece
    return combine(answers)
```

## Loop
- Set up: split, conquer each piece, combine. The vocabulary is those three words and nothing else.
- Refuse: a combine that quietly re-solves the original input.
