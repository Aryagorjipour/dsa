# 35 - Edit Distance (Levenshtein)

## The Problem

Given two strings, find the minimum number of operations to convert one into the other.

Allowed operations:
- Insert a character
- Delete a character
- Replace a character

## Classic Example

"horse" → "ros"
Answer: 3

## DP State

`dp[i][j]` = edit distance between first i chars of word1 and first j chars of word2

Recurrence is based on last characters matching or not, and taking min of insert/delete/replace.

This is one of the most practical DP algorithms in existence.

## Real World

- Spell checkers (suggest closest word)
- DNA / protein sequence alignment (Levenshtein and more advanced variants)
- Fuzzy string matching in search engines
- Git uses similar ideas internally
- Autocorrect, plagiarism tools, record linkage in data cleaning

## Variants

- Levenshtein (standard)
- Damerau-Levenshtein (includes transposition)
- Weighted edit distance
- Longest common subsequence is related

## Summary

Edit distance is probably the most deployed DP algorithm in everyday software (every time your phone corrects your terrible typing).
