# 02 - Recursion and Memoization

## What is Recursion?

**Recursion** = a function that calls itself to solve smaller versions of the same problem.

It has two essential parts:

1. **Base case(s)** — when to stop
2. **Recursive case** — how to break the problem into smaller version(s) + combine results

Without a base case you get infinite recursion (stack overflow).

### Classic Example: Factorial

Mathematical definition:
```
n! = n × (n-1)!
0! = 1
```

Code:

**C#**

```csharp
long Factorial(int n) {
    if (n <= 1) return 1;           // base case
    return n * Factorial(n - 1);    // recursive case
}
```

**Go**

```go
func Factorial(n int) int {
    if n <= 1 {
        return 1
    }
    return n * Factorial(n-1)
}
```

### How the call stack works

Every recursive call adds a frame to the call stack.

For `Factorial(5)`:

```
Factorial(5)
  calls Factorial(4)
    calls Factorial(3)
      calls Factorial(2)
        calls Factorial(1) → returns 1
      returns 2
    returns 6
  returns 24
returns 120
```

Stack depth = n. For very deep recursion you can blow the stack.

### Tail Recursion (and why C#/Go usually don't optimize it)

If the recursive call is the **very last** thing the function does, some compilers can turn it into a loop (tail call optimization).

C# does **not** guarantee TCO in general (only in some IL cases with RyuJIT tricks).

Go does **not** do tail call optimization.

So write recursive code for clarity, but be careful with depth. For large depth, convert to iteration or increase stack (Go has `runtime/debug.SetMaxStack` but don't abuse it).

## Tree Recursion and Multiple Calls

Some problems branch:

```go
func Fib(n int) int {
    if n <= 1 { return n }
    return Fib(n-1) + Fib(n-2)   // two recursive calls
}
```

This is beautiful but **terrible** performance without memoization.

`Fib(40)` does millions of redundant calls.

## Memoization — "Remember What You Already Computed"

**Memoization** = cache the result of expensive function calls and return the cached result when the same inputs occur again.

This turns exponential time into linear (or polynomial) time for many problems.

### Top-Down Memoization (Recursive + Cache)

**C#**

```csharp
using System.Collections.Generic;

long Fib(int n, Dictionary<int, long>? memo = null) {
    memo ??= new Dictionary<int, long>();
    if (memo.ContainsKey(n)) return memo[n];
    if (n <= 1) return n;

    long result = Fib(n - 1, memo) + Fib(n - 2, memo);
    memo[n] = result;
    return result;
}
```

**Go**

```go
func Fib(n int, memo map[int]int) int {
    if memo == nil {
        memo = make(map[int]int)
    }
    if val, ok := memo[n]; ok {
        return val
    }
    if n <= 1 {
        return n
    }
    result := Fib(n-1, memo) + Fib(n-2, memo)
    memo[n] = result
    return result
}
```

### Bottom-Up DP (Iterative)

Often cleaner and avoids stack issues:

**C#**

```csharp
long FibBottomUp(int n) {
    if (n <= 1) return n;
    long prev2 = 0, prev1 = 1;
    for (int i = 2; i <= n; i++) {
        long current = prev1 + prev2;
        prev2 = prev1;
        prev1 = current;
    }
    return prev1;
}
```

This is actually just "dynamic programming" using the previous results. We'll dive deep into DP later.

## Real-World Uses of Recursion + Memoization

1. **Tree and Graph traversal** — DOM, file systems, org charts, ASTs in compilers.
2. **Backtracking** — Sudoku, N-Queens, word search, generating valid parentheses, regex engines.
3. **Divide and Conquer** — Merge sort, Quick sort, Fast Fourier Transform.
4. **Dynamic Programming problems** — Knapsack, edit distance, longest common subsequence, matrix chain, etc.
5. **Memoized web / API calls** — "Don't fetch the same user profile 40 times in one request".
6. **Game AI** — Minimax with alpha-beta + transposition tables (memo on board states).

## Memoization in Real Libraries

- Python has `@functools.lru_cache`
- .NET has `System.Runtime.Caching` + many people roll `ConcurrentDictionary` + factory for memo.
- Go: you usually roll your own with `sync.Map` or `map + mutex`, or use `golang.org/x/sync/singleflight` for deduping concurrent calls.

## Recursion vs Iteration — When to Choose

Use recursion when:
- The problem is naturally tree-like or self-similar.
- Code clarity is dramatically better.
- Depth is guaranteed to be small (or you use an explicit stack).

Use iteration when:
- You need to avoid stack overflow.
- Performance is critical and you can avoid function call overhead.
- The state is complex (hard to pass around in parameters).

Many professional codebases use recursion for tree walking and iteration + explicit stacks for safety on large data.

## Common Recursion Pitfalls

- Forgetting base case(s) → infinite recursion.
- Not passing memo/cache down.
- Mutating shared state across recursive calls without understanding.
- Assuming tail recursion will save you (it usually won't in C#/Go).

## Summary

Recursion = elegant way to express "solve smaller version of same problem".

Memoization = the superpower that makes many recursive solutions practical.

Together they are the foundation of:
- Divide and Conquer
- Dynamic Programming
- Backtracking
- Many beautiful algorithms we will see later.

Next up: Divide and Conquer.
