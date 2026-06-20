# 17 - Radix Sort

## The Problem

Sort fixed-width integers or strings **without comparison** by processing digits/characters from least significant to most significant (LSD) or the reverse (MSD).

### Canonical Problem: Sort Millions of 32-bit Integers

Comparison sort: O(n log n). LSD radix with 256 buckets per byte: O(4 × (n + 256)) ≈ linear for fixed width.

## How It Works (LSD)

For each digit position (byte, hex nibble, etc.):
1. Count occurrences per digit value (counting sort on that digit).
2. Stable placement into output.
3. Copy back and repeat for next digit.

## Complexity

| Case | Time | Space |
|------|------|-------|
| LSD | O(d × (n + b)) | O(n + b) |

d = number of digits/bytes, b = radix base (often 256).

## Full Implementation

### C#

```csharp
public static void RadixSort(int[] arr) {
    int max = arr.Max();
    for (int exp = 1; max / exp > 0; exp *= 10) {
        CountByDigit(arr, exp);
    }
}

static void CountByDigit(int[] arr, int exp) {
    int n = arr.Length;
    int[] output = new int[n];
    int[] count = new int[10];
    foreach (int x in arr) count[(x / exp) % 10]++;
    for (int i = 1; i < 10; i++) count[i] += count[i - 1];
    for (int i = n - 1; i >= 0; i--) {
        int digit = (arr[i] / exp) % 10;
        output[count[digit] - 1] = arr[i];
        count[digit]--;
    }
    Array.Copy(output, arr, n);
}
```

### Go

```go
func RadixSort(arr []int) {
    max := 0
    for _, x := range arr {
        if x > max { max = x }
    }
    for exp := 1; max/exp > 0; exp *= 10 {
        countByDigit(arr, exp)
    }
}

func countByDigit(arr []int, exp int) {
    n := len(arr)
    out := make([]int, n)
    count := make([]int, 10)
    for _, x := range arr {
        count[(x/exp)%10]++
    }
    for i := 1; i < 10; i++ {
        count[i] += count[i-1]
    }
    for i := n - 1; i >= 0; i-- {
        d := (arr[i] / exp) % 10
        count[d]--
        out[count[d]] = arr[i]
    }
    copy(arr, out)
}
```

## Real World

- Sorting IP addresses, fixed-width IDs
- GPU sorting pipelines
- Suffix array construction (SA-IS uses radix ideas)

## Summary

Radix sort exploits digit structure to sort faster than comparison when keys have bounded width.

**Next:** [18 - Hashing](18-hashing.md)