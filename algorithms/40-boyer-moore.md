# 40 - Boyer-Moore

## The Problem

Extremely fast string matching in practice.

It uses two clever heuristics (bad character rule + good suffix rule) to skip large portions of the text.

In practice, it is often the fastest for natural language text.

## Real World

- Many `grep` implementations have used Boyer-Moore or variants (GNU grep uses highly optimized variants)
- Text editors find functionality
- Antivirus pattern matching (historically)

## Interesting Property

It can skip characters, sometimes examining less than n characters in the text.

## Summary

Boyer-Moore is a beautiful example of "skip as much work as possible" thinking in string algorithms.
