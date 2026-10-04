---
type: Algorithm
tags:
  - dsa
---

# recursion trees
Type: Algorithm
Needs: [[Recurrences]]

## What it is
A recursion tree draws each recursive cost as a node. The cost of a level is the sum of the nodes on that level, and the total is the sum of the levels. The invariant is that the sizes on a level add up to the work that level really does.

## Details
- Real cost: time is the sum of per-level costs down to the leaves. The depth is also the stack space of that recursion. The case that matters is an unbalanced split, where the leaves are not all on one row.
- When it beats the previous structure: it beats staring at a [[Recurrences|recurrence]] whose pieces have different sizes, such as `T(n/3)` plus `T(2n/3)`, because the levels make the sum visible.
- Failure mode: charging a full last level when some branches have already hit the base case.

## Uses
- See why `2T(n/2) + Θ(n)` is `Θ(n log n)`: there are `Θ(log n)` levels, and each one costs `Θ(n)`. A level cost of `O(n)` does not pin this, because `O(1)` is also `O(n)`.
- Sum a tree whose branches shrink at different rates.
- Check a guessed bound by comparing the root work with the leaf work.

## Pseudocode

```
sum_tree(recurrence):
    draw the root as the work at n
    while a node is not a base case:
        draw one child per recursive call
    for each level:
        add the work of the nodes on that level
    return the sum of the levels
```

## Input and stop
- Takes: a recurrence whose branching and size split are known.
- Returns: the total of the per-level costs.
- Illegal when: the number of children or the size of a child is not known, so a level cannot be summed.
