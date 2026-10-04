---
type: Pattern
tags:
  - dsa
---

# Cases (Best, average, worst)
Type: Pattern
Needs: [[Asymptotic notation (Big-O (upper), Big-Ω (lower), Big-Θ (tight))]]

## What it is
Best, average, and worst are three families of inputs of size `n`, not three moods of one run. The invariant is that a bound belongs to the family you named, and to no other family.

## Details
- Real cost: worst case is the maximum cost over inputs of size `n`. Best case is the minimum. Average case is the mean over a stated distribution. The case that matters is the one you did not name and then quietly used.
- When it beats the previous structure: it beats one asymptotic symbol applied to "the input," because the same algorithm can be `Θ(n)` on sorted data and `Θ(n^2)` on adversarial data.
- Failure mode: reporting the best case as the cost of the algorithm.

## Uses
- Say insertion sort is quadratic in the worst case and linear when the input is already sorted.
- Require a distribution before you accept an average-case claim.
- Compare two algorithms on the same case, not on whichever case flatters each one.

## Pseudocode

```
classify(algorithm, n):
    worst = maximum cost over inputs of size n
    best = minimum cost over inputs of size n
    if a distribution is stated:
        average = mean cost under that distribution
    else:
        leave average unset
    return best, average, worst
```

## Shape
- Recognize: a cost that moves with the arrangement of the input, not only with `n`.
- Move: name the input that hits the best case, the distribution for the average, and the input that hits the worst.
