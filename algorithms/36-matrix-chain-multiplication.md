# 36 - Matrix Chain Multiplication

## The Problem

Given a chain of matrices to multiply: A1 (p0 x p1), A2 (p1 x p2), ..., An (p(n-1) x pn)

Find the **minimum number of scalar multiplications** needed to compute the product, and the optimal parenthesization.

Matrix multiplication is associative but cost depends heavily on order.

Example: A(10x30) * B(30x5) * C(5x60)

Different parenthesizations have vastly different costs.

## Full DP

`dp[i][j]` = min cost to multiply matrices from i to j

Recurrence:
dp[i][j] = min over k ( dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j] )

## Detailed Implementation

### C#

```csharp
public static int MatrixChainOrder(int[] p) {
    int n = p.Length - 1; // n matrices
    int[,] dp = new int[n + 1, n + 1];

    for (int len = 2; len <= n; len++) {  // chain length
        for (int i = 1; i <= n - len + 1; i++) {
            int j = i + len - 1;
            dp[i, j] = int.MaxValue;
            for (int k = i; k < j; k++) {
                int cost = dp[i, k] + dp[k + 1, j] + p[i - 1] * p[k] * p[j];
                if (cost < dp[i, j]) dp[i, j] = cost;
            }
        }
    }
    return dp[1, n];
}
```

Go version similar.

Also implement printing the optimal parenthesization using another table.

## Real World

- Compiler optimization of expression trees
- Scientific computing (tensor contractions)
- Database query optimization (join ordering is similar DP)

This is one of the most beautiful introductory DP optimization problems.
