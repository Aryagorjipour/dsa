# 31 - Suffix Array

## What is a Suffix Array?

A **suffix array** is a sorted array of all suffixes of a string.

### Canonical Problem: Find All Occurrences of a Pattern in a Text Efficiently (String Matching at Scale)

**Problem:**

Given a long text (genome, book, log), preprocess it so that for any pattern, you can find all occurrences quickly (O(m + occ) after O(n log n) preprocess).

Suffix Array + binary search allows finding all occurrences of a pattern.

Used in bioinformatics for DNA search, data compression (Burrows-Wheeler), plagiarism detection.

For the string "banana":

Suffixes:
0: banana
1: anana
2: nana
3: ana
4: na
5: a

Sorted order (suffix array): [5, 3, 1, 0, 4, 2]

## Why It Is Powerful

With a suffix array + auxiliary structures (LCP array), you can solve in O(log n) or better:
- Find any substring
- Count occurrences of a pattern
- Find longest repeated substring
- Many bioinformatics and text algorithms

## Operations & Complexity

| Operation        | Time           | Space |
|------------------|----------------|-------|
| Build (naive sort)| O(n² log n)   | O(n)  |
| Build (doubling) | O(n log² n)    | O(n)  |
| Search pattern   | O(m log n)     | O(n)  |
| Count occurrences | O(m log n)    | O(n)  |

m = pattern length, n = text length.

## Complete Implementation (C#)

```csharp
public class SuffixArray {
    private readonly string text;
    private readonly int[] sa;

    public SuffixArray(string text) {
        this.text = text;
        sa = Build(text);
    }

    public static int[] Build(string s) {
        int n = s.Length;
        var suffixes = new (int index, string value)[n];
        for (int i = 0; i < n; i++) {
            suffixes[i] = (i, s[i..]);
        }
        Array.Sort(suffixes, (a, b) => string.Compare(a.value, b.value, StringComparison.Ordinal));
        var result = new int[n];
        for (int i = 0; i < n; i++) result[i] = suffixes[i].index;
        return result;
    }

    public int Search(string pattern) {
        int lo = 0, hi = sa.Length - 1;
        int first = -1;

        while (lo <= hi) {
            int mid = (lo + hi) / 2;
            int cmp = CompareSuffix(pattern, sa[mid]);
            if (cmp <= 0) {
                if (cmp == 0) first = mid;
                hi = mid - 1;
            } else {
                lo = mid + 1;
            }
        }
        return first;
    }

    public List<int> FindAll(string pattern) {
        int first = Search(pattern);
        if (first == -1) return new List<int>();

        var result = new List<int>();
        for (int i = first; i < sa.Length; i++) {
            if (CompareSuffix(pattern, sa[i]) != 0) break;
            result.Add(sa[i]);
        }
        return result;
    }

    private int CompareSuffix(string pattern, int suffixStart) {
        int n = Math.Min(pattern.Length, text.Length - suffixStart);
        for (int i = 0; i < n; i++) {
            if (pattern[i] != text[suffixStart + i]) {
                return pattern[i].CompareTo(text[suffixStart + i]);
            }
        }
        return pattern.Length.CompareTo(text.Length - suffixStart);
    }
}
```

## Complete Implementation (Go)

```go
import "sort"

type SuffixArray struct {
    text string
    sa   []int
}

func NewSuffixArray(text string) *SuffixArray {
    return &SuffixArray{text: text, sa: BuildSuffixArray(text)}
}

func BuildSuffixArray(s string) []int {
    n := len(s)
    type suffix struct {
        index int
        value string
    }
    suffixes := make([]suffix, n)
    for i := 0; i < n; i++ {
        suffixes[i] = suffix{i, s[i:]}
    }
    sort.Slice(suffixes, func(i, j int) bool {
        return suffixes[i].value < suffixes[j].value
    })
    sa := make([]int, n)
    for i, suf := range suffixes {
        sa[i] = suf.index
    }
    return sa
}

func (sa *SuffixArray) Search(pattern string) int {
    lo, hi := 0, len(sa.sa)-1
    first := -1
    for lo <= hi {
        mid := (lo + hi) / 2
        cmp := sa.compareSuffix(pattern, sa.sa[mid])
        if cmp <= 0 {
            if cmp == 0 {
                first = mid
            }
            hi = mid - 1
        } else {
            lo = mid + 1
        }
    }
    return first
}

func (sa *SuffixArray) FindAll(pattern string) []int {
    first := sa.Search(pattern)
    if first == -1 {
        return nil
    }
    var result []int
    for i := first; i < len(sa.sa); i++ {
        if sa.compareSuffix(pattern, sa.sa[i]) != 0 {
            break
        }
        result = append(result, sa.sa[i])
    }
    return result
}

func (sa *SuffixArray) compareSuffix(pattern string, start int) int {
    text := sa.text[start:]
    n := len(pattern)
    if len(text) < n {
        n = len(text)
    }
    if pattern[:n] < text[:n] {
        return -1
    }
    if pattern[:n] > text[:n] {
        return 1
    }
    if len(pattern) < len(text) {
        return -1
    }
    if len(pattern) > len(text) {
        return 1
    }
    return 0
}
```

## Real World Use

### 1. Bioinformatics

DNA and protein sequence analysis lives and dies by suffix arrays and suffix trees.

### 2. Full-Text Search Engines

Some inverted index constructions and substring search use suffix arrays.

### 3. Data Compression

Burrows-Wheeler Transform (used in bzip2) is closely related to suffix arrays.

### 4. Plagiarism Detection & String Matching at Scale

Finding duplicate text across millions of documents.

## Suffix Array vs Suffix Tree

| Feature        | Suffix Array | Suffix Tree |
|----------------|--------------|-------------|
| Construction   | Simpler      | Harder      |
| Memory         | Less         | More        |
| Query speed    | O(m log n)   | O(m)        |
| Cache behavior | Better       | Worse       |

## Summary

Suffix Array = sorted list of every possible suffix.

It unlocks a huge class of fast string algorithms that would otherwise be impossible or extremely slow.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Full-Text Search Engine](/projects/tier-3/13-full-text-search-engine)
:::

**Next:** [32 - Quadtree](32-quadtree.md)