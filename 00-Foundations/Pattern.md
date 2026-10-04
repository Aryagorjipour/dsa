---
type: Pattern
tags:
  - dsa
---

# Pattern
Type: Pattern
Needs: [[Algorithm]]

## What it is
A pattern is a situation you have already solved, wearing a new story. The invariant is that the shape stays the same: the same marks, the same window, or the same stack of choices.

## Details
- Real cost: the cost is the cost of that known [[Algorithm]], transferred to the new story. The case that matters is a story that looks similar and breaks the shape.
- When it beats the previous structure: it beats writing a fresh procedure when the bottleneck is one you already know.
- Failure mode: matching the vocabulary of the story and missing the shape, then applying the wrong move.

## Uses
- See "pair from both ends" as two pointers, not as a new sort.
- See "nearest smaller on the left" as a monotonic stack.
- Refuse a new structure when the old shape still fits.

## Pseudocode

```
scan(story):
    if the story does not have the known shape:
        stop
    place the same marks as the known algorithm
    while the shape still holds:
        take the known step
    return the answer
```

## Shape
- Recognize: the same bottleneck as a note you already trust.
- Move: the same local step. Do not invent a structure for this story alone.
