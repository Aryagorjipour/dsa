# 41 - Boyer-Moore

## The Problem

Find all occurrences of pattern `P` in text `T` as fast as possible in practice — often **faster than O(n)** on natural language because the algorithm can **skip** large portions of the text without examining every character.

Naive and KMP compare left-to-right. Boyer-Moore compares **right-to-left** within the window and uses mismatch information to shift the pattern aggressively.

### Canonical Problem 1: Find All Occurrences

Return every start index where `P` matches in `T`.

### Canonical Problem 2: Bad Character Rule

On mismatch at pattern position `j`, shift so the mismatched text character aligns with its rightmost occurrence in `P`.

### Canonical Problem 3: Good Suffix Rule

When a suffix of `P` matched before the mismatch, shift using precomputed good-suffix shifts (full Boyer-Moore).

## The Two Heuristics

### Bad Character Rule

If mismatch at `P[j]` against text character `c`, shift pattern so the rightmost occurrence of `c` in `P[0..j-1]` aligns under `c`. If `c` not in pattern, shift past the mismatch entirely.

### Good Suffix Rule

If `P[j+1..m-1]` matched but `P[j]` failed, shift using how that matched suffix relates to other occurrences in `P` — avoids redundant re-checking of already-matched suffixes.

Take the **maximum** shift from both rules at each step.

## Full Implementation

### C#

```csharp
public static class BoyerMoore {
    public static List<int> SearchAll(string text, string pattern) {
        var matches = new List<int>();
        int n = text.Length, m = pattern.Length;
        if (m == 0 || m > n) return matches;

        int[] badChar = BuildBadCharTable(pattern);
        int[] goodSuffix = BuildGoodSuffixTable(pattern);

        int shift = 0;
        while (shift <= n - m) {
            int j = m - 1;
            while (j >= 0 && pattern[j] == text[shift + j]) {
                j--;
            }
            if (j < 0) {
                matches.Add(shift);
                shift += goodSuffix[0];
            } else {
                int bcShift = j - badChar[text[shift + j]];
                int gsShift = goodSuffix[j + 1];
                shift += Math.Max(1, Math.Max(bcShift, gsShift));
            }
        }
        return matches;
    }

    private static int[] BuildBadCharTable(string pattern) {
        int[] table = new int[256];
        Array.Fill(table, -1);
        for (int i = 0; i < pattern.Length; i++) {
            table[pattern[i]] = i;
        }
        return table;
    }

    private static int[] BuildGoodSuffixTable(string pattern) {
        int m = pattern.Length;
        int[] suffix = new int[m];
        int[] gs = new int[m + 1];
        Array.Fill(gs, m);
        Array.Fill(suffix, 0);

        int f = 0, g = m - 1;
        for (int i = m - 2; i >= 0; i--) {
            if (i > g && suffix[i + m - 1 - f] < i - g) {
                suffix[i] = suffix[i + m - 1 - f];
            } else {
                if (i < g) g = i;
                f = i;
                while (g >= 0 && pattern[g] == pattern[g + m - 1 - f]) g--;
                suffix[i] = f - g;
            }
        }

        for (int i = 0; i < m - 1; i++) {
            gs[m - 1 - suffix[i]] = m - 1 - i;
        }
        return gs;
    }

    public static int SearchFirst(string text, string pattern) {
        var all = SearchAll(text, pattern);
        return all.Count > 0 ? all[0] : -1;
    }
}
```

### Go

```go
func BoyerMooreSearchAll(text, pattern string) []int {
    n, m := len(text), len(pattern)
    matches := []int{}
    if m == 0 || m > n {
        return matches
    }

    badChar := buildBadCharTable(pattern)
    goodSuffix := buildGoodSuffixTable(pattern)

    shift := 0
    for shift <= n-m {
        j := m - 1
        for j >= 0 && pattern[j] == text[shift+j] {
            j--
        }
        if j < 0 {
            matches = append(matches, shift)
            shift += goodSuffix[0]
        } else {
            bcShift := j - badChar[text[shift+j]]
            gsShift := goodSuffix[j+1]
            shift += max(1, max(bcShift, gsShift))
        }
    }
    return matches
}

func buildBadCharTable(pattern string) [256]int {
    var table [256]int
    for i := range table {
        table[i] = -1
    }
    for i := 0; i < len(pattern); i++ {
        table[pattern[i]] = i
    }
    return table
}

func buildGoodSuffixTable(pattern string) []int {
    m := len(pattern)
    suffix := make([]int, m)
    gs := make([]int, m+1)
    for i := range gs {
        gs[i] = m
    }

    f, g := 0, m-1
    for i := m - 2; i >= 0; i-- {
        if i > g && suffix[i+m-1-f] < i-g {
            suffix[i] = suffix[i+m-1-f]
        } else {
            if i < g {
                g = i
            }
            f = i
            for g >= 0 && pattern[g] == pattern[g+m-1-f] {
                g--
            }
            suffix[i] = f - g
        }
    }
    for i := 0; i < m-1; i++ {
        gs[m-1-suffix[i]] = m - 1 - i
    }
    return gs
}
```

## Complexity

| Case | Time | Space | Notes |
|------|------|-------|-------|
| Preprocessing | O(m + σ) | O(m + σ) | σ = alphabet size (256 for bytes) |
| Best / average | O(n / m) to O(n) | — | Can skip m chars per step |
| Worst | O(n × m) | — | Rare pathological patterns |

In practice on English text, Boyer-Moore often examines **far fewer than n** characters.

## Real World

- **GNU grep** — historically used Boyer-Moore and Horspool variants; modern grep combines multiple strategies
- **Text editors** — fast find in large buffers for medium-length patterns
- **Antivirus scanning** — signature matching (often combined with other filters first)
- **Intrusion detection** — Snort/Suricata rule engines use multi-pattern variants

## Simplified Variant: Boyer-Moore-Horspool

Uses only the bad-character rule on the last pattern character — simpler code, still fast in practice. Good suffix adds robustness on repetitive patterns.

## Comparison

| Algorithm | Scan direction | Typical speed | Worst case |
|-----------|----------------|---------------|------------|
| KMP | Left-to-right | O(n) guaranteed | O(n) |
| Rabin-Karp | Left-to-right | O(n) average | O(n × m) |
| **Boyer-Moore** | Right-to-left | Often fastest on text | O(n × m) |

## Summary

Boyer-Moore matches right-to-left and jumps forward using bad-character and good-suffix rules. Preprocessing is O(m), but search often skips huge stretches of text — why `grep` loves it.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Full-Text Search Engine](/projects/tier-3/13-full-text-search-engine)
:::

**Next:** [42 - Z-Algorithm](42-z-algorithm.md)