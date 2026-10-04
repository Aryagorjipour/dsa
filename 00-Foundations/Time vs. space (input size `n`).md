---
type: Pattern
tags:
  - dsa
---

# Time vs. space (input size `n`)
Type: Pattern
Needs: [[Problem]], [[Algorithm]]

## What it is
Time is the number of steps an [[Algorithm]] takes on an input of size `n`. Space is the extra cells it uses beyond that input. The invariant is that both numbers are functions of the same `n`.

## Details
- Real cost: time grows with the steps you repeat. Extra space grows with the cells you allocate and with the call stack. The case that matters is the one the problem forbids: too many steps, or a second copy of the input.
- When it beats the previous structure: naming both beats a single "fast" claim that hides a copy of the whole input.
- Failure mode: counting the input itself as extra space, or quoting time while a recursion uses `O(n)` stack.

## Uses
- Choose an in-place rearrange when a second array does not fit.
- Spend extra memory on a table when the same subproblem would be solved many times.
- Compare two algorithms only after both costs use the same `n`.

## Pseudocode

```
account(algorithm, input):
    n = size of input
    time = steps on this input
    space = cells allocated beyond the input
    if time or space uses a different n:
        stop
    return time, space
```

## Shape
- Recognize: a cost that is really two costs, steps and cells.
- Move: write both against the same `n`, then say which one you are willing to spend.
