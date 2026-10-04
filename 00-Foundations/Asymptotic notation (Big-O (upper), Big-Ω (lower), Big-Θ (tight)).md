---
type: Pattern
tags:
  - dsa
---

# Asymptotic notation (Big-O (upper), Big-Ω (lower), Big-Θ (tight))
Type: Pattern
Needs: [[Time vs. space (input size `n`)]]

## What it is
Asymptotic notation says how a cost grows with `n` after constant factors and lower-order terms are dropped. The invariant is that the claim is about growth for large `n`, not about the constant on one machine.

## Details
- Real cost: a function `f(n)` is classified against another function `g(n)`. The case that matters is large `n`. A bound that fails for small `n` can still be the right asymptotic claim.
- When it beats the previous structure: it beats a raw step count, which changes when you buy a faster machine and still hides how the cost grows.
- Failure mode: mixing the three symbols. Upper, lower, and tight are different claims.

## Uses
- Drop a `3n + 12` scan down to a growth class before comparing it with a nested scan.
- Keep a lower bound when someone offers an algorithm that claims to beat it.
- Refuse a tight bound until both sides exist.

## Pseudocode

```
classify(f, g):
    if f grows no faster than g:
        record an upper bound
    if f grows at least as fast as g:
        record a lower bound
    if both hold:
        record a tight bound
    return the bounds you actually showed
```

## Shape
- Recognize: a cost written as a function of `n`.
- Move: use [[Big-O]] for "no faster than," [[Big-Ω]] for "no slower than," and [[Big-Θ]] only when both hold.
