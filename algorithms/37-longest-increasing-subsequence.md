# 37 - Longest Increasing Subsequence (LIS)

## The Problem

Given an array of integers, find the length of the longest strictly increasing subsequence.

Example: [10,9,2,5,3,7,101,18] → 4 ([2,3,7,101])

Not necessarily contiguous.

## Why Important

- Patience sorting connection
- Stock trading (longest increasing price sequence)
- Many sequence problems in bioinformatics, version control diffs
- Foundation for other DP on sequences

## DP O(n²)

Standard: dp[i] = max length ending at i.

## Optimal O(n log n)

Use patience sorting / binary search on tails array.

### C# O(n log n)

```csharp
public static int LengthOfLIS(int[] nums) {
    List<int> tails = new();
    foreach (int num in nums) {
        int idx = tails.BinarySearch(num);
        if (idx < 0) idx = ~idx;
        if (idx == tails.Count) tails.Add(num);
        else tails[idx] = num;
    }
    return tails.Count;
}
```

This is a beautiful combination of DP + binary search.

Go has `sort.Search` equivalent.

## Full explanation of the O(n log n) method is required in the document.

This problem shows the power of combining paradigms.
