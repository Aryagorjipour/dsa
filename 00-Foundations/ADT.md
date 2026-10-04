---
type: Data Structure Detail
tags:
  - dsa
---

# ADT
Type: Data Structure Detail
Needs: [[Problem]]

## What it is
An abstract data type is the list of operations a caller may use, plus the rules those operations must leave true. The invariant is that every operation preserves those rules, no matter which memory layout sits underneath.

## Details
- Real cost: an ADT has no single cost. Each operation's cost appears only after a [[Data Structure]] chooses a layout. The case that matters is a caller who assumes `O(1)` because the operation looks small.
- When it beats the previous structure: it beats a [[Problem]] alone, because you can swap the storage without rewriting the question.
- Failure mode: smuggling a layout into the contract ("it is an array") and then treating that accident as a promise.

## Uses
- Name stack operations without choosing an array or a linked chain.
- Keep a set's `insert` and `contains` stable while the representation changes.
- Separate what a graph must support from the choice of matrix or lists.

## Pseudocode

```
apply(contract, representation):
    keep the operation names in the contract
    ignore how the representation stores bytes
    if a call would break a contract rule:
        stop
    return the same contract
```

## Choice
- Variant: the contract over many representations.
- Changes: which operations exist, and what must be true after each one.
- Does not change: the bytes, the indexes, or the pointers.
