# 36 - Edit Distance (Levenshtein)

## The Problem

Given two strings `word1` and `word2`, find the **minimum number of single-character operations** to transform `word1` into `word2`.

Allowed operations:

- **Insert** a character
- **Delete** a character
- **Replace** a character

### Canonical Problem 1: Levenshtein Distance

**Example:** `"horse"` → `"ros"` requires **3** operations (delete `h`, delete `r`, replace `e` with `s` — other optimal sequences exist).

### Canonical Problem 2: One Edit Away?

Is the edit distance ≤ 1? Useful for autocomplete and fuzzy filters (cheaper than full DP).

### Canonical Problem 3: Minimum Edit Script

Backtrack through the DP table to output the actual sequence of insert / delete / replace operations.

## Why It Matters

Edit distance is among the most **deployed** DP algorithms in everyday software:

- Spell checkers — suggest the dictionary word with smallest edit distance
- Autocorrect on phones — rank candidates by Levenshtein cost
- Fuzzy search — "did you mean …?" in search engines
- Record linkage — match names and addresses with typos in data cleaning
- DNA / protein alignment — Levenshtein and weighted variants in bioinformatics
- Git internals — similar ideas for diff and merge at the line or token level

## DP State & Recurrence

`dp[i][j]` = minimum edits to transform `word1[0..i-1]` into `word2[0..j-1]`.

Base cases: `dp[i][0] = i` (delete all), `dp[0][j] = j` (insert all).

```
if word1[i-1] == word2[j-1]:
    dp[i][j] = dp[i-1][j-1]
else:
    dp[i][j] = 1 + min(
        dp[i-1][j],     // delete from word1
        dp[i][j-1],     // insert into word1
        dp[i-1][j-1]    // replace
    )
```

## Full Implementation

### C#

```csharp
public static class EditDistance {
    public static int Levenshtein(string word1, string word2) {
        int m = word1.Length, n = word2.Length;
        int[,] dp = new int[m + 1, n + 1];

        for (int i = 0; i <= m; i++) dp[i, 0] = i;
        for (int j = 0; j <= n; j++) dp[0, j] = j;

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (word1[i - 1] == word2[j - 1]) {
                    dp[i, j] = dp[i - 1, j - 1];
                } else {
                    dp[i, j] = 1 + Math.Min(
                        dp[i - 1, j],
                        Math.Min(dp[i, j - 1], dp[i - 1, j - 1])
                    );
                }
            }
        }
        return dp[m, n];
    }

    public static List<string> EditScript(string word1, string word2) {
        int m = word1.Length, n = word2.Length;
        int[,] dp = new int[m + 1, n + 1];
        for (int i = 0; i <= m; i++) dp[i, 0] = i;
        for (int j = 0; j <= n; j++) dp[0, j] = j;
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (word1[i - 1] == word2[j - 1]) {
                    dp[i, j] = dp[i - 1, j - 1];
                } else {
                    dp[i, j] = 1 + Math.Min(
                        dp[i - 1, j],
                        Math.Min(dp[i, j - 1], dp[i - 1, j - 1])
                    );
                }
            }
        }

        var ops = new List<string>();
        int ii = m, jj = n;
        while (ii > 0 || jj > 0) {
            if (ii > 0 && jj > 0 && word1[ii - 1] == word2[jj - 1]) {
                ii--; jj--;
            } else if (ii > 0 && jj > 0 && dp[ii, jj] == dp[ii - 1, jj - 1] + 1) {
                ops.Add($"replace '{word1[ii - 1]}' with '{word2[jj - 1]}' at {ii - 1}");
                ii--; jj--;
            } else if (ii > 0 && dp[ii, jj] == dp[ii - 1, jj] + 1) {
                ops.Add($"delete '{word1[ii - 1]}' at {ii - 1}");
                ii--;
            } else {
                ops.Add($"insert '{word2[jj - 1]}' at {ii}");
                jj--;
            }
        }
        ops.Reverse();
        return ops;
    }

    // Space-optimized O(min(m,n))
    public static int LevenshteinSpaceOptimized(string word1, string word2) {
        if (word1.Length < word2.Length) (word1, word2) = (word2, word1);
        int m = word1.Length, n = word2.Length;
        int[] prev = new int[n + 1];
        int[] cur = new int[n + 1];
        for (int j = 0; j <= n; j++) prev[j] = j;

        for (int i = 1; i <= m; i++) {
            cur[0] = i;
            for (int j = 1; j <= n; j++) {
                if (word1[i - 1] == word2[j - 1]) {
                    cur[j] = prev[j - 1];
                } else {
                    cur[j] = 1 + Math.Min(prev[j], Math.Min(cur[j - 1], prev[j - 1]));
                }
            }
            (prev, cur) = (cur, prev);
        }
        return prev[n];
    }
}
```

### Go

```go
func Levenshtein(word1, word2 string) int {
    m, n := len(word1), len(word2)
    dp := make([][]int, m+1)
    for i := range dp {
        dp[i] = make([]int, n+1)
    }
    for i := 0; i <= m; i++ {
        dp[i][0] = i
    }
    for j := 0; j <= n; j++ {
        dp[0][j] = j
    }
    for i := 1; i <= m; i++ {
        for j := 1; j <= n; j++ {
            if word1[i-1] == word2[j-1] {
                dp[i][j] = dp[i-1][j-1]
            } else {
                dp[i][j] = 1 + min(dp[i-1][j], min(dp[i][j-1], dp[i-1][j-1]))
            }
        }
    }
    return dp[m][n]
}

func LevenshteinSpaceOptimized(word1, word2 string) int {
    if len(word1) < len(word2) {
        word1, word2 = word2, word1
    }
    m, n := len(word1), len(word2)
    prev := make([]int, n+1)
    cur := make([]int, n+1)
    for j := 0; j <= n; j++ {
        prev[j] = j
    }
    for i := 1; i <= m; i++ {
        cur[0] = i
        for j := 1; j <= n; j++ {
            if word1[i-1] == word2[j-1] {
                cur[j] = prev[j-1]
            } else {
                cur[j] = 1 + min(prev[j], min(cur[j-1], prev[j-1]))
            }
        }
        prev, cur = cur, prev
    }
    return prev[n]
}
```

## Complexity

| Version | Time | Space |
|---------|------|-------|
| 2D DP | O(m × n) | O(m × n) |
| Two-row optimization | O(m × n) | O(min(m, n)) |
| Ukkonen's cutoff | O(m × d) | O(m) | d = actual edit distance |

When `d` is small (typical typos), **Ukkonen's banded DP** stops early — used in production spell-checkers.

## Variants

| Variant | Difference |
|---------|------------|
| **Damerau-Levenshtein** | Adds transposition of adjacent chars (`ab` → `ba`) as one operation |
| **Weighted edit distance** | Different costs for insert / delete / replace |
| **Longest Common Subsequence** | Related: `m + n - 2×LCS` for insert/delete-only distance |

## Real World

- **Hunspell / SymSpell / BK-trees** — index dictionary words for fast fuzzy lookup by edit distance
- **Elasticsearch fuzzy queries** — Levenshtein-based matching with configurable fuzziness
- **Genomics** — alignment tools use edit-distance generalizations with scoring matrices (BLOSUM, PAM)
- **OCR post-processing** — correct recognized text against a lexicon

## Summary

Edit distance is the workhorse of fuzzy string comparison. Fill `dp[i][j]` from three neighbors — delete, insert, replace — and backtrack for the actual edit script.

Every time your phone fixes a typo, Levenshtein (or a close cousin) is likely in the loop.

::: tip Project Lab
**Build it yourself:** [Text Editor Engine](/projects/tier-4/20-text-editor-engine)
:::

**Next:** [37 - Matrix Chain Multiplication](37-matrix-chain-multiplication.md)