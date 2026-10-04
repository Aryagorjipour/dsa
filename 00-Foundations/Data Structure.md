---
type: Data Structure
tags:
  - dsa
---

# Data Structure
Type: Data Structure
Needs: [[ADT]]

## What it is
A data structure is a concrete layout that makes an [[ADT]]'s operations possible at a stated cost. The invariant is that after every update the layout still matches the ADT rules the caller was promised.

## Details
- Real cost: time and extra space belong to each operation, in the case that layout makes expensive. A contiguous layout makes index reads `Θ(1)` and inserts in the middle `Θ(n)`.
- When it beats the previous structure: it beats a bare [[ADT]], which can name `insert` but cannot say what `insert` costs.
- Failure mode: using the ADT name as if every layout had the same cost.

## Uses
- Pick a layout whose cheap operation is the one the [[Problem]] repeats.
- Predict cache traffic from contiguous cells versus pointer chasing.
- Reject a layout that keeps the operation names and breaks the invariant.

## Pseudocode

```
update(layout, change):
    if the change would break the ADT rule:
        stop
    write the change into the layout
    restore the invariant
    return the layout
```

## Operations
- build(items): `Θ(n)` time to place `n` items, and `Θ(n)` cells to hold them. The case that matters is extra words per item, pointers or slack, which change the constant and not the `n`.
- query(key): `Θ(1)` when the layout names the cell, as an index does. `Θ(n)` when the only access is a walk. The case that matters is the walk.
- update(key, value): `Θ(1)` when that cell is known and no neighbor moves. `Θ(n)` when restoring the invariant shifts or rebuilds a contiguous block. The case that matters is the shift.
