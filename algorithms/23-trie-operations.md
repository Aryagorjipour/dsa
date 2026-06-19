# 24 - Trie Operations

## The Problems Trie Operations Solve

Tries excel at prefix-based string operations.

### Canonical Problem: Word Search II (Hard)

Given a 2D board of letters and a list of words, find all words that can be formed by adjacent letters (no reuse in same word).

Naive: for each word do DFS = slow.
Optimal: Build Trie of all words, then DFS on board using Trie to prune impossible branches.

This is the perfect "why Trie exists" problem.

### Other Classic Problems

- Implement Trie (insert, search, startsWith)
- Design Add and Search Words (with '.' wildcard)
- Longest word in dictionary
- Replace words (prefix replacement using trie)

## Full Operations Implementation

Reuse the Trie from data structures chapter, add:

- Delete word (careful with shared prefixes)
- Count words with prefix
- List all words with given prefix (autocomplete)

## Real World

- Autocomplete engines
- Spell checkers
- IP routing (tries for prefixes)
- Compilers symbol completion

Implement the board DFS + Trie combination for Word Search II as the flagship problem for this chapter.
