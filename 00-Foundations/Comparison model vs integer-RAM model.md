---
type: Paradigm
tags:
  - dsa
---

# Comparison model vs integer-RAM model
Type: Paradigm
Needs: [[Asymptotic notation (Big-O (upper), Big-Ω (lower), Big-Θ (tight))]], [[Cases (Best, average, worst)]]

## What it is
The comparison model learns about keys only by asking whether one is smaller, equal, or larger. The integer-RAM model may also use the bits of a word as an index, a digit, or a shift. The invariant is that a bound belongs to the model that produced it and does not travel for free.

## Details
- Real cost: comparison sorting is `Ω(n log n)` comparisons in the worst case, because each comparison has two outcomes and there are `n!` orders to tell apart. Integer-RAM sorting of integers in a universe of size `U` can be `O(n + U)` with counting, which is linear in `n` when `U` is `O(n)`. The case that matters is which questions the model allows, not the name of the sort.
- When it beats the previous structure: it beats a single [[Big-O]] story that ignores the model. Counting sort can beat `n log n` because it is not a comparison sort.
- Failure mode: quoting `Ω(n log n)` as a law of every sorting method, including those that use digits or indexes.

## Uses
- Stop searching for a comparison sort that is `o(n log n)` in the worst case.
- Allow counting sort or radix sort once the keys are integers in a bounded universe.
- Say which model a lower bound uses before you treat it as a reason to quit.

## Pseudocode

```
bound(problem, model):
    if model allows only comparisons:
        count the yes-or-no questions a correct algorithm must ask
    else if model allows word indexes, digits, and shifts:
        charge for those word operations, not for comparisons alone
    else:
        stop
    return the bound together with the model
```

## Loop
- Set up: name the questions the model allows, then derive the bound from those questions.
- Refuse: a comparison lower bound used to ban a digit or counting algorithm, and a word-RAM trick claimed inside the comparison model.
