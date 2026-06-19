# 00 - What is an Algorithm? What is Algorithmic Thinking?

## The Honest Definition

An **algorithm** is a precise, step-by-step set of instructions to solve a problem or perform a task.

That's it.

It doesn't have to be code. It doesn't have to be math. A recipe for pancakes is an algorithm. IKEA furniture instructions are algorithms (bad ones sometimes).

In software:

An algorithm = a **recipe that a computer can follow exactly** to turn input into desired output.

## Algorithmic Thinking (The Real Skill)

This is the part most tutorials skip.

Algorithmic thinking is not "memorizing 50 algorithms".

It is the ability to:

1. **Clearly define the problem** (including edge cases)
2. **Break it down** into smaller, solvable pieces
3. **Choose appropriate tools** (data structures + known algorithms)
4. **Analyze cost** (time + space)
5. **Implement correctly** and **prove it works** (at least for the important cases)
6. **Optimize only when needed**

Real engineers don't start typing `for` loops immediately. They ask:

- What does "correct" look like here?
- What is the smallest unit of work?
- Can I avoid doing the hard thing at all?
- If I must do the hard thing, can I do it fewer times?
- Can previous answers help me with future answers?

## A Concrete Example — The "Two Crystal Balls" Problem

This is one of the best problems ever invented to teach algorithmic thinking.

### The Problem Statement

You are given a 100-story building.

You have **two identical crystal balls**.

You need to find the **exact lowest floor** from which the ball will **break** when dropped.

Rules:
- From floor F and above, the ball **breaks**.
- Below F, the ball **survives**.
- You can reuse a ball if it doesn't break.
- Once a ball breaks, it's gone.
- You want to minimize the **worst-case** number of drops.

If you had 1 ball, you would have to start from floor 1 and go up one by one. Worst case = 100 drops.

With 2 balls, can you do better?

### The Naive Approach (Linear)

```go
// Drop from floor 1, then 2, then 3... with first ball
// When it breaks, use second ball to check the previous interval
```

Worst case: ~100 drops (still bad).

### Algorithmic Thinking Applied

Key insight: I have **two** balls. The first ball can be used for "jumping" to narrow the range. The second ball is for linear search in the dangerous zone.

But how big should my jumps be?

If I jump 10 floors every time with the first ball:
- Worst case: I might do 10 jumps + 9 drops with second ball = 19 drops.

Is that optimal?

What if I make decreasing jumps?

The optimal strategy turns out to be:

Make jumps of size roughly `sqrt(N)`, then linear in the last interval.

For 100 floors:

- Drop first ball from floors: 14, 27, 39, 50, 60, 69, 77, 84, 90, 95, 99, 100 (roughly decreasing steps of 14,13,12...)

This gives worst case around **14 drops**.

The exact math: with 2 balls and X drops allowed, you can cover `X*(X+1)/2` floors.

For 100 floors, you solve `x(x+1)/2 >= 100` → x ≈ 14.

### The Algorithm (Binary Search Variant + Linear)

Actually for two balls, optimal is **not pure binary search** (binary search would be great with infinite balls).

This is the perfect example why:

**Different constraints → different optimal algorithm.**

Pure binary search would give ~7 drops in average but **worst case ~7 drops if you had many balls**. With only 2 balls, if you do binary search and the first ball breaks, you may be forced into a long linear scan below, ruining your worst case.

This teaches the most important lesson:

> The best algorithm depends on the **constraints**, not just the problem name.

We will implement the optimal solution properly when we reach the Binary Search chapter (with full code in both languages).

## Another Thinking Example: "I Need to Find Duplicates Fast"

Naive: For every item, scan the rest of the list → O(n²) = disaster on 100k items.

Algorithmic thinking:

- Do I care about order? No.
- Can I trade memory for time? Yes, we have RAM.
- I can use a **set** (hash set) to track seen items.

Result: O(n) time, O(n) extra space.

Even better in some cases: if values are small integers, use a **boolean array** or **bit array**.

Or: sort first then scan adjacent (if you can afford O(n log n)).

See? Multiple correct answers with different tradeoffs. The engineer picks based on constraints.

## The "Algorithmic Thinking" Checklist (Use This Daily)

When facing any problem:

1. **What is the actual goal?** (Not "sort the list" — maybe "show the top 10 newest items")
2. **What does the input look like?** Size? Already sorted? Duplicates? Range of values?
3. **What operations must be fast?** Search? Insert? Delete? Min/Max? Range?
4. **Can I preprocess?** (Sort once, build a structure, etc.)
5. **Can I avoid work?** (Early exit, caching, bloom filter, etc.)
6. **Can previous work help future work?** (Memoization, dynamic programming)
7. **What are my real constraints?** (Memory, latency, CPU, distributed, single machine)
8. **What is the simplest thing that is good enough?**

## Algorithms Are Everywhere in Your Tools

Here are real examples you probably use daily without thinking:

- **Binary search** — Every time you `git bisect`, or your editor jumps to a line, or databases do index lookups.
- **Hash maps** — Variable lookup in every language runtime, HTTP header parsing, config lookups.
- **Topological sort** — npm/yarn/pnpm dependency resolution. "Install A before B because B depends on A".
- **Shortest path (Dijkstra / A*)** — Google Maps, game pathfinding, network routing.
- **LRU cache eviction** — Browser caches, Redis, CDN edge caches, database buffer pools.
- **Merkle tree diffing** — Git pull/push, rsync, BitTorrent, blockchain block verification.
- **Rate limiting** — Almost every public API (token bucket, sliding window log, etc.).
- **Consistent hashing** — Load balancers, sharded caches, Kafka partition assignment.
- **Backtracking** — Sudoku solvers, regex engines (some), constraint solvers, game AI.
- **Dynamic programming** — Spell checkers (edit distance), sequence alignment in bioinformatics, optimizing compilers (register allocation), knapsack problems in cloud cost optimization.

## Pseudocode vs Real Code

You will see "pseudocode" in many textbooks.

Pseudocode is useful for **thinking**.

But in this handbook we will always show **real, compilable** C# and Go code.

Pseudocode example:

```
function binarySearch(arr, target):
    low = 0
    high = length(arr) - 1
    while low <= high:
        mid = (low + high) / 2
        if arr[mid] == target: return mid
        ...
```

We will give you the **full real version** that handles all the annoying details (overflows in C#, empty slices in Go, etc.).

## Coming Up

You now understand the difference:

- **Data Structure** = how we organize data + what we promise about speed
- **Algorithm** = the recipe that uses structures to produce answers

Next critical piece: **how do we talk about "fast" and "slow" in a way that doesn't depend on your specific laptop?**

That's [fundamentals/01-big-o.md](01-big-o.md).

Then we'll start building actual structures.

Let's keep going.
