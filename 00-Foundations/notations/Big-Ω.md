---
type: Pattern
tags:
  - dsa
---

# Big-Ω
Type: Pattern
Needs: [[Asymptotic notation (Big-O (upper), Big-Ω (lower), Big-Θ (tight))]]

## What it is
`f` is `Ω(g)` when `f` grows at least as fast as `g`, up to a constant, once `n` is large enough. The invariant is that there exist constants `c > 0` and `n0` such that for every `n ≥ n0`, `f(n) ≥ c · g(n)`.

## Details
- Real cost: this is a floor on the steps or the cells, not a promise that the algorithm is fast. The case that matters is large `n`. A lower bound on a problem applies to every algorithm in that model.
- When it beats the previous structure: it beats using only [[Big-O]], which can hide that every correct algorithm must do at least this much work.
- Failure mode: reading a lower bound as "this is the running time," or as a reason to stop looking inside a different model.

## Uses
- Say comparison sorting is `Ω(n log n)` so a comparison sort cannot beat that growth.
- Show a loop that looks at every item is `Ω(n)` just from the reads.
- Stop polishing an algorithm that has already met a matching lower bound.

## Pseudocode

```
is_lower(f, g):
    choose c > 0 and n0
    for each n >= n0:
        if f(n) < c * g(n):
            return no
    return yes
```

## Shape
- Recognize: the phrase "no better than," said of growth.
- Move: name the function the cost cannot fall under in this model.
