---
type: Pattern
tags:
  - dsa
---

# Big-O
Type: Pattern
Needs: [[Asymptotic notation (Big-O (upper), Big-Ω (lower), Big-Θ (tight))]]

## What it is
`f` is `O(g)` when `f` grows no faster than `g`, up to a constant, once `n` is large enough. The invariant is that there exist constants `c > 0` and `n0` such that for every `n ≥ n0`, `f(n) ≤ c · g(n)`.

## Details
- Real cost: this is an upper bound on time or on space, whichever function you passed in. The case that matters is large `n`. A huge `c` can still make the bound true and useless for small inputs.
- When it beats the previous structure: a named upper bound beats "it grows" from the parent notation, because two upper bounds can be compared.
- Failure mode: reading `O` as a tight bound, or as the time you measured on one input.

## Uses
- Promise that a scan does not get worse than `O(n)`.
- Drop `5n^2 + n` to `O(n^2)` when comparing it with a cubic loop.
- Reject an algorithm whose upper bound already misses the limit you can afford.

## Pseudocode

```
is_upper(f, g):
    choose c > 0 and n0
    for each n >= n0:
        if f(n) > c * g(n):
            return no
    return yes
```

## Shape
- Recognize: the phrase "no worse than."
- Move: drop the constant and the lower terms, and keep the slowest function you are willing to claim.
