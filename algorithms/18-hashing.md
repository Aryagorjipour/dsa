# 18 - Hashing (Deep Dive)

## The Problem Hashing Solves

Achieve **average O(1)** insert, lookup, and delete by mapping keys to array indices with a hash function.

### Canonical Problem: Two Sum

Given integers and a target, return indices of two numbers that sum to target. Naive O(n²). With a hash map: O(n).

## How Hashing Works

1. **Hash function** maps key → integer index.
2. **Collision resolution**: chaining (buckets of lists) or open addressing (probe sequence).
3. **Resize** when load factor exceeds threshold (typically 0.7–0.75).

## Complexity

| Operation | Average | Worst |
|-----------|---------|-------|
| Insert | O(1) | O(n) |
| Lookup | O(1) | O(n) |
| Delete | O(1) | O(n) |

Worst case with pathological collisions; .NET and Go use randomized hashing to mitigate HashDoS.

## Full Implementation

### C# — Two Sum

```csharp
public int[] TwoSum(int[] nums, int target) {
    var map = new Dictionary<int, int>();
    for (int i = 0; i < nums.Length; i++) {
        int need = target - nums[i];
        if (map.TryGetValue(need, out int j))
            return new[] { j, i };
        map[nums[i]] = i;
    }
    return new[] { -1, -1 };
}
```

### Go — Two Sum

```go
func TwoSum(nums []int, target int) [2]int {
    seen := make(map[int]int)
    for i, x := range nums {
        if j, ok := seen[target-x]; ok {
            return [2]int{j, i}
        }
        seen[x] = i
    }
    return [2]int{-1, -1}
}
```

### C# — FNV-1a hash (educational)

```csharp
public static uint Fnv1a(ReadOnlySpan<byte> data) {
    uint hash = 2166136261;
    foreach (byte b in data) {
        hash ^= b;
        hash *= 16777619;
    }
    return hash;
}
```

### Go — deduplication with map set

```go
func UniqueStrings(items []string) []string {
    seen := make(map[string]struct{})
    out := make([]string, 0, len(items))
    for _, s := range items {
        if _, ok := seen[s]; ok {
            continue
        }
        seen[s] = struct{}{}
        out = append(out, s)
    }
    return out
}
```

## Real World

- `Dictionary` / `HashSet` in .NET; maps in Go
- LRU caches, consistent hashing, bloom filters
- Deduplication in logs, crawlers, ETL pipelines
- Group anagrams, subarray sum equals k

## Summary

Hashing is the foundation for hash maps, sets, caches, and probabilistic structures. Master Two Sum and dedup patterns first.

::: tip Project Lab
**Build it yourself:** [Hash Map from Scratch](/projects/tier-1/04-hash-map-from-scratch) — FNV-1a, collision resolution, and resizing.
:::

**Next:** [19 - Quickselect](19-quickselect.md)