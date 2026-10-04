---
type: Paradigm
tags:
  - dsa
---

# Proof habits (induction, contradiction, exchange argument)
Type: Paradigm
Needs: [[Loop invariants]]

## What it is
These are three ways to finish an argument: induction for every size, contradiction for a claim that cannot fail, and exchange for a greedy choice that can be swapped toward the chosen answer. The invariant is that the claim at each step is the same claim you set out to prove.

## Details
- Real cost: a proof is not a running time. The case that matters is the inductive step that assumes the theorem for size `n` while proving size `n`, which is circular. Contradiction must derive a falsehood from the negation. Exchange must show the swapped answer is at least as good.
- When it beats the previous structure: it beats a [[Loop invariants|loop invariant]] you never discharge, because the habit says which argument is allowed to finish the job.
- Failure mode: an example offered as a proof, or a proof that assumes the theorem it is finishing.

## Uses
- Induct on `n` when a recurrence or a recursive procedure is the thing being proved.
- Assume a comparison sort beats `n log n` and count the decision tree until the assumption breaks.
- Swap one greedy choice for an optimal choice and show the cost does not get worse.

## Pseudocode

```
prove(claim):
    if every size follows from smaller sizes:
        prove the base, then one inductive step
    else if the negation is absurd:
        assume the negation and derive a falsehood
    else if a choice can be swapped:
        swap toward the chosen answer and show it is no worse
    else:
        stop
    return the argument
```

## Loop
- Set up: induction when the claim is "for all `n`", contradiction when you assume the claim is false, exchange when one local choice should match an optimal answer.
- Refuse: an example as a proof, and a step that uses the claim it is supposed to establish.
