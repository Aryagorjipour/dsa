# 32 - Dynamic Programming Fundamentals

## What is Dynamic Programming?

Dynamic Programming (DP) is a technique for solving problems by:
1. Breaking them into **overlapping subproblems**
2. Solving each subproblem **once**
3. Storing ("memoizing") the results
4. Combining them to solve the original problem

It is recursion + caching, or bottom-up tabulation.

## When a Problem is DP

Look for:
- Optimal substructure (optimal solution built from optimal subsolutions)
- Overlapping subproblems (same subproblems solved many times)
- Usually maximization, minimization, counting, or decision problems

## Two Ways to Write DP

1. **Top-down** (Memoization + Recursion)
2. **Bottom-up** (Tabulation — fill a table iteratively)

Bottom-up is often preferred for performance and avoiding stack issues.

## Classic First DP Problems

- Fibonacci (with memo)
- Climbing Stairs
- Coin Change
- House Robber
- 0/1 Knapsack (next chapter)

## State Design — The Hardest Part

The key skill in DP is defining the **state** correctly:

`dp[i]` = answer for first i items
`dp[i][j]` = answer considering first i items with capacity j
`dp[i][j][k]` = ... (3D is common in harder problems)

Then define the recurrence:
`dp[i] = max( dp[i-1], dp[i-1 - weight[i]] + value[i] )` etc.

## Real World DP

- Spell checkers (edit distance)
- Bioinformatics (sequence alignment)
- Compiler optimization
- Financial planning / resource allocation
- Game AI (some value iteration)
- Knapsack-style problems in cloud cost optimization, bin packing, etc.

## Summary

DP is not about memorizing 50 patterns.

It is about:
- Recognizing overlapping subproblems
- Defining state that captures "what decisions matter"
- Computing bottom-up or top-down with caching

Master state definition and the rest follows.
::: tip Project Lab
**Build it yourself:** [Dynamic Programming Toolkit](/projects/tier-3/14-dp-toolkit) — knapsack, LCS, edit distance, and LIS in one CLI.
:::
