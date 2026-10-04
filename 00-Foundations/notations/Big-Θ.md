---
type: Pattern
tags:
  - dsa
---

# Big-Θ
Type: Pattern
Needs: [[Big-O]], [[Big-Ω]]

## What it is
`f` is `Θ(g)` when `f` is both `O(g)` and `Ω(g)`. The invariant is that the same `g` is an upper bound and a lower bound for large `n`.

## Details
- Real cost: time or space is sandwiched between two constant multiples of `g`. The case that matters is large `n`. Both constants must exist. One side is not enough.
- When it beats the previous structure: it beats quoting only [[Big-O]] or only [[Big-Ω]] once you have actually shown both directions.
- Failure mode: writing `Θ` after proving only the upper bound.

## Uses
- Say a single loop over `n` items that does `O(1)` work each time is `Θ(n)`, because it also reads all `n`.
- Replace a loose `O(n^2)` with `Θ(n log n)` after the lower bound matches, as in mergesort.
- Refuse a "tight" label in a write-up that never shows the floor.

## Pseudocode

```
is_tight(f, g):
    if is_upper(f, g) and is_lower(f, g):
        return yes
    return no
```

## Shape
- Recognize: the phrase "tight," or a cost that is known on both sides.
- Move: show [[Big-O]] and [[Big-Ω]] for the same `g`, or do not write `Θ`.
