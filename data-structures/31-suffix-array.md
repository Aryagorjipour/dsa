# 31 - Suffix Array

## What is a Suffix Array?

A **suffix array** is a sorted array of all suffixes of a string.

### Canonical Problem: Find All Occurrences of a Pattern in a Text Efficiently (String Matching at Scale)

**Problem:**

Given a long text (genome, book, log), preprocess it so that for any pattern, you can find all occurrences quickly (O(m + occ) after O(n log n) preprocess).

Suffix Array + LCP allows binary search on suffixes for the pattern.

Used in bioinformatics for DNA search, data compression (Burrows-Wheeler), plagiarism detection.

Full construction and search code in the chapter.

See resources for CP-Algorithms and bioinformatics use.

For the string "banana":

Suffixes:
0: banana
1: anana
2: nana
3: ana
4: na
5: a

Sorted order (suffix array): [5, 3, 1, 0, 4, 2]

This structure allows extremely fast string operations.

## Why It Is Powerful

With a suffix array + some auxiliary structures (LCP array — longest common prefix), you can solve in O(log n) or better:
- Find any substring
- Count occurrences of a pattern
- Find longest repeated substring
- Find longest common substring between two strings
- Many bioinformatics and text algorithms

## Construction

Naive: sort all suffixes → O(n² log n)

Efficient algorithms exist that build it in O(n log n) or even O(n).

In practice, people often use library functions or well-known algorithms (DC3, SA-IS, etc.).

## Real World Use

### 1. Bioinformatics

DNA and protein sequence analysis lives and dies by suffix arrays and suffix trees.

Finding repeats, motifs, alignments, etc.

### 2. Full-Text Search Engines

Some inverted index constructions and substring search use suffix arrays.

### 3. Data Compression

Burrows-Wheeler Transform (used in bzip2) is closely related to suffix arrays.

### 4. Plagiarism Detection & String Matching at Scale

Finding duplicate text across millions of documents.

### 5. Competitive Programming

Suffix arrays are a staple for hard string problems.

## Suffix Array vs Suffix Tree

- Suffix Tree: More powerful, O(n) construction and queries, but high constant and memory usage. Harder to implement.
- Suffix Array: Simpler, more cache friendly, slightly slower queries but often wins in practice.

Many modern systems prefer suffix arrays + LCP.

## Summary

Suffix Array = sorted list of every possible suffix.

It unlocks a huge class of fast string algorithms that would otherwise be impossible or extremely slow.

**Next:** Spatial data structures — [32 - Quadtree](32-quadtree.md)
