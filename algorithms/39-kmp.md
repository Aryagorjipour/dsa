# 39 - Knuth-Morris-Pratt (KMP)

## The Problem

Given a **text** `T` of length `n` and a **pattern** `P` of length `m`, find all starting positions where `P` occurs in `T`.

Naive string matching re-compares characters after every mismatch — **O(n × m)** worst case (e.g. `T = "aaaa…b"`, `P = "aaa…ab"`).

KMP guarantees **O(n + m)** by never moving the text pointer backward.

### Canonical Problem 1: Find All Occurrences

Return every start index where `P` matches in `T`.

### Canonical Problem 2: Build the LPS Array

For pattern `P`, compute the **Longest Proper Prefix which is also Suffix** table — the preprocessing heart of KMP.

### Canonical Problem 3: strstr / IndexOf

Return the first occurrence index, or -1 if not found.

## The Key Insight

When a mismatch occurs at position `j` in the pattern, characters `P[0..j-1]` already matched. Some prefix of `P` may equal a suffix of that matched portion — **reuse that overlap** instead of restarting from scratch.

The **LPS array** encodes exactly how far to shift the pattern forward.

**Example:** `P = "ABABCABAB"`

```
Index:  0  1  2  3  4  5  6  7  8
Char:   A  B  A  B  C  A  B  A  B
LPS:    0  0  1  2  0  1  2  3  4
```

After mismatch at index 8, LPS[7] = 3 means the next comparison resumes at pattern index 3.

## How KMP Works

1. **Preprocess** — build LPS in O(m)
2. **Search** — scan text once; on match, advance both pointers; on mismatch, jump pattern index via LPS without moving text pointer back

## Full Implementation

### C#

```csharp
public static class KMP {
    public static int[] BuildLPS(string pattern) {
        int m = pattern.Length;
        int[] lps = new int[m];
        int len = 0;
        int i = 1;
        while (i < m) {
            if (pattern[i] == pattern[len]) {
                len++;
                lps[i] = len;
                i++;
            } else if (len > 0) {
                len = lps[len - 1];
            } else {
                lps[i] = 0;
                i++;
            }
        }
        return lps;
    }

    public static List<int> SearchAll(string text, string pattern) {
        var matches = new List<int>();
        if (pattern.Length == 0) return matches;

        int[] lps = BuildLPS(pattern);
        int i = 0, j = 0;
        int n = text.Length, m = pattern.Length;

        while (i < n) {
            if (text[i] == pattern[j]) {
                i++; j++;
                if (j == m) {
                    matches.Add(i - m);
                    j = lps[j - 1];
                }
            } else if (j > 0) {
                j = lps[j - 1];
            } else {
                i++;
            }
        }
        return matches;
    }

    public static int SearchFirst(string text, string pattern) {
        var all = SearchAll(text, pattern);
        return all.Count > 0 ? all[0] : -1;
    }
}
```

### Go

```go
func BuildLPS(pattern string) []int {
    m := len(pattern)
    lps := make([]int, m)
    length := 0
    i := 1
    for i < m {
        if pattern[i] == pattern[length] {
            length++
            lps[i] = length
            i++
        } else if length > 0 {
            length = lps[length-1]
        } else {
            lps[i] = 0
            i++
        }
    }
    return lps
}

func KMPSearchAll(text, pattern string) []int {
    if len(pattern) == 0 {
        return nil
    }
    lps := BuildLPS(pattern)
    matches := []int{}
    i, j := 0, 0
    n, m := len(text), len(pattern)

    for i < n {
        if text[i] == pattern[j] {
            i++
            j++
            if j == m {
                matches = append(matches, i-m)
                j = lps[j-1]
            }
        } else if j > 0 {
            j = lps[j-1]
        } else {
            i++
        }
    }
    return matches
}

func KMPSearchFirst(text, pattern string) int {
    matches := KMPSearchAll(text, pattern)
    if len(matches) == 0 {
        return -1
    }
    return matches[0]
}
```

## Complexity

| Phase | Time | Space |
|-------|------|-------|
| Build LPS | O(m) | O(m) |
| Search | O(n) | O(1) extra |
| **Total** | **O(n + m)** | **O(m)** |

The text pointer `i` only increases — that is the amortized O(n) guarantee.

## Real World

- **Text editor "Find"** — many implementations use KMP or variants for exact search
- **Compilers / lexers** — tokenize source by matching keyword patterns
- **Network IDS** — exact signature matching in packet payloads
- **Bioinformatics** — find exact DNA motifs in genomes
- **Data compression** — LPS / border ideas appear in LZ-family algorithms

## Comparison with Other Matchers

| Algorithm | Time | Best for |
|-----------|------|----------|
| Naive | O(n × m) | Teaching only |
| **KMP** | O(n + m) | Guaranteed linear, no hash collisions |
| Rabin-Karp | O(n + m) average | Multiple patterns, 2D extension |
| Boyer-Moore | O(n × m) worst, often sublinear | Long patterns, natural language |
| Z-Algorithm | O(n + m) | Elegant alternative, same complexity |

## Why Learn KMP?

KMP teaches **prefix-function / border** thinking — the same idea powers the failure links in Aho-Corasick and advanced string data structures.

## Summary

KMP preprocesses the pattern into an LPS table, then scans the text in one pass. On mismatch, jump the pattern pointer — never the text pointer — for guaranteed O(n + m) exact matching.

**Next:** [40 - Rabin-Karp](40-rabin-karp.md)

::: tip Project Lab
**Build it yourself:** [Full-Text Search Engine](/projects/tier-3/13-full-text-search-engine) — KMP, Rabin-Karp, Boyer-Moore, and Aho-Corasick.
:::