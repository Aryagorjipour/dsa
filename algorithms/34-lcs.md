# 34 - Longest Common Subsequence (LCS)

## The Problem

Given two strings, find the longest subsequence present in both.

A subsequence doesn't have to be contiguous.

Example:
X = "AGGTAB"
Y = "GXTXAYB"
LCS = "GTAB" (length 4)

## Why It Matters

- Diff tools (the core of `diff`, Git diff, etc. uses LCS ideas)
- DNA sequence comparison in bioinformatics
- Plagiarism detection
- Version control merge algorithms
- Edit distance is closely related

## DP Solution

`dp[i][j]` = LCS of first i chars of X and first j chars of Y

Recurrence:
- If X[i-1] == Y[j-1]: dp[i][j] = dp[i-1][j-1] + 1
- Else: dp[i][j] = max(dp[i-1][j], dp[i][j-1])

O(m * n) time and space. Can optimize space to O(min(m,n)).

## Real Implementation Note

Production diff tools use more advanced algorithms (Patience sorting + LCS optimizations, Myers diff) but the fundamental idea comes from LCS DP.

## Summary

LCS is the classic "two sequences, find longest matching subsequence" DP problem and the foundation of many text differencing tools.
