# 43 - Backtracking

## The Mindset

"Try a choice. If it leads to a solution, great. If not, undo it and try the next choice."

It is DFS + pruning.

## When Backtracking is the Answer

- You need to generate or find **all** (or some) valid configurations
- The problem has constraints that can eliminate large branches early
- Brute force is exponential but pruning makes it practical

Classic problems:
- N-Queens
- Sudoku solver
- Generate all valid parentheses
- Word search / Boggle
- Subset sum / combination sum
- Graph coloring
- Hamiltonian path / cycle (hard)

## Real World

- Compilers doing register allocation (graph coloring)
- Constraint solvers
- Test case generation
- Game AI (some move generation)
- Puzzle generators
- Regex engines (backtracking is how many regex engines work — and why catastrophic backtracking exists)

## Key Techniques

- Pruning (stop as soon as a partial solution is invalid)
- Bitmasks for fast state tracking (very common optimization)
- Symmetry reduction
- Dancing Links (advanced)

## Summary

Backtracking is brute force with intelligence. The difference between "impossibly slow" and "surprisingly fast" is often good pruning.
::: tip Project Lab
**Build it yourself:** [Constraint Solver](/projects/tier-4/22-constraint-solver) — Sudoku, N-Queens, and mini-SAT with backtracking.
:::
