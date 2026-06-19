# 33 - 0/1 Knapsack

## The Classic Problem That Defines DP

**Problem Statement (The Thief's Knapsack)**

A thief has a knapsack of capacity W.
There are n items, each with weight w[i] and value v[i].
The thief can take each item **at most once** (0 or 1).
Maximize total value without exceeding capacity.

This is the canonical 0/1 Knapsack problem.

## Why It Exists

It models resource allocation under constraints:
- Cloud cost optimization (pick VMs)
- Investment portfolio selection
- Cargo loading
- Feature selection in ML with resource limits

## Full DP Solution

### C#

```csharp
public static int Knapsack(int W, int[] weights, int[] values) {
    int n = weights.Length;
    int[,] dp = new int[n + 1, W + 1];

    for (int i = 1; i <= n; i++) {
        for (int w = 0; w <= W; w++) {
            if (weights[i - 1] <= w) {
                dp[i, w] = Math.Max(
                    values[i - 1] + dp[i - 1, w - weights[i - 1]],
                    dp[i - 1, w]
                );
            } else {
                dp[i, w] = dp[i - 1, w];
            }
        }
    }
    return dp[n, W];
}
```

### Go

Similar 2D slice.

## Optimizations

- Space optimize to 1D array O(W)
- Recover which items were chosen

## Complexity

O(n * W) time and space (pseudo-polynomial).

This is the foundation for many "DP on subsets with capacity".
