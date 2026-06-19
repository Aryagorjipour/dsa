# 18 - Hashing (Deep Dive)

## The Problem Hashing Solves

**Problem: Achieve average O(1) time for insert, delete, and lookup by key without maintaining order.**

Hashing maps keys to array indices using a hash function.

### Classic Problem: Two Sum (Unsorted array)

Given an array of integers and a target, return indices of two numbers that add up to the target.

Naive O(n²). With hashing: O(n).

```csharp
// C#
public int[] TwoSum(int[] nums, int target) {
    var map = new Dictionary<int, int>();
    for (int i = 0; i < nums.Length; i++) {
        int complement = target - nums[i];
        if (map.ContainsKey(complement)) {
            return new int[] { map[complement], i };
        }
        map[nums[i]] = i;
    }
    return new int[] { -1, -1 };
}
```

Go version analogous using map.

## How Hashing Works in Detail

- Hash function: maps key → integer
- Collision resolution: chaining or open addressing
- Load factor and resizing

## Real World Problems Solved by Hashing

1. **Two Sum / Subarray Sum Equals K**
2. **Detect duplicate in array**
3. **Group anagrams** (hash by sorted chars or frequency signature)
4. **LRU Cache** (hash map + linked list)
5. **Consistent hashing** (later)
6. **Bloom filters** built on hashing ideas

## Hashing Pitfalls & Attacks

- Poor hash function → clustering
- HashDoS attacks (use randomized seeds, which .NET and Go do)

## Hashing in .NET and Go

- C# Dictionary / HashSet use open addressing + good hashers
- Go maps use advanced Swiss table style since recent versions

## Why Hashing Chapter Exists

It is the foundation for:
- HashSet / HashMap (data structures)
- Many string algorithms
- Caching
- Deduplication at scale

Master hashing here before advanced uses.
