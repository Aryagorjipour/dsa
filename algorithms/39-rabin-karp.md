# 39 - Rabin-Karp

## The Problem

String matching (find pattern in text) using **rolling hash**.

Instead of comparing characters, compare hashes.

When hashes match, verify the actual string (to handle collisions).

## Rolling Hash Magic

When sliding the window, you can update the hash in O(1) instead of re-hashing the whole window.

This makes average O(n + m) string search.

## Real World

- Some plagiarism detection systems
- Some full-text search implementations
- DNA sequence matching
- It is the idea behind many "fingerprint" based matching systems

## Comparison

- KMP: deterministic, no hashing
- Rabin-Karp: hashing based, easy to generalize to 2D, multiple patterns (with tweaks)

## Summary

Rabin-Karp shows how hashing + clever math can turn expensive string comparisons into fast number comparisons.
