---
type: Paradigm
tags:
  - dsa
---

# Paradigm
Type: Paradigm
Needs: [[Pattern]], [[Algorithm]]

## What it is
A paradigm is the rule for posing a whole family of problems the same way, before any one instance is solved. The invariant is that the family's rule, not the instance, decides what counts as progress. Divide and conquer is one such family. Its split, conquer, and combine steps live in [[Divide and conquer (and vocabulary)]], not in this note.

## Details
- Real cost: a paradigm has no single running time. The cost appears only after a problem is posed inside one family. The case that matters is a cost borrowed from a family the problem was not posed in.
- When it beats the previous structure: it beats a [[Pattern]] that covers one shape, once the same rule covers every instance in a family.
- Failure mode: a trick that works on one input and is not the family's rule.

## Uses
- Name the family before writing steps, so the later cost refers to that rule.
- Reject an instance whose smaller question is not the kind of question the family allows.
- Send a split-solve-combine problem to [[Divide and conquer (and vocabulary)]] instead of redefining that procedure here.

## Pseudocode

```
pose(family, instance):
    name the rule every instance in the family must follow
    if this instance breaks that rule:
        stop
    return the instance posed under that rule
```

## Loop
- Set up: the family, and the smaller question its rule allows.
- Refuse: a move that works on one instance and is not the family's rule.
