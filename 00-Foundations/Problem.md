---
type: Data Structure Detail
tags:
  - dsa
---

# Problem
Type: Data Structure Detail
Needs: none

## What it is
A problem names the input, the output that counts as an answer, and the size `n` you will measure. The invariant is that every later cost and structure refers to this same input, output, and `n`.

## Details
- Real cost: there is no running time yet. The case that matters is an unnamed `n`, which makes every later bound a guess.
- When it beats the previous structure: a stated problem beats an unstated task, because you can tell a wrong answer from an unfinished one.
- Failure mode: hiding a second input inside "the obvious constraints," then quoting a cost for a different `n`.

## Uses
- Decide whether a request is a decision (yes or no), a search (find one), or a construction (build one).
- Freeze `n` before comparing two approaches.
- Reject a solution that answers a nearby question.

## Pseudocode

```
state(task):
    name the input
    name the legal output
    name n
    if any of the three is missing:
        stop
    return the problem
```

## Choice
- The statement fixes input, output, and `n`.
- It does not choose an algorithm.
