# 40 - Rabin-Karp

## The Problem

Find all occurrences of a **pattern** `P` in **text** `T` using **rolling hash** instead of character-by-character comparison at every position.

When two hash values match, **verify** the actual substring (hashes can collide).

### Canonical Problem 1: Single-Pattern Search

Return all start indices where `P` appears in `T`.

### Canonical Problem 2: Rolling Hash Update

Given hash of `T[i..i+m-1]`, compute hash of `T[i+1..i+m]` in O(1).

### Canonical Problem 3: Find Duplicate Substrings (Variant)

Use Rabin-Karp + binary search on length to detect repeated substrings in a string.

## The Key Insight

Treat a length-`m` substring as a base-`B` number modulo prime `M`:

```
hash("abc") = (a×B² + b×B + c) mod M
```

Slide the window by **subtracting the leading digit, multiplying by B, adding the trailing digit** — all in O(1).

Hash equality is a fast filter; confirm with direct string compare to handle collisions.

## Full Implementation

### C#

```csharp
public static class RabinKarp {
    private const long Base = 256;
    private const long Mod = 1_000_000_007;

    public static List<int> SearchAll(string text, string pattern) {
        var matches = new List<int>();
        int n = text.Length, m = pattern.Length;
        if (m == 0 || m > n) return matches;

        long patternHash = 0, windowHash = 0, power = 1;
        for (int i = 0; i < m - 1; i++) {
            power = power * Base % Mod;
        }
        for (int i = 0; i < m; i++) {
            patternHash = (patternHash * Base + pattern[i]) % Mod;
            windowHash = (windowHash * Base + text[i]) % Mod;
        }

        for (int i = 0; i <= n - m; i++) {
            if (windowHash == patternHash && text.AsSpan(i, m).SequenceEqual(pattern)) {
                matches.Add(i);
            }
            if (i < n - m) {
                windowHash = (windowHash - text[i] * power % Mod + Mod) % Mod;
                windowHash = (windowHash * Base + text[i + m]) % Mod;
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
const (
    rkBase = 256
    rkMod  = 1_000_000_007
)

func RabinKarpSearchAll(text, pattern string) []int {
    n, m := len(text), len(pattern)
    matches := []int{}
    if m == 0 || m > n {
        return matches
    }

    var patternHash, windowHash, power int64 = 0, 0, 1
    for i := 0; i < m-1; i++ {
        power = power * rkBase % rkMod
    }
    for i := 0; i < m; i++ {
        patternHash = (patternHash*rkBase + int64(pattern[i])) % rkMod
        windowHash = (windowHash*rkBase + int64(text[i])) % rkMod
    }

    for i := 0; i <= n-m; i++ {
        if windowHash == patternHash && text[i:i+m] == pattern {
            matches = append(matches, i)
        }
        if i < n-m {
            windowHash = (windowHash - int64(text[i])*power%rkMod + rkMod) % rkMod
            windowHash = (windowHash*rkBase + int64(text[i+m])) % rkMod
        }
    }
    return matches
}

func RabinKarpSearchFirst(text, pattern string) int {
    matches := RabinKarpSearchAll(text, pattern)
    if len(matches) == 0 {
        return -1
    }
    return matches[0]
}
```

## Complexity

| Case | Time | Space | Notes |
|------|------|-------|-------|
| Average | O(n + m) | O(1) | Few hash collisions |
| Worst | O(n × m) | O(1) | All hashes collide — rare with good mod |
| Preprocessing | O(m) | O(1) | Compute initial hashes and `B^(m-1)` |

Use a large prime modulus (or double hashing with two moduli) to drive collision probability negligible in practice.

## Real World

- **Plagiarism detection** — fingerprint document chunks by hash; compare at scale
- **Git / rsync** — rolling checksums (Rabin fingerprint) for delta compression
- **2D image search** — hash rows/columns for template matching
- **DNA k-mer indexing** — hash fixed-length motifs for quick screening
- **Multiple pattern search** — hash all patterns once; check set membership per window

## Comparison

| Algorithm | Deterministic? | Multi-pattern | 2D extension |
|-----------|----------------|---------------|--------------|
| KMP | Yes | Run k times | Harder |
| **Rabin-Karp** | Average case | Natural with hash set | Straightforward |
| Boyer-Moore | Yes | Run k times | Exists but complex |
| Aho-Corasick | Yes | Built for many patterns | Specialized |

## Collision Handling

Always verify on hash match:

```csharp
if (windowHash == patternHash && text.AsSpan(i, m).SequenceEqual(pattern))
```

For adversarial input, use **two independent moduli** — both must match before verify.

## Summary

Rabin-Karp replaces expensive substring comparisons with O(1) rolling hash updates. Hash match → verify. Simple, generalizes to 2D and multiple patterns, and underpins real fingerprinting systems.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Full-Text Search Engine](/projects/tier-3/13-full-text-search-engine)
:::

**Next:** [41 - Boyer-Moore](41-boyer-moore.md)