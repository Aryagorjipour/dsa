# 42 - Aho-Corasick

## The Problem That Shows Why Aho-Corasick Exists

**Multiple Pattern String Matching (Dictionary Search in Text):**

You are given a large document (or stream) and a dictionary of thousands of patterns (e.g. 10,000 virus signatures, banned phrases, DNA motifs, or keywords).

Task: Find **every** occurrence of **every** pattern in the text, reporting all matches (including overlapping ones).

**Why naive fails:**
- Running KMP or Rabin-Karp separately for each pattern = O(n * k) where k = #patterns. For n=1M, k=10k this is 10 billion operations — unusable.

Aho-Corasick solves the "search once, find everything" problem by building one automaton from all patterns.

### Canonical Problem: Multi-Pattern Keyword Search in Documents / Logs / DNA

**Detailed Problem Statement:**

Input:
- Text T of length n (e.g. a web page, server log, or genome sequence)
- Dictionary D of m patterns (total length sum ~ thousands to millions)

Output:
- For every pattern in D, all starting positions where it occurs in T.
- Must handle overlaps (e.g. patterns "he", "she", "hers" in "hershe" should report all).

This is exactly why Aho-Corasick was invented in 1975 at Bell Labs for bibliographic search.

**Real-world use cases (evidence):**
- Antivirus / IDS (ClamAV, Snort): Scan network packets or files for thousands of malware signatures in one pass.
- Content moderation (Facebook, YouTube internals): Detect many banned phrases/URLs.
- Bioinformatics: Find all known motifs or genes in DNA/RNA sequences.
- Log analysis & search engines: Keyword extraction at scale.
- Spam filters and plagiarism detectors.

**Full Implementation Sketch (Build + Search)**

(Trie construction + BFS for failure links + output collection.)

See the complete runnable code in examples/ and the detailed build steps in the chapter.

![Aho-Corasick Automaton](/images/aho-corasick-automaton.png)

## Flagship Real Problems

- Network intrusion detection / antivirus (ClamAV historically used variants)
- Content moderation (find any of 10k banned phrases)
- Bioinformatics: find all known motifs in DNA sequence
- Log analysis: detect any of hundreds of error patterns in one pass

## How It Works (High Level + Full Impl Sketch)

1. Build trie of all patterns
2. Build failure links (BFS order, like KMP LPS)
3. Output links for multiple matches at same position
4. Process text, following transitions + following failure links on mismatch

## Implementation

Full working C# and Go Aho-Corasick (trie + queue for links) must be provided.

Many production systems implement this.

## Complexity

Preprocessing O(total patterns length * alphabet)
Search O(text length + number of matches)

This is the multi-pattern king.
