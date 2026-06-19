# 41 - Z-Algorithm

## The Problem

**Efficiently find all occurrences of a pattern in a text** (or compute Z-array for a string).

Z-array: For string S, Z[i] = length of longest substring starting at i that matches a prefix of S.

### Canonical Use: Pattern Matching

Concatenate pattern + separator + text.
Compute Z-array on the combined string.
Whenever Z[i] == pattern length, a match is found at that position in text.

This gives O(n + m) time.

## Why Z-Algorithm Exists

Simpler than KMP in some ways, very elegant linear time string matching.

Used in:
- String matching
- Finding periods in strings
- Computing borders
- Some bioinformatics exact matching

## Full Implementation (Linear Time Z-Algorithm)

### C# (Standard O(n) Z-algorithm)

```csharp
public static int[] ZAlgorithm(string s) {
    int n = s.Length;
    int[] z = new int[n];
    int l = 0, r = 0;
    for (int i = 1; i < n; i++) {
        if (i < r) {
            z[i] = Math.Min(r - i, z[i - l]);
        }
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) {
            z[i]++;
        }
        if (i + z[i] > r) {
            l = i;
            r = i + z[i];
        }
    }
    return z;
}
```

Go version identical logic.

## Problems

- Pattern matching using Z
- Count occurrences of pattern
- Find all distinct substrings (with suffix structures too)

Z-algorithm is elegant and worth implementing from scratch.
