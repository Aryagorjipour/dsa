---
type: Algorithm
tags:
  - dsa
---

# Amortized analysis (aggregate, accounting, potential)
Type: Algorithm
Needs: [[Cases (Best, average, worst)]], [[Time vs. space (input size `n`)]]

## What it is
Amortized analysis charges a sequence of operations so one expensive step is paid for by many cheap ones. The invariant is that the sum of the charges is at least the sum of the real costs over the whole sequence.

## Details
- Real cost: one call can be `O(n)` while `n` calls in a row are `O(n)` total, so the share is `O(1)`. The case that matters is the sequence. Aggregate divides the total by the length. Accounting keeps a bank that must never go negative. Potential uses a function of the structure: real cost plus the change in potential.
- When it beats the previous structure: it beats quoting the [[Cases (Best, average, worst)|worst case]] of a single call as the cost of a long run, which makes a doubling resize look linear per append.
- Failure mode: handing an amortized `O(1)` to a caller who needs every individual call to finish in `O(1)`.

## Uses
- Explain why appending to a doubling array is `O(1)` amortized and `O(n)` on the resize call.
- Charge a stack of multipop operations so `n` pops across the whole life cost `O(n)`.
- Reject an amortized bound in a setting where one late call cannot stall.

## Pseudocode

```
accounting(operation, bank):
    charge = amortized share of this operation
    bank = bank + charge - real cost of operation
    if bank < 0:
        stop
    return charge, bank
```

## Input and stop
- Takes: a sequence of operations and one charging rule (aggregate, accounting, or potential).
- Returns: a bound that holds for the sequence, not a promise about one unlucky call.
- Illegal when: the bank or the potential can fall without a floor, so the charges no longer cover the real cost.
