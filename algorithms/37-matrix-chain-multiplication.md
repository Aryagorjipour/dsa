# 37 - Matrix Chain Multiplication

## The Problem

Given a chain of matrices to multiply: `A₁` (p₀ × p₁), `A₂` (p₁ × p₂), …, `Aₙ` (pₙ₋₁ × pₙ), find the **minimum number of scalar multiplications** needed to compute the product, and the optimal parenthesization.

Matrix multiplication is associative — `(AB)C` and `A(BC)` give the same result — but the **cost** depends heavily on order.

**Example:** `A(10×30) × B(30×5) × C(5×60)`

- `(AB)C`: 10×30×5 + 10×5×60 = **4,500**
- `A(BC)`: 30×5×60 + 10×30×60 = **27,000**

Same matrices, six-fold cost difference.

### Canonical Problem 1: Minimum Scalar Multiplications

Given dimension array `p` where matrix `i` has shape `p[i-1] × p[i]`, return minimum cost.

### Canonical Problem 2: Print Optimal Parenthesization

Output something like `((A1 A2) (A3 A4))` showing how to group multiplications.

### Canonical Problem 3: Evaluate a Given Parenthesization

Given explicit grouping, compute the actual multiplication cost — validates understanding of the cost formula.

## Why It Matters

- **Compiler optimization** — parenthesize expression trees for minimum temporaries
- **Scientific computing** — tensor contractions and linear algebra pipelines
- **Database query optimization** — join ordering is structurally similar DP (minimize intermediate row counts)
- **Graphics / ML** — chain many transformation or layer matrices efficiently

This is one of the most elegant introductory **interval DP** problems.

## DP State & Recurrence

`dp[i][j]` = minimum cost to multiply matrices `Aᵢ` through `Aⱼ` (1-indexed).

For chain length `len` from 2 to n, try every split point `k`:

```
dp[i][j] = min over i ≤ k < j of (
    dp[i][k] + dp[k+1][j] + p[i-1] * p[k] * p[j]
)
```

The last term is the cost of multiplying the two resulting subproducts.

## Full Implementation

### C#

```csharp
public static class MatrixChain {
    public static int MinCost(int[] p) {
        int n = p.Length - 1;
        int[,] dp = new int[n + 1, n + 1];

        for (int len = 2; len <= n; len++) {
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

    public static string OptimalParenthesization(int[] p) {
        int n = p.Length - 1;
        int[,] dp = new int[n + 1, n + 1];
        int[,] split = new int[n + 1, n + 1];

        for (int len = 2; len <= n; len++) {
            for (int i = 1; i <= n - len + 1; i++) {
                int j = i + len - 1;
                dp[i, j] = int.MaxValue;
                for (int k = i; k < j; k++) {
                    int cost = dp[i, k] + dp[k + 1, j] + p[i - 1] * p[k] * p[j];
                    if (cost < dp[i, j]) {
                        dp[i, j] = cost;
                        split[i, j] = k;
                    }
                }
            }
        }
        return BuildParen(split, 1, n);
    }

    private static string BuildParen(int[,] split, int i, int j) {
        if (i == j) return $"A{i}";
        int k = split[i, j];
        return $"({BuildParen(split, i, k)} {BuildParen(split, k + 1, j)})";
    }
}
```

### Go

```go
func MatrixChainOrder(p []int) int {
    n := len(p) - 1
    dp := make([][]int, n+1)
    for i := range dp {
        dp[i] = make([]int, n+1)
    }

    for length := 2; length <= n; length++ {
        for i := 1; i <= n-length+1; i++ {
            j := i + length - 1
            dp[i][j] = math.MaxInt32
            for k := i; k < j; k++ {
                cost := dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j]
                if cost < dp[i][j] {
                    dp[i][j] = cost
                }
            }
        }
    }
    return dp[1][n]
}

func MatrixChainParen(p []int) string {
    n := len(p) - 1
    dp := make([][]int, n+1)
    split := make([][]int, n+1)
    for i := range dp {
        dp[i] = make([]int, n+1)
        split[i] = make([]int, n+1)
    }

    for length := 2; length <= n; length++ {
        for i := 1; i <= n-length+1; i++ {
            j := i + length - 1
            dp[i][j] = math.MaxInt32
            for k := i; k < j; k++ {
                cost := dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j]
                if cost < dp[i][j] {
                    dp[i][j] = cost
                    split[i][j] = k
                }
            }
        }
    }
    return buildParen(split, 1, n)
}

func buildParen(split [][]int, i, j int) string {
    if i == j {
        return fmt.Sprintf("A%d", i)
    }
    k := split[i][j]
    return fmt.Sprintf("(%s %s)", buildParen(split, i, k), buildParen(split, k+1, j))
}
```

Add `import ("fmt"; "math")` in a real Go file.

## Complexity

| Measure | Value | Notes |
|---------|-------|-------|
| Time | O(n³) | Three nested loops: length, start, split |
| Space | O(n²) | `dp` and `split` tables |
| Brute force | Ω(2ⁿ⁻¹ / n) | Catalan-number parenthesizations |

## Interval DP Pattern

Matrix chain multiplication is the template for **"best way to split an interval"**:

| Problem | Interval | Split cost |
|---------|----------|------------|
| Matrix chain | `[i, j]` matrices | `p[i-1] × p[k] × p[j]` |
| Burst balloons | `[i, j]` balloons | varies |
| Optimal BST | keys `[i, j]` | search cost × frequency |
| Palindrome partitioning | substring `[i, j]` | cut cost |

Recognize: fill by **increasing interval length**, not by `i` alone.

## Real World

- **Query optimizers** — PostgreSQL and other databases reorder joins to minimize intermediate result sizes (same DP spirit)
- **GPU / SIMD pipelines** — order tensor contractions to reduce memory traffic
- **Symbolic math systems** — minimize operations in expression trees

## Summary

Matrix chain multiplication teaches **interval DP**: try every split `k`, combine optimal left and right subchains, add merge cost. Store `split[i][j]` to reconstruct the optimal parenthesization.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

**Next:** [38 - Longest Increasing Subsequence (LIS)](38-longest-increasing-subsequence.md)