# 33 - Dynamic Programming Fundamentals

## The Problem DP Solves

**Problem: Solve optimization or counting problems where naive recursion revisits the same subproblems exponentially many times.**

Dynamic Programming (DP) turns exponential recursion into polynomial (or better) work by solving each subproblem once and reusing the answer.

DP is not a single algorithm — it is a **design pattern**: define state, write recurrence, fill a table (or memoize).

## When a Problem Is DP

Look for these signals:

| Signal | Meaning |
|--------|---------|
| Optimal substructure | Best answer for the whole problem uses best answers for subproblems |
| Overlapping subproblems | The same sub-state appears in many branches of recursion |
| Decision at each step | Take / skip, pick one of k choices, extend by one element |
| Min / max / count / yes-no | Classic DP question types |

If subproblems are independent and never overlap (e.g. merge sort subarrays), divide-and-conquer is enough — not DP.

## Two Ways to Write DP

### 1. Top-Down (Memoization + Recursion)

Recursively define the answer; cache results in a hash map or array.

### 2. Bottom-Up (Tabulation)

Fill a table iteratively from base cases upward. Often faster (no recursion overhead) and avoids stack overflow.

Bottom-up is preferred in interviews and production when the state space is a simple grid or 1D array.

## Canonical Problem 1: Fibonacci with Memo

Naive `fib(n)` is O(2ⁿ). With memo or tabulation it is O(n).

### Canonical Problem 2: Climbing Stairs

You can climb 1 or 2 steps at a time. How many distinct ways to reach step `n`?

`dp[i] = dp[i-1] + dp[i-2]` — same recurrence as Fibonacci.

### Canonical Problem 3: Coin Change (Minimum Coins)

Given coin denominations and amount `A`, find the fewest coins to make `A` (or -1 if impossible).

`dp[a] = min over each coin c of (1 + dp[a - c])`.

## State Design — The Hardest Part

The key skill is defining **state** that captures every decision that still matters:

| State | Typical meaning |
|-------|-----------------|
| `dp[i]` | Answer using first `i` elements |
| `dp[i][j]` | Answer for first `i` items with capacity / second dimension `j` |
| `dp[i][j][k]` | Three-way decisions (harder problems) |

Then write the recurrence: how does `dp[i]` relate to smaller indices?

## Full Implementation

### C#

```csharp
public static class DPFundamentals {
    // Top-down Fibonacci
    public static int FibMemo(int n, Dictionary<int, int>? memo = null) {
        memo ??= new Dictionary<int, int>();
        if (n <= 1) return n;
        if (memo.TryGetValue(n, out int cached)) return cached;
        int result = FibMemo(n - 1, memo) + FibMemo(n - 2, memo);
        memo[n] = result;
        return result;
    }

    // Bottom-up Climbing Stairs
    public static int ClimbStairs(int n) {
        if (n <= 2) return n;
        int prev2 = 1, prev1 = 2;
        for (int i = 3; i <= n; i++) {
            int cur = prev1 + prev2;
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }

    // Bottom-up Coin Change (min coins)
    public static int CoinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Array.Fill(dp, amount + 1);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++) {
            foreach (int c in coins) {
                if (c <= a) {
                    dp[a] = Math.Min(dp[a], 1 + dp[a - c]);
                }
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }

    // House Robber: max value without robbing adjacent houses
    public static int HouseRobber(int[] nums) {
        int prev2 = 0, prev1 = 0;
        foreach (int x in nums) {
            int cur = Math.Max(prev1, prev2 + x);
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
}
```

### Go

```go
func FibMemo(n int, memo map[int]int) int {
    if memo == nil {
        memo = make(map[int]int)
    }
    if n <= 1 {
        return n
    }
    if v, ok := memo[n]; ok {
        return v
    }
    result := FibMemo(n-1, memo) + FibMemo(n-2, memo)
    memo[n] = result
    return result
}

func ClimbStairs(n int) int {
    if n <= 2 {
        return n
    }
    prev2, prev1 := 1, 2
    for i := 3; i <= n; i++ {
        cur := prev1 + prev2
        prev2, prev1 = prev1, cur
    }
    return prev1
}

func CoinChange(coins []int, amount int) int {
    dp := make([]int, amount+1)
    for i := 1; i <= amount; i++ {
        dp[i] = amount + 1
    }
    for a := 1; a <= amount; a++ {
        for _, c := range coins {
            if c <= a {
                dp[a] = min(dp[a], 1+dp[a-c])
            }
        }
    }
    if dp[amount] > amount {
        return -1
    }
    return dp[amount]
}

func HouseRobber(nums []int) int {
    prev2, prev1 := 0, 0
    for _, x := range nums {
        cur := max(prev1, prev2+x)
        prev2, prev1 = prev1, cur
    }
    return prev1
}
```

## Complexity

| Problem | Time | Space | Notes |
|---------|------|-------|-------|
| Fibonacci (memo / tab) | O(n) | O(n) memo or O(1) rolling | Classic overlap demo |
| Climbing Stairs | O(n) | O(1) | Two-variable rolling DP |
| Coin Change | O(amount × \|coins\|) | O(amount) | Unbounded knapsack variant |
| House Robber | O(n) | O(1) | 1D linear DP |

## Real World

- **Spell checkers** — edit distance (next chapters) is DP on two strings.
- **Bioinformatics** — sequence alignment (LCS, edit distance) powers BLAST-style tools.
- **Compiler optimization** — register allocation and instruction scheduling use DP on graphs.
- **Finance / operations** — knapsack-style resource allocation under budgets.
- **Game AI** — value iteration and some path-cost DP on grids.

## How to Approach a New DP Problem

1. **Define state** — what information uniquely describes a subproblem?
2. **Base cases** — smallest subproblems with known answers.
3. **Recurrence** — how does state `i` (or `i,j`) depend on smaller states?
4. **Iteration order** — ensure dependencies are computed before use.
5. **Answer location** — often `dp[n]`, `dp[n][W]`, or max over all `dp[i]`.
6. **Space optimize** — if only previous row/layer matters, roll to 1D.

## Summary

DP is recursion plus caching, or bottom-up tabulation. Master **state definition** and recurrences — the rest is implementation detail.

The next chapters apply these ideas to the canonical 2D problems: knapsack, LCS, edit distance, and beyond.

::: tip Project Lab
**Build it yourself:** [Dynamic Programming Toolkit](/projects/tier-3/14-dp-toolkit) — knapsack, LCS, edit distance, and LIS in one CLI.
:::

**Next:** [34 - 0/1 Knapsack](34-0-1-knapsack.md)