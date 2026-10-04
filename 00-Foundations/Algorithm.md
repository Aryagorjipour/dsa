---
type: Algorithm
tags:
  - dsa
---

# Algorithm
Type: Algorithm
Needs: [[Problem]], [[Data Structure]]

## What it is
An algorithm is a finite procedure that turns a legal input into the output the [[Problem]] requires, using a [[Data Structure]] only as far as the steps say. The invariant is that each step moves the state toward that output and does not break the problem's rules.

## Details
- Real cost: count the steps and the extra cells as a function of `n`. The case that matters is the input shape that forces the most steps, unless you have already named a different case.
- When it beats the previous structure: a procedure beats a [[Data Structure]] that only sits there, because the structure does not by itself produce the answer.
- Failure mode: a step that does not finish, or a procedure that solves a different problem than the one stated.

## Uses
- Turn "find the smallest" into a scan with a stop condition.
- Carry an invariant from the first item to the last.
- Compare two procedures on the same `n` before comparing their layouts.

## Pseudocode

```
run(input):
    if input is outside the problem:
        stop
    while the output is not ready:
        take one step that preserves the invariant
    return the output
```

## Input and stop
- Takes: a stated [[Problem]] and the structures the steps may touch.
- Returns: the output that problem asked for.
- Illegal when: the input is outside the problem, or a step cannot be shown to finish.
