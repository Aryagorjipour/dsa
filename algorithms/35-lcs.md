# 35 - Longest Common Subsequence (LCS)

## The Problem

Given two strings `X` and `Y`, find the **longest subsequence** present in both. A subsequence keeps relative order but need not be contiguous.

**Example:**

```
X = "AGGTAB"
Y = "GXTXAYB"
LCS = "GTAB" (length 4)
```

### Canonical Problem 1: LCS Length

Return the length of the longest common subsequence.

### Canonical Problem 2: Reconstruct the LCS String

Backtrack through the DP table to print one optimal subsequence.

### Canonical Problem 3: Shortest Common Supersequence

Minimum-length string containing both `X` and `Y` as subsequences — length = `m + n - LCS(X, Y)`.

## Why It Matters

- **Diff tools** — `diff`, Git, and merge algorithms use LCS-family ideas to find unchanged regions
- **DNA sequence comparison** — align genes by longest matching subsequences
- **Plagiarism detection** — measure similarity between documents
- **Version control** — three-way merge and patch generation
- **Edit distance** — closely related (LCS + edits = transformation cost)

Production diff tools (Myers diff, patience diff) add heuristics, but the core insight is LCS-style DP on two sequences.

## DP State & Recurrence

`dp[i][j]` = LCS length of `X[0..i-1]` and `Y[0..j-1]`.

```
if X[i-1] == Y[j-1]:
    dp[i][j] = dp[i-1][j-1] + 1
else:
    dp[i][j] = max(dp[i-1][j], dp[i][j-1])
```

## Full Implementation

### C#

```csharp
public static class LCS {
    public static int Length(string x, string y) {
        int m = x.Length, n = y.Length;
        int[,] dp = new int[m + 1, n + 1];

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (x[i - 1] == y[j - 1]) {
                    dp[i, j] = dp[i - 1, j - 1] + 1;
                } else {
                    dp[i, j] = Math.Max(dp[i - 1, j], dp[i, j - 1]);
                }
            }
        }
        return dp[m, n];
    }

    public static string Reconstruct(string x, string y) {
        int m = x.Length, n = y.Length;
        int[,] dp = new int[m + 1, n + 1];
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (x[i - 1] == y[j - 1]) {
                    dp[i, j] = dp[i - 1, j - 1] + 1;
                } else {
                    dp[i, j] = Math.Max(dp[i - 1, j], dp[i, j - 1]);
                }
            }
        }

        var sb = new System.Text.StringBuilder();
        int ii = m, jj = n;
        while (ii > 0 && jj > 0) {
            if (x[ii - 1] == y[jj - 1]) {
                sb.Append(x[ii - 1]);
                ii--; jj--;
            } else if (dp[ii - 1, jj] >= dp[ii, jj - 1]) {
                ii--;
            } else {
                jj--;
            }
        }
        char[] chars = sb.ToString().ToCharArray();
        Array.Reverse(chars);
        return new string(chars);
    }

    // Space-optimized: O(min(m,n)) using two rows
    public static int LengthSpaceOptimized(string x, string y) {
        if (x.Length < y.Length) (x, y) = (y, x);
        int m = x.Length, n = y.Length;
        int[] prev = new int[n + 1];
        int[] cur = new int[n + 1];

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (x[i - 1] == y[j - 1]) {
                    cur[j] = prev[j - 1] + 1;
                } else {
                    cur[j] = Math.Max(prev[j], cur[j - 1]);
                }
            }
            (prev, cur) = (cur, prev);
            Array.Clear(cur, 0, cur.Length);
        }
        return prev[n];
    }
}
```

### Go

```go
func LCSLength(x, y string) int {
    m, n := len(x), len(y)
    dp := make([][]int, m+1)
    for i := range dp {
        dp[i] = make([]int, n+1)
    }
    for i := 1; i <= m; i++ {
        for j := 1; j <= n; j++ {
            if x[i-1] == y[j-1] {
                dp[i][j] = dp[i-1][j-1] + 1
            } else {
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
            }
        }
    }
    return dp[m][n]
}

func LCSReconstruct(x, y string) string {
    m, n := len(x), len(y)
    dp := make([][]int, m+1)
    for i := range dp {
        dp[i] = make([]int, n+1)
    }
    for i := 1; i <= m; i++ {
        for j := 1; j <= n; j++ {
            if x[i-1] == y[j-1] {
                dp[i][j] = dp[i-1][j-1] + 1
            } else {
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
            }
        }
    }

    result := make([]byte, 0, dp[m][n])
    i, j := m, n
    for i > 0 && j > 0 {
        if x[i-1] == y[j-1] {
            result = append(result, x[i-1])
            i--
            j--
        } else if dp[i-1][j] >= dp[i][j-1] {
            i--
        } else {
            j--
        }
    }
    for l, r := 0, len(result)-1; l < r; l, r = l+1, r-1 {
        result[l], result[r] = result[r], result[l]
    }
    return string(result)
}
```

## Complexity

| Version | Time | Space |
|---------|------|-------|
| 2D DP | O(m × n) | O(m × n) |
| Two-row optimization | O(m × n) | O(min(m, n)) |
| Reconstruction | O(m × n) build + O(m + n) backtrack | O(m × n) |

For very long strings, **Hirschberg's algorithm** computes one LCS in O(m × n) time with O(min(m, n)) space — used in advanced diff engines.

## Real World

- **Git / diff / patch** — highlight lines or tokens that match between versions
- **Bioinformatics** — MSA (multiple sequence alignment) builds on pairwise LCS / alignment
- **Spell-check suggestions** — combined with edit distance for fuzzy matching
- **Data deduplication** — find common chunks between files

## Relationship to Edit Distance

For strings of lengths `m` and `n` with LCS length `L`:

```
Levenshtein distance (insert + delete only) = m + n - 2L
Full Levenshtein (with replace) ≤ m + n - L
```

LCS and edit distance share the same 2D DP grid shape — the recurrence differs only in the cost model.

## Summary

LCS is the classic **two-sequence DP**: match characters diagonally, otherwise take the best of up or left. It powers text differencing and is the gateway to edit distance and sequence alignment.

::: tip Project Lab
**Build it yourself:** [DP Toolkit](/projects/tier-3/14-dp-toolkit)
:::

**Next:** [36 - Edit Distance (Levenshtein)](36-edit-distance.md)