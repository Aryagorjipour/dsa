---
type: Data Structure Detail
tags:
  - dsa
---

# Data Structure Detailed
Type: Data Structure Detail
Needs: [[Data Structure]], [[ADT]]

## What it is
A detail is one policy inside a [[Data Structure]]: the part you can swap without renaming the [[ADT]]. The invariant is that the caller's operations still mean the same thing after the swap.

## Details
- Real cost: the detail moves the cost of one operation, or the extra space, and leaves the other operations in the same ballpark. The case that matters is the input that hits the policy you changed (a collision, a resize, a rotation).
- When it beats the previous structure: it beats replacing the whole [[Data Structure]] when only one policy is wrong.
- Failure mode: a "detail" that quietly changes what the operation returns.

## Uses
- Compare chaining with open addressing while `insert` and `lookup` keep their names.
- Compare a dynamic array's growth factor without inventing a new list type.
- Record which policy a note is about when two notes share an ADT.

## Pseudocode

```
apply(policy, structure):
    change only the policy this variant owns
    leave the other operations as they were
    if the ADT rules no longer hold:
        stop
    return the structure
```

## Choice
- Variant: one policy inside an existing structure.
- Changes: the cost or the memory traffic of that policy.
- Does not change: the operation names and the invariant the caller sees.
