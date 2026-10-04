---
type: Algorithm
tags:
  - dsa
---

# Master theorem
Type: Algorithm
Needs: [[Recurrences]], [[recursion trees]]

## What it is
The master theorem solves `T(n) = a T(n/b) + f(n)` by comparing `f(n)` with `n` to the power `log_b(a)`. The invariant is that the input splits into `a` pieces of equal size `n/b`, plus `f(n)` work at this level.

## Details
- Real cost: if `f` is polynomially smaller than `n^{log_b(a)}`, the leaves dominate and `T` is `Θ(n^{log_b(a)})`. If `f` is `Θ` of that same function, every level matches and `T` is `Θ(n^{log_b(a)} log n)`. If `f` is polynomially larger and the regularity condition holds (`a f(n/b) ≤ k f(n)` for some `k < 1`), the root dominates and `T` is `Θ(f(n))`. The case that matters is equal subproblem sizes.
- When it beats the previous structure: it beats drawing a [[recursion trees|recursion tree]] once the split is equal and you only need the case.
- Failure mode: unequal piece sizes, or case 3 claimed without the regularity check. Some `f` sit in a gap the plain theorem does not cover.

## Uses
- Read mergesort as `a = 2`, `b = 2`, `f(n) = O(n)`, and get `Θ(n log n)` from the middle case.
- Read a binary tree recursion that does `O(1)` at the node and get a linear bound from the leaf case.
- Reject the theorem for a split into `n/3` and `2n/3`. Draw the tree instead.

## Pseudocode

```
master(a, b, f):
    if a < 1 or b <= 1:
        stop
    critical = n to the power log_b(a)
    if f is polynomially smaller than critical:
        return Θ(critical)
    if f is Θ(critical):
        return Θ(critical * log n)
    if f is polynomially larger than critical and a * f(n/b) <= k * f(n) for some k < 1:
        return Θ(f)
    stop
```

## Input and stop
- Takes: constants `a ≥ 1` and `b > 1`, and the non-recursive work `f(n)`, with every subproblem the same size.
- Returns: one of the three bounds above.
- Illegal when: the subproblems differ in size, or `f` falls in a gap between the three cases.
