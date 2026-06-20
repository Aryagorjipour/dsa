# 45 - Bit Manipulation

## Why It Matters

Many low-level and high-performance tricks rely on clever use of bits. Modern CPUs execute bitwise operations in a single cycle. When you need speed, compact state, or elegant math, bits are the tool.

## Canonical Problem: Single Number

Given an array where every element appears **twice** except one, find the unique element.

**Key insight:** XOR is self-inverse and commutative — `a ^ a = 0`, so XOR-ing all elements cancels pairs and leaves the singleton.

```
[4, 1, 2, 1, 2] → 4 ^ 1 ^ 2 ^ 1 ^ 2 = 4
```

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| Single Number (XOR) | O(n) | O(1) |
| Count set bits (popcount) | O(log n) or O(1) with HW instruction | O(1) |
| Subset enumeration (bitmask) | O(2ⁿ × n) | O(1) extra |
| Isolate rightmost set bit | O(1) | O(1) |
| Power-of-two check | O(1) | O(1) |

## Full Implementation

### C# — Single Number

```csharp
public static int SingleNumber(int[] nums) {
    int result = 0;
    foreach (int n in nums)
        result ^= n;
    return result;
}
```

### Go — Single Number

```go
func SingleNumber(nums []int) int {
    result := 0
    for _, n := range nums {
        result ^= n
    }
    return result
}
```

### C# — Essential Bit Tricks

```csharp
public static class BitTricks {
    // Power of 2: exactly one bit set
    public static bool IsPowerOfTwo(int n) => n > 0 && (n & (n - 1)) == 0;

    // Isolate rightmost set bit
    public static int LowestSetBit(int n) => n & -n;

    // Count set bits (Brian Kernighan)
    public static int PopCount(int n) {
        int count = 0;
        while (n != 0) {
            n &= n - 1;
            count++;
        }
        return count;
    }

    // Set / clear / toggle bit at position p
    public static int SetBit(int n, int p)   => n | (1 << p);
    public static int ClearBit(int n, int p) => n & ~(1 << p);
    public static int ToggleBit(int n, int p) => n ^ (1 << p);

    // Check bit at position p
    public static bool IsBitSet(int n, int p) => (n & (1 << p)) != 0;
}
```

### Go — Essential Bit Tricks

```go
func IsPowerOfTwo(n int) bool { return n > 0 && n&(n-1) == 0 }

func LowestSetBit(n int) int { return n & -n }

func PopCount(n int) int {
    count := 0
    for n != 0 {
        n &= n - 1
        count++
    }
    return count
}

func SetBit(n, p int) int    { return n | (1 << p) }
func ClearBit(n, p int) int  { return n & ^(1 << p) }
func ToggleBit(n, p int) int { return n ^ (1 << p) }
func IsBitSet(n, p int) bool { return (n & (1 << p)) != 0 }
```

### C# — N-Queens with Bitmasks (O(1) conflict check)

```csharp
public static int CountNQueens(int n) {
    int Count(int row, int cols, int diag1, int diag2) {
        if (row == n) return 1;
        int count = 0;
        int available = ((1 << n) - 1) & ~(cols | diag1 | diag2);
        while (available != 0) {
            int bit = available & -available;
            available -= bit;
            count += Count(row + 1,
                cols | bit,
                (diag1 | bit) << 1,
                (diag2 | bit) >> 1);
        }
        return count;
    }
    return Count(0, 0, 0, 0);
}
```

### Go — N-Queens with Bitmasks

```go
func CountNQueens(n int) int {
    var count func(row, cols, diag1, diag2 int) int
    count = func(row, cols, diag1, diag2 int) int {
        if row == n {
            return 1
        }
        total := 0
        available := ((1 << n) - 1) & ^(cols | diag1 | diag2)
        for available != 0 {
            bit := available & -available
            available -= bit
            total += count(row+1, cols|bit, (diag1|bit)<<1, (diag2|bit)>>1)
        }
        return total
    }
    return count(0, 0, 0, 0)
}
```

## Tricks You Should Know Cold

| Trick | Code | Use case |
|-------|------|----------|
| Power of 2 | `n > 0 && (n & (n-1)) == 0` | Alignment, capacity checks |
| Popcount | `n &= n-1` in loop | Hamming weight, parity |
| Lowest set bit | `n & -n` | Subset iteration, Fenwick trees |
| XOR swap | `a^=b; b^=a; a^=b` | Interview trivia (avoid in production) |
| Multiply/divide by 2^k | `n << k` / `n >> k` | Fast arithmetic |
| Subset iteration | `for s := mask; s > 0; s = (s-1) & mask` | Enumerate submasks |
| Gray code | `i ^ (i >> 1)` | Hamiltonian path on hypercube |

## Flagship Problems

| Problem | Technique |
|---------|-----------|
| Single Number | XOR cancellation |
| Missing Number | XOR all indices and values |
| Reverse Bits | Bit-by-bit or lookup table |
| Number of 1 Bits | Kernighan popcount |
| Bitwise AND of Numbers Range | Find common prefix of left/right |
| Maximum XOR of Two Numbers | Binary trie on bits |
| Subsets | Bitmask 0..2ⁿ-1 |

## Real World

- **Operating systems** — page tables, file permissions, capability flags
- **Network protocols** — TCP flags (SYN, ACK, FIN), IP header fields
- **Compression** — Huffman codes, run-length encoding
- **Chess engines** — bitboards for O(1) attack generation (Stockfish)
- **Graphics** — alpha blending, stencil masks, pixel formats
- **Bloom filters & hashing** — bit arrays, double hashing
- **Cryptography** — constant-time comparisons to prevent timing attacks
- **Database bitmap indexes** — column scans on low-cardinality data
- **Backtracking** — N-Queens, Sudoku candidate sets as bitmasks

## Summary

Bit manipulation is the "I need to go fast and stay close to the metal" toolkit. Master XOR for cancellation, `n & (n-1)` for popcount, and bitmasks for compact state — then apply them in backtracking, hashing, and systems code.

**Next:** [46 - Bloom Filter Algorithms](46-bloom-filter-alg.md)