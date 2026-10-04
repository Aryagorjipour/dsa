---
type: Pattern
tags:
  - dsa
---

# Loop invariants
Type: Pattern
Needs: [[Algorithm]], [[Recursion]]

## What it is
A loop invariant is a statement that is true before the loop and after every iteration. The invariant is that if it holds before an iteration and the body runs, it holds afterward. When the loop stops, the invariant plus the exit test is the answer.

## Details
- Real cost: checking the invariant does not change the running time you are proving. The case that matters is the exit: a statement that is true inside the loop and too weak to imply the answer when the loop stops.
- When it beats the previous structure: it beats "it worked on one array," which never names what stays true.
- Failure mode: a statement that holds at the start and fails after the first update, or one that holds throughout and does not mention the output.

## Uses
- Prove a scan that remembers the maximum has seen the maximum of the prefix so far.
- Prove insertion sort's prefix is sorted after each inserted item.
- Prove a binary search's target, if it exists, still lies inside the open range.

## Pseudocode

```
prove(loop):
    show the invariant before the first iteration
    show the body keeps the invariant
    show the exit test plus the invariant gives the answer
    if any of the three fails:
        stop
    return the proof
```

## Shape
- Recognize: a loop whose answer is built so far, not produced in one jump.
- Move: write initialization, maintenance, and termination. Three sentences, in that order.
