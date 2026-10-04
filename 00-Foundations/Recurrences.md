---
type: Algorithm
tags:
  - dsa
---

# Recurrences
Type: Algorithm
Needs: [[Recursion]], [[Time vs. space (input size `n`)]]

## What it is
A recurrence writes a cost `T(n)` in terms of the cost on smaller inputs, plus the work done outside those calls. The invariant is that every branch names a smaller size, except the base.

## Details
- Real cost: the solution is a closed form or an asymptotic bound on time or on stack space. The case that matters is a branch that stays size `n`, which makes the equation describe a loop that does not end.
- When it beats the previous structure: it beats timing one run of a [[Recursion]], because the equation covers every `n`.
- Failure mode: a base case left out, so several closed forms fit the same split.

## Uses
- Write `T(n) = 2T(n/2) + Θ(n)` for a balanced split that scans the whole range. That `Θ(n)` is the term the master theorem's middle case requires.
- Write `T(n) = T(n - 1) + Θ(1)` for a chain of calls whose non-recursive work is a positive constant, and see the linear stack.
- Hand that tight equation to a tree argument or to the master theorem. An `O(n)` driving function is not yet case 2.

## Pseudocode

```
expand(T, n):
    if n is a base size:
        return the base cost
    if no branch is smaller than n:
        stop
    return the work at n plus the sum of T on each smaller size
```

## Input and stop
- Takes: `T` on smaller sizes, the work at this size, and a base.
- Returns: a closed form, or a bound in asymptotic notation.
- Illegal when: a branch does not shrink, or the base is missing.
