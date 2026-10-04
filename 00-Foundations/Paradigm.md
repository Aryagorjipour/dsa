---
type: Paradigm
tags:
  - dsa
---

# Paradigm
Type: Paradigm
Needs: [[Pattern]], [[Algorithm]]

## What it is
A paradigm is a way of cutting a whole family of problems into the same kind of smaller work. The invariant is that every smaller piece is still the same kind of problem as the original.

## Details
- Real cost: the cost is the recurrence of that split, not the cost of one clever instance. The case that matters is a piece that is not actually smaller.
- When it beats the previous structure: it beats a [[Pattern]] that covers one shape, once a whole family splits the same way.
- Failure mode: a trick that works on one input and does not survive the split.

## Uses
- Treat divide and conquer as a family: split, solve, combine.
- Treat greedy as a family that needs an exchange argument, not as one lucky choice.
- Treat dynamic programming as recursion plus a cache, only after the state is named.

## Pseudocode

```
solve(problem):
    if the problem is a base case:
        return the base answer
    split into smaller problems of the same kind
    solve each smaller problem
    combine the results
```

## Loop
- Set up: the family, the split, and the combine.
- Refuse: a move that only works for one instance.
