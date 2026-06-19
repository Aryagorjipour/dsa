# 01 - Big O Notation (and Friends) — How We Talk About Speed Without Lying

## Why We Need This

If I tell you "my function is fast", that is useless.

Fast on my laptop with 10 items? Or on a server with 10 million items under load?

Big O gives us a language to talk about **how the runtime or memory grows** as the input size grows — without caring about:
- Exact CPU speed
- Programming language
- Constant factors (mostly)

It is the **shape** of the growth curve.

## The Core Idea — Ignore Constants and Lower Terms

We care about the **dominant term** when input size `n` gets large.

Examples:

- `3n + 7` → O(n)
- `n² + 1000n + 99999` → O(n²)
- `2^n + n^100` → O(2^n) (exponential always wins)

We drop:
- Coefficients (the 3, 1000, 2)
- Lower-order terms

Because when `n` is 1,000,000, the highest growing part eats everything else.

## The Common Complexity Classes (From Fastest to Slowest)

| Name                  | Big O          | Real World Feeling                     | Example Operation                     |
|-----------------------|----------------|----------------------------------------|---------------------------------------|
| Constant              | O(1)           | "Instant", no matter how big           | Array access by index, hash map get   |
| Logarithmic           | O(log n)       | "Grows extremely slowly"               | Binary search, balanced tree lookup   |
| Linear                | O(n)           | "Twice as much data, twice as long"    | Loop through a list once              |
| Linearithmic          | O(n log n)     | "Pretty good for large data"           | Good sorting (Merge, Quick average)   |
| Quadratic             | O(n²)          | "Gets painful fast"                    | Nested loops, naive string matching   |
| Cubic                 | O(n³)          | "Only for tiny n"                      | Naive matrix multiply                 |
| Exponential           | O(2^n)         | "Explodes, only small n or clever DP"  | Naive recursive Fibonacci             |
| Factorial             | O(n!)          | "Basically impossible beyond ~20"      | Naive permutations                    |

## Visual Intuition (Approximate)

Imagine n = 1,000,000:

- O(1): 1 operation
- O(log n): ~20 operations
- O(n): 1,000,000 operations
- O(n log n): ~20,000,000 operations (still fine on modern hardware)
- O(n²): 1,000,000,000,000 operations → **a trillion** — too slow
- O(2^n): Insanely huge number. Game over.

This is why sorting 1 million items with O(n log n) is acceptable, but O(n²) sorting is not.

## How We Analyze Code — Step by Step

### Example 1: Simple Loop

```csharp
for (int i = 0; i < n; i++) {
    Console.WriteLine(arr[i]);
}
```

- The loop body runs exactly n times.
- Each iteration does O(1) work.
- Total: O(n)

### Example 2: Nested Loops

```csharp
for (int i = 0; i < n; i++) {
    for (int j = 0; j < n; j++) {
        // do something O(1)
    }
}
```

- Outer: n times
- Inner: n times per outer
- Total: n × n = O(n²)

### Example 3: Two Separate Loops

```go
for i := 0; i < n; i++ { ... }   // O(n)
for i := 0; i < n; i++ { ... }   // O(n)
```

Total: O(n + n) = O(n)  (we take the worst)

### Example 4: Logarithmic — Binary Search

```go
low := 0
high := len(arr) - 1
for low <= high {
    mid := low + (high-low)/2
    if arr[mid] == target { return mid }
    if arr[mid] < target { low = mid + 1 } else { high = mid - 1 }
}
```

Every step we cut the search space in **half**.

How many times can you divide n by 2 until you reach 1?

Answer: log₂(n) times.

→ O(log n)

This is incredibly powerful. Going from 1 billion items to 1 only takes ~30 steps.

## Best Case, Average Case, Worst Case

Big O usually talks about **worst case** unless specified.

But sometimes the distinction matters a lot:

| Algorithm     | Best     | Average   | Worst     | Notes |
|---------------|----------|-----------|-----------|-------|
| QuickSort     | O(n log n) | O(n log n) | O(n²)   | Average is what we usually get with good pivot |
| Hash lookup   | O(1)     | O(1)      | O(n)      | Worst case happens with terrible hash collisions |
| Binary search | O(1)     | O(log n)  | O(log n)  | Best case when target is middle |

In interviews and real systems we usually care most about:
- **Worst case** (guarantees)
- **Amortized** (over many operations)

## Amortized Analysis (Very Important)

Some structures are **occasionally expensive** but cheap on average.

Classic example: Dynamic Array (C# `List&lt;T&gt;`, Go slice append)

```csharp
list.Add(item);   // Most of the time O(1)
```

Internally:
- When the underlying array is full, it allocates a new array **2x size** and copies everything.
- That particular `Add` is O(n).
- But it only happens rarely.

Over many appends, total work is O(n). So we say append is **amortized O(1)**.

This is why dynamic arrays feel "instant" even though they occasionally do big work.

Go slices do the same thing (with a growth factor).

## Space Complexity

We also talk about memory.

Examples:
- In-place quicksort: O(log n) space (recursion stack) + O(1) extra
- Merge sort: O(n) extra space for the temp arrays
- Building a hash map from n items: O(n) space

Always consider both time **and** space.

## Real Code — Drop the Theory, Show the Math

Let's analyze a real function that appears in many systems:

Problem: Given a list of numbers, return true if any duplicate exists.

### Bad (O(n²))

```csharp
bool HasDuplicate(int[] arr) {
    for (int i = 0; i < arr.Length; i++) {
        for (int j = i + 1; j < arr.Length; j++) {
            if (arr[i] == arr[j]) return true;
        }
    }
    return false;
}
```

O(n²) time. Dies on 50k items.

### Good (O(n) time, O(n) space)

```csharp
bool HasDuplicate(int[] arr) {
    var seen = new HashSet<int>();
    foreach (var x in arr) {
        if (!seen.Add(x)) return true;
    }
    return false;
}
```

One pass + hash set.

### Better when possible (O(n) time, O(1) space if values are bounded)

If numbers are in range 0..n-1, use the array itself as a "set" by negating values (classic trick). But this mutates input and has caveats.

## Common Real-World Big O Traps

1. **String concatenation in a loop** (Java, C#, Go, JS)
   - In many languages `str += "x"` in a loop is O(n²) because strings are immutable.
   - Use `StringBuilder` (C#) or `strings.Builder` (Go) → amortized O(n).

2. **List.Remove in a loop** (C# `List&lt;T&gt;`)
   - Removing from middle of List is O(n) because it shifts elements.
   - Doing it n times = O(n²) disaster.
   - Use `LinkedList` or build a new list instead.

3. **LINQ / Go range over maps without care**
   - `OrderBy` is O(n log n). Chaining many is still O(n log n) but constants add up.

4. **Accidental quadratic** from repeated `Contains` on List instead of HashSet.

## How Languages Hide Big O From You

**C# List&lt;T&gt;:**
- `Add` → amortized O(1)
- `Insert(0, x)` → O(n) (shifts everything)
- `RemoveAt(0)` → O(n)
- `this[index]` → O(1)
- `Contains` (without HashSet) → O(n)

**Go slice:**
- `append` → amortized O(1)
- Accessing `s[i]` → O(1)
- `copy` between slices → O(k) where k is number of elements copied

**Go map and C# Dictionary:**
- Average O(1) get/set
- Worst case O(n) only under adversarial input (rare in practice due to good hashers + randomization)

## The "Practical Big O" Rule of Thumb

| n          | O(n log n) is ok? | O(n²) ok?     | O(2^n) ok? |
|------------|-------------------|---------------|------------|
| 100        | Yes               | Yes           | Maybe      |
| 1,000      | Yes               | Careful       | No         |
| 10,000     | Yes               | Probably not  | No         |
| 100,000    | Yes               | No            | No         |
| 1,000,000  | Yes               | No            | No         |
| 100,000,000| Yes (barely)      | No            | No         |

Modern servers can do roughly 10⁸ ~ 10⁹ simple operations per second. Use this to sanity-check.

## Big O Is Not Everything

Big O ignores:
- Constant factors (sometimes a O(n²) with tiny constant beats O(n log n) for small n)
- Memory hierarchy (cache misses matter more than pure operation count)
- Parallelism and distribution
- I/O cost (disk and network are the real bottlenecks in many systems)

But it is still the **best first filter** we have.

## Summary Cheat Sheet

- O(1) — magic button
- O(log n) — divide and conquer magic
- O(n) — you have to touch everything once
- O(n log n) — acceptable for sorting large data
- O(n²) — only for small data or inner loops with tiny n
- O(2^n) — you need dynamic programming or pruning

---

**Next:** We will use Big O heavily when we talk about every data structure and algorithm.

Let's build actual things now.

Head to the first data structure: [data-structures/01-array.md](../data-structures/01-array.md)
