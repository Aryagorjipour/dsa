# 38 - Longest Increasing Subsequence (LIS)

## The Problem

Given an array of integers, find the **length** of the longest **strictly increasing subsequence** (not necessarily contiguous).

**Example:** `[10, 9, 2, 5, 3, 7, 101, 18]` → length **4** (e.g. `[2, 3, 7, 101]`).

### Canonical Problem 1: LIS Length

Return the maximum length only.

### Canonical Problem 2: Reconstruct One LIS

Return an actual subsequence achieving that length.

### Canonical Problem 3: Number of LIS

Count how many distinct subsequences have the maximum length (harder — needs extra DP state).

## Why It Matters

- **Patience sorting** — the O(n log n) algorithm is literally the card game "patience"
- **Stock analysis** — longest increasing price subsequence models upward trends
- **Version control** — patience diff uses LIS to find longest unchanged lines between file versions
- **Envelope nesting** — classic interview variant (2D LIS)
- **Sequence DP foundation** — many harder problems reduce to or extend LIS

## Approach 1: DP O(n²)

`dp[i]` = length of longest increasing subsequence **ending at index** `i`.

```
dp[i] = 1 + max(dp[j]) for all j < i where nums[j] < nums[i]
answer = max(dp[i])
```

### C# O(n²)

```csharp
public static int LengthOfLISQuadratic(int[] nums) {
    int n = nums.Length;
    int[] dp = new int[n];
    Array.Fill(dp, 1);
    int best = 1;
    for (int i = 1; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                dp[i] = Math.Max(dp[i], dp[j] + 1);
            }
        }
        best = Math.Max(best, dp[i]);
    }
    return best;
}
```

### Go O(n²)

```go
func LengthOfLISQuadratic(nums []int) int {
    n := len(nums)
    dp := make([]int, n)
    for i := range dp {
        dp[i] = 1
    }
    best := 1
    for i := 1; i < n; i++ {
        for j := 0; j < i; j++ {
            if nums[j] < nums[i] {
                dp[i] = max(dp[i], dp[j]+1)
            }
        }
        best = max(best, dp[i])
    }
    return best
}
```

## Approach 2: Patience Sorting O(n log n)

Maintain `tails[len]` = smallest possible tail value of an increasing subsequence of length `len`.

For each `num`:

1. Binary-search `tails` for the leftmost position where `tails[pos] >= num`
2. If `pos == len(tails)`, append (we extended the LIS)
3. Else replace `tails[pos] = num` (better tail for that length)

The length of `tails` at the end is the LIS length.

**Why it works:** `tails` is always sorted. Replacing with a smaller tail keeps more options open for future elements without shortening any achievable length.

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

public static List<int> ReconstructLIS(int[] nums) {
    int n = nums.Length;
    int[] dp = new int[n];
    int[] prev = new int[n];
    Array.Fill(dp, 1);
    Array.Fill(prev, -1);
    int bestIdx = 0;

    for (int i = 1; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i] && dp[j] + 1 > dp[i]) {
                dp[i] = dp[j] + 1;
                prev[i] = j;
            }
        }
        if (dp[i] > dp[bestIdx]) bestIdx = i;
    }

    var lis = new List<int>();
    for (int cur = bestIdx; cur != -1; cur = prev[cur]) {
        lis.Add(nums[cur]);
    }
    lis.Reverse();
    return lis;
}
```

### Go O(n log n)

```go
func LengthOfLIS(nums []int) int {
    tails := []int{}
    for _, num := range nums {
        idx := sort.SearchInts(tails, num)
        if idx == len(tails) {
            tails = append(tails, num)
        } else {
            tails[idx] = num
        }
    }
    return len(tails)
}

func ReconstructLIS(nums []int) []int {
    n := len(nums)
    dp := make([]int, n)
    prev := make([]int, n)
    for i := range dp {
        dp[i] = 1
        prev[i] = -1
    }
    bestIdx := 0
    for i := 1; i < n; i++ {
        for j := 0; j < i; j++ {
            if nums[j] < nums[i] && dp[j]+1 > dp[i] {
                dp[i] = dp[j] + 1
                prev[i] = j
            }
        }
        if dp[i] > dp[bestIdx] {
            bestIdx = i
        }
    }
    lis := []int{}
    for cur := bestIdx; cur != -1; cur = prev[cur] {
        lis = append(lis, nums[cur])
    }
    for l, r := 0, len(lis)-1; l < r; l, r = l+1, r-1 {
        lis[l], lis[r] = lis[r], lis[l]
    }
    return lis
}
```

Add `import "sort"` for `sort.SearchInts`.

## Complexity

| Approach | Time | Space | Reconstruct? |
|----------|------|-------|--------------|
| DP ending-at-i | O(n²) | O(n) | Yes (with `prev[]`) |
| Patience / tails | O(n log n) | O(n) | Length only (reconstruct needs extra structure) |
| Reconstruct LIS | O(n²) | O(n) | Yes |

## Real World

- **Git patience diff** — find longest runs of unchanged lines between two files
- **Scheduling** — longest chain of compatible jobs by deadline or priority
- **Bioinformatics** — longest increasing motif subsequence in gene expression data
- **Competitive programming** — Russian doll envelopes, box stacking variants

## Summary

LIS demonstrates **two paradigms in one problem**: classic O(n²) DP on endings, and the beautiful O(n log n) patience-sorting method with binary search on `tails`.

Know both — interviews often ask for the optimal version after the quadratic warm-up.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

**Next:** [39 - Knuth-Morris-Pratt (KMP)](39-kmp.md)