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
- Real cost: time and extra space belong to each operation, in the case that layout makes expensive. A contiguous layout makes index reads `O(1)` and inserts in the middle `O(n)`.
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
- build(items): pay once to place the items in the layout
- query(key): read without changing the invariant
- update(key, value): write, then restore the invariant
