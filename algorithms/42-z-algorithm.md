# 42 - Z-Algorithm

## The Problem

For a string `S`, compute the **Z-array**: `Z[i]` = length of the longest substring starting at position `i` that matches a prefix of `S` (`Z[0]` is typically unused or set to 0).

### Canonical Problem 1: Pattern Matching

Concatenate `pattern + "$" + text` (separator not in alphabet). Compute Z-array. Every index where `Z[i] == pattern.Length` is a match in the text.

### Canonical Problem 2: String Period

Find the smallest period `p` such that `S` repeats — related to `Z[n - p]`.

### Canonical Problem 3: Count Prefix Matches at Each Position

Z-array directly gives, for every suffix `S[i..]`, how many characters match `S` from the start.

## Why Z-Algorithm Exists

Z-algorithm achieves **O(n + m)** pattern matching with clean, linear preprocessing — an elegant alternative to KMP. The Z-box technique (`[l, r]` window of trust) is easier for some learners than LPS tables.

Used in:

- Exact string matching
- Finding string periods and borders
- Some bioinformatics exact-match pipelines
- Competitive programming as a Swiss-army linear string tool

## How the Z-Algorithm Works

Maintain a Z-box `[l, r]` — the substring `S[l..r]` matches `S[0..r-l]`.

For each `i`:

1. If `i <= r`, seed `Z[i] = min(r - i + 1, Z[i - l])`
2. Extend by comparing `S[Z[i]]` with `S[i + Z[i]]` while equal
3. If the new match exceeds `r`, update `l = i`, `r = i + Z[i] - 1`

## Full Implementation

### C#

```csharp
public static class ZAlgorithm {
    public static int[] ComputeZ(string s) {
        int n = s.Length;
        int[] z = new int[n];
        int l = 0, r = 0;
        for (int i = 1; i < n; i++) {
            if (i <= r) {
                z[i] = Math.Min(r - i + 1, z[i - l]);
            }
            while (i + z[i] < n && s[z[i]] == s[i + z[i]]) {
                z[i]++;
            }
            if (i + z[i] - 1 > r) {
                l = i;
                r = i + z[i] - 1;
            }
        }
        return z;
    }

    public static List<int> SearchAll(string text, string pattern) {
        var matches = new List<int>();
        if (pattern.Length == 0) return matches;

        string combined = pattern + "\0" + text;
        int[] z = ComputeZ(combined);
        int m = pattern.Length;

        for (int i = m + 1; i < combined.Length; i++) {
            if (z[i] == m) {
                matches.Add(i - m - 1);
            }
        }
        return matches;
    }

    public static int SearchFirst(string text, string pattern) {
        var all = SearchAll(text, pattern);
        return all.Count > 0 ? all[0] : -1;
    }

    public static int SmallestPeriod(string s) {
        int n = s.Length;
        int[] z = ComputeZ(s);
        for (int p = 1; p < n; p++) {
            if (n % p == 0 && z[n - p] >= p) {
                return p;
            }
        }
        return n;
    }
}
```

### Go

```go
func ComputeZ(s string) []int {
    n := len(s)
    z := make([]int, n)
    l, r := 0, 0
    for i := 1; i < n; i++ {
        if i <= r {
            z[i] = min(r-i+1, z[i-l])
        }
        for i+z[i] < n && s[z[i]] == s[i+z[i]] {
            z[i]++
        }
        if i+z[i]-1 > r {
            l = i
            r = i + z[i] - 1
        }
    }
    return z
}

func ZSearchAll(text, pattern string) []int {
    if len(pattern) == 0 {
        return nil
    }
    combined := pattern + "\x00" + text
    z := ComputeZ(combined)
    m := len(pattern)
    matches := []int{}
    for i := m + 1; i < len(combined); i++ {
        if z[i] == m {
            matches = append(matches, i-m-1)
        }
    }
    return matches
}

func ZSearchFirst(text, pattern string) int {
    matches := ZSearchAll(text, pattern)
    if len(matches) == 0 {
        return -1
    }
    return matches[0]
}

func SmallestPeriod(s string) int {
    n := len(s)
    z := ComputeZ(s)
    for p := 1; p < n; p++ {
        if n%p == 0 && z[n-p] >= p {
            return p
        }
    }
    return n
}
```

Use a separator byte (`\0`) guaranteed not to appear in `text` or `pattern` for byte-oriented matching.

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| Compute Z-array | O(n) | O(n) |
| Pattern matching | O(n + m) | O(n + m) |
| Period detection | O(n) | O(n) |

Each character moves the right boundary `r` at most once — total work is linear.

## Real World

- **String period detection** — compression and periodicity analysis
- **Exact matching pipelines** — alternative to KMP in bioinformatics libraries
- **Competitive programming** — border / prefix-suffix problems reduce to Z
- **Plagiarism / duplicate detection** — find repeated blocks via Z on concatenated strings

## Z vs KMP

| Aspect | Z-Algorithm | KMP |
|--------|-------------|-----|
| Preprocessing | Z on combined string | LPS on pattern only |
| Time | O(n + m) | O(n + m) |
| Concept | Z-box `[l, r]` | LPS failure links |
| Extra uses | Periods, borders | Failure links → Aho-Corasick |

Both are linear and deterministic — choose based on problem shape.

## Summary

The Z-algorithm computes longest prefix matches for every suffix in O(n). Glue `pattern + sep + text`, scan for `Z[i] == m`, and you have O(n + m) exact pattern matching without an LPS table.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

**Next:** [43 - Aho-Corasick](43-aho-corasick.md)