---
type: Pattern
tags:
  - dsa
---

# Recursion
Type: Pattern
Needs: [[Algorithm]], [[Problem]]

## What it is
Recursion solves a [[Problem]] by solving the same kind of problem on a smaller input, then combining. The invariant is that every call receives a strictly smaller input, and a base case makes no further call.

## Details
- Real cost: time follows the size of the call tree. Extra space includes the call stack, whose depth is the longest chain of calls. The case that matters is a chain of `n` calls, which uses `O(n)` stack even when the work looks tail-shaped.
- When it beats the previous structure: it beats writing the nested cases out by hand once the smaller piece is the same problem.
- Failure mode: a call that does not shrink, or a missing base case, so the stack grows with no stop.

## Uses
- Walk a tree by solving the left subtree and the right subtree.
- Split a range, as in mergesort, and trust the smaller ranges.
- Name the stack you are using before you claim an algorithm is in-place.

## Pseudocode

```
solve(input):
    if input is a base case:
        return the base answer
    smaller = a strictly smaller input of the same kind
    return combine(solve(smaller))
```

## Shape
- Recognize: the answer is the same kind of answer on a smaller piece.
- Move: write the base case first, then one call on the smaller piece.
