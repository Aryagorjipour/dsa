# 38 - Knuth-Morris-Pratt (KMP)

## The Problem

Find all occurrences of a pattern in a text efficiently.

Naive string matching is O((n-m+1) * m) in worst case.

KMP does it in O(n + m).

## The Key Insight

When we have a mismatch, we don't need to start over from the beginning of the pattern.

We can use the fact that the pattern has **prefixes that are also suffixes** to jump ahead intelligently.

## The Prefix Table (LPS - Longest Proper Prefix which is also Suffix)

This is the preprocessing step.

For pattern "ABABCABAB":
LPS = [0,0,1,2,0,1,2,3,4]

This table tells us, after a mismatch, how far we can safely jump.

## Real World

- Many text editors "find" functionality use KMP or similar
- Compilers and interpreters doing string matching
- Network intrusion detection systems
- Bioinformatics (exact pattern matching in DNA)
- Any system doing high-volume substring search

## Why Learn KMP?

It teaches deep string algorithm thinking and is the foundation for understanding more advanced algorithms like Aho-Corasick.

## Implementation

The LPS computation + the main search loop are both elegant and worth implementing fully at least once.

## Summary

KMP = the first major linear-time string matching algorithm that doesn't depend on the alphabet size.
