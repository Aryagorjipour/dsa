# 34 - 0/1 Knapsack

## The Problem

**Problem Statement (The Thief's Knapsack)**

A thief has a knapsack of capacity `W`. There are `n` items; item `i` has weight `w[i]` and value `v[i]`. Each item may be taken **at most once** (0 or 1). Maximize total value without exceeding capacity.

This is the canonical **0/1 Knapsack** — the foundation for subset selection under a weight budget.

### Canonical Problem 1: Maximum Value Under Capacity

Given weights, values, and capacity `W`, return the maximum achievable value.

### Canonical Problem 2: Which Items Were Taken?

Recover the actual subset of items that achieves the optimum (backtrack through the DP table or use a parallel `bool` table).

### Canonical Problem 3: Count of Ways (Variant)

How many subsets of items sum exactly to capacity `W`? Same table shape, but add counts instead of taking max.

## Why It Exists

It models resource allocation under hard constraints:

- Cloud cost optimization — pick VMs / services within a budget
- Investment portfolio — select assets with capital limits
- Cargo loading — maximize profit within weight limits
- Feature selection in ML — choose features under memory / latency caps

## DP State & Recurrence

`dp[i][w]` = maximum value using the first `i` items with capacity at most `w`.

For each item `i` at capacity `w`:

- **Skip:** `dp[i-1][w]`
- **Take** (if `w[i-1] <= w`): `v[i-1] + dp[i-1][w - w[i-1]]`

`dp[i][w] = max(skip, take)`.

## Full Implementation (2D Table)

### C#

```csharp
public static class Knapsack01 {
    public static int MaxValue(int W, int[] weights, int[] values) {
        int n = weights.Length;
        int[,] dp = new int[n + 1, W + 1];

        for (int i = 1; i <= n; i++) {
            for (int w = 0; w <= W; w++) {
                dp[i, w] = dp[i - 1, w];
                if (weights[i - 1] <= w) {
                    dp[i, w] = Math.Max(
                        dp[i, w],
                        values[i - 1] + dp[i - 1, w - weights[i - 1]]
                    );
                }
            }
        }
        return dp[n, W];
    }

    public static List<int> SelectedItems(int W, int[] weights, int[] values) {
        int n = weights.Length;
        int[,] dp = new int[n + 1, W + 1];
        for (int i = 1; i <= n; i++) {
            for (int w = 0; w <= W; w++) {
                dp[i, w] = dp[i - 1, w];
                if (weights[i - 1] <= w) {
                    dp[i, w] = Math.Max(
                        dp[i, w],
                        values[i - 1] + dp[i - 1, w - weights[i - 1]]
                    );
                }
            }
        }

        var taken = new List<int>();
        int wi = n, cap = W;
        while (wi > 0 && cap > 0) {
            if (dp[wi, cap] != dp[wi - 1, cap]) {
                taken.Add(wi - 1);
                cap -= weights[wi - 1];
            }
            wi--;
        }
        taken.Reverse();
        return taken;
    }

    // Space-optimized 1D version
    public static int MaxValue1D(int W, int[] weights, int[] values) {
        int[] dp = new int[W + 1];
        for (int i = 0; i < weights.Length; i++) {
            for (int w = W; w >= weights[i]; w--) {
                dp[w] = Math.Max(dp[w], values[i] + dp[w - weights[i]]);
            }
        }
        return dp[W];
    }
}
```

### Go

```go
func Knapsack(W int, weights, values []int) int {
    n := len(weights)
    dp := make([][]int, n+1)
    for i := range dp {
        dp[i] = make([]int, W+1)
    }
    for i := 1; i <= n; i++ {
        for w := 0; w <= W; w++ {
            dp[i][w] = dp[i-1][w]
            if weights[i-1] <= w {
                dp[i][w] = max(dp[i][w], values[i-1]+dp[i-1][w-weights[i-1]])
            }
        }
    }
    return dp[n][W]
}

func KnapsackSelectedItems(W int, weights, values []int) []int {
    n := len(weights)
    dp := make([][]int, n+1)
    for i := range dp {
        dp[i] = make([]int, W+1)
    }
    for i := 1; i <= n; i++ {
        for w := 0; w <= W; w++ {
            dp[i][w] = dp[i-1][w]
            if weights[i-1] <= w {
                dp[i][w] = max(dp[i][w], values[i-1]+dp[i-1][w-weights[i-1]])
            }
        }
    }

    taken := []int{}
    wi, cap := n, W
    for wi > 0 && cap > 0 {
        if dp[wi][cap] != dp[wi-1][cap] {
            taken = append(taken, wi-1)
            cap -= weights[wi-1]
        }
        wi--
    }
    for i, j := 0, len(taken)-1; i < j; i, j = i+1, j-1 {
        taken[i], taken[j] = taken[j], taken[i]
    }
    return taken
}

func Knapsack1D(W int, weights, values []int) int {
    dp := make([]int, W+1)
    for i := 0; i < len(weights); i++ {
        for w := W; w >= weights[i]; w-- {
            dp[w] = max(dp[w], values[i]+dp[w-weights[i]])
        }
    }
    return dp[W]
}
```

## Space Optimization

The 1D version iterates capacity **from W down to weight[i]** so each item is used at most once. Iterating upward would allow unlimited reuse (unbounded knapsack).

| Version | Space |
|---------|-------|
| 2D table | O(n × W) |
| 1D rolling | O(W) |

## Complexity

| Measure | Value | Notes |
|---------|-------|-------|
| Time | O(n × W) | Pseudo-polynomial — polynomial in numeric value of W |
| Space (2D) | O(n × W) | Enables item recovery |
| Space (1D) | O(W) | Value only |

When `W` is exponential in input size (e.g. W = 2ⁿ), this is still exponential overall — NP-hard problems don't get truly polynomial algorithms from DP alone.

## Real World

- **Bin packing / cargo** — airlines and shipping optimize load within weight limits.
- **Budget allocation** — pick projects or features maximizing ROI under a fixed budget.
- **Cryptography** — knapsack was once proposed as a public-key system (broken, but historically significant).
- **Subset sum** — special case where values equal weights; decision version is classic NP-complete.

## Common Variants

| Variant | Change |
|---------|--------|
| Unbounded knapsack | Each item usable unlimited times; iterate `w` ascending in 1D |
| Bounded knapsack | Each item has a quantity limit; binary split or separate loop |
| 0/1 subset sum | Values = weights; check if `dp[W]` is achievable |

## Summary

0/1 Knapsack is the template for **"pick a subset under capacity."** Define `dp[i][w]`, take or skip each item, then space-optimize to 1D when you only need the max value.

Master this table — LCS and edit distance use the same 2D grid thinking on sequences.

::: tip Project Lab
**Build it yourself:** [DP Toolkit](/projects/tier-3/14-dp-toolkit)
:::

**Next:** [35 - Longest Common Subsequence (LCS)](35-lcs.md)