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
- Write `T(n) = 2T(n/2) + O(n)` for a balanced split that also scans the range.
- Write `T(n) = T(n - 1) + O(1)` for a chain of calls, and see the linear stack of work.
- Hand the equation to a tree argument or to the master theorem instead of expanding it by hand.

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
