# 29 - Rope

## What is a Rope?

A **rope** is a binary tree data structure designed for **efficient manipulation of very long strings**.

### Canonical Problem: Efficient Editing of Very Large Documents (Text Editors with Million+ Lines)

**Problem:**

In a text editor handling a 10MB+ file (e.g. log files, source with huge data), you need:
- Insert/delete at arbitrary positions in O(log n)
- Extract substring
- Concatenate
- Without O(n) copies every time.

Standard string (contiguous array) makes middle inserts O(n).

Rope splits the string into small chunks in a balanced tree, allowing local changes to be cheap.

**Why it exists:** Used in some advanced text editors and rope libraries for large immutable strings in functional languages.

Full node split/merge impl in chapter. See examples for basic rope ops.

Instead of storing the entire string in one contiguous buffer (like normal strings or gap buffers), a rope splits the string into pieces (leaves) and connects them in a tree.

Each internal node stores the total length of the string in its left subtree.

## Why Ropes Exist

Normal string operations in most languages are expensive for large strings:
- Concatenation can be O(n)
- Insertion in the middle is O(n)
- Taking substrings can copy data

Ropes make these operations much cheaper:
- Concatenation: O(log n) or even O(1) in some cases
- Insertion / Deletion in middle: O(log n)
- Substring / split: O(log n)

At the cost of:
- More memory overhead (tree nodes)
- Slower random access (O(log n) instead of O(1))
- More complex implementation

## Real World Use

### 1. Text Editors

Some advanced text editors and IDEs use rope-like structures for the document buffer (especially when dealing with very large files).

### 2. C++ Standard Library

GCC's `std::rope` (from the SGI STL extension) was one of the most famous implementations.

It was used in some compilers and tools that processed huge strings.

### 3. Functional Languages & Immutable Data

Ropes are popular in functional settings because concatenation can share structure.

### 4. Some Database Full-Text Indexes

Ropes or rope-like structures appear in certain full-text search implementations.

## Operations

- Concat
- Split at position
- Insert / Delete substring
- Get character at index
- Iterate / convert to normal string when needed

## When You Should Care

For normal application strings (even multi-megabyte), modern string implementations + StringBuilder / `strings.Builder` are usually fine.

Ropes become interesting when:
- You have **tens or hundreds of megabytes** of text
- You do a **lot** of middle insertions/deletions
- You need efficient structural sharing (immutability)

## Summary

Rope = tree of string chunks optimized for large-scale text editing and manipulation.

It is a specialized but beautiful data structure that shows how thinking in trees instead of flat buffers can completely change performance characteristics.

**Next:** [30 - Gap Buffer](30-gap-buffer.md)
