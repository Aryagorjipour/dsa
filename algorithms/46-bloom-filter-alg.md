# 46 - Bloom Filter Algorithms

## Problem Bloom Filters Solve (as Algorithm)

**Approximate Membership Testing at Massive Scale**

"Have we seen this item before?" with tiny memory, O(k) time per operation, and a configurable false positive rate — but **zero false negatives**.

## Canonical Problem: Web Crawler URL Deduplication

You are building a web crawler that must avoid re-crawling the same URL billions of times. Storing every URL in a hash set would take terabytes.

**Bloom filter workflow:**
1. Hash URL with k functions → set k bits in a bit array.
2. **Query:** if any bit is 0 → **definitely not seen** → crawl and add.
3. If all k bits are 1 → **probably seen** → skip (small false positive chance, acceptable).

False negatives are impossible: once added, all k bits are set.

## Sizing: Choosing m and k

Given:
- **n** — expected number of items
- **p** — desired false positive rate (e.g. 0.01 = 1%)

**Optimal bit array size:**

\[
m = -\frac{n \ln p}{(\ln 2)^2}
\]

**Optimal number of hash functions:**

\[
k = \frac{m}{n} \ln 2
\]

**Approximate false positive rate after n insertions:**

\[
p \approx \left(1 - e^{-kn/m}\right)^k
\]

### Example

For n = 1,000,000 URLs and p = 0.01:
- m ≈ 9,585,058 bits ≈ **1.14 MB**
- k ≈ **7** hash functions

A hash set storing 1M URLs might need 50–100+ MB. The Bloom filter trades accuracy for ~50× memory savings.

## Complexity

| Operation | Time | Space | Notes |
|-----------|------|-------|-------|
| Add | O(k) | — | Set k bits |
| Query | O(k) | — | Check k bits |
| Space | — | O(m) bits | m chosen from n and p |
| False negative rate | — | 0% | By construction |
| False positive rate | — | ≈ p | Tunable via m and k |

## Double Hashing (Simulating k Functions from 2)

Instead of k independent hash functions (expensive), use **double hashing**:

```
h_i(x) = (h1(x) + i × h2(x)) mod m    for i = 0, 1, …, k-1
```

Two base hashes generate k distinct positions. This is what Guava, RedisBloom, and most production libraries use.

## Full Implementation

### C#

```csharp
using System.Collections;

public class BloomFilter {
    private readonly BitArray bits;
    private readonly int m, k;

    // Optimal sizing from expected items n and false positive rate p
    public static (int m, int k) OptimalParams(int n, double p) {
        double m = -n * Math.Log(p) / (Math.Log(2) * Math.Log(2));
        int k = (int)Math.Round(m / n * Math.Log(2));
        return ((int)Math.Ceiling(m), Math.Max(1, k));
    }

    public BloomFilter(int expectedItems, double falsePositiveRate) {
        (m, k) = OptimalParams(expectedItems, falsePositiveRate);
        bits = new BitArray(m);
    }

    public void Add(string item) {
        var (h1, h2) = BaseHashes(item);
        for (int i = 0; i < k; i++) {
            int pos = (int)((h1 + (long)i * h2) % (uint)m);
            bits[pos] = true;
        }
    }

    public bool MightContain(string item) {
        var (h1, h2) = BaseHashes(item);
        for (int i = 0; i < k; i++) {
            int pos = (int)((h1 + (long)i * h2) % (uint)m);
            if (!bits[pos]) return false;
        }
        return true;
    }

    static (uint h1, uint h2) BaseHashes(string item) {
        uint h1 = 2166136261, h2 = 16777619;
        foreach (char c in item) {
            h1 ^= c; h1 *= 16777619;
            h2 ^= (c << 1); h2 *= 2166136261;
        }
        return (h1, h2 == 0 ? 1u : h2); // avoid zero multiplier
    }

    public int SizeBits => m;
    public int HashCount => k;
}
```

### Go

```go
type BloomFilter struct {
    bitArray []uint64 // packed bits for efficiency
    m, k     int
}

func OptimalParams(n int, p float64) (m, k int) {
    mf := -float64(n) * math.Log(p) / (math.Ln2 * math.Ln2)
    m = int(math.Ceil(mf))
    k = int(math.Round(mf / float64(n) * math.Ln2))
    if k < 1 {
        k = 1
    }
    return
}

func NewBloomFilter(expectedItems int, falsePositiveRate float64) *BloomFilter {
    m, k := OptimalParams(expectedItems, falsePositiveRate)
    words := (m + 63) / 64
    return &BloomFilter{bitArray: make([]uint64, words), m: m, k: k}
}

func (bf *BloomFilter) Add(item string) {
    h1, h2 := baseHashes(item)
    for i := 0; i < bf.k; i++ {
        pos := int((h1 + uint32(i)*h2) % uint32(bf.m))
        bf.setBit(pos)
    }
}

func (bf *BloomFilter) MightContain(item string) bool {
    h1, h2 := baseHashes(item)
    for i := 0; i < bf.k; i++ {
        pos := int((h1 + uint32(i)*h2) % uint32(bf.m))
        if !bf.getBit(pos) {
            return false
        }
    }
    return true
}

func baseHashes(s string) (h1, h2 uint32) {
    h1, h2 = 2166136261, 16777619
    for i := 0; i < len(s); i++ {
        h1 ^= uint32(s[i])
        h1 *= 16777619
        h2 ^= uint32(s[i]) << 1
        h2 *= 2166136261
    }
    if h2 == 0 {
        h2 = 1
    }
    return
}

func (bf *BloomFilter) setBit(pos int) {
    bf.bitArray[pos/64] |= 1 << uint(pos%64)
}

func (bf *BloomFilter) getBit(pos int) bool {
    return bf.bitArray[pos/64]&(1<<uint(pos%64)) != 0
}
```

See `examples/go/bloom_filter.go` and `examples/csharp/BloomFilterDemo.cs` for runnable demos.

## Variants Worth Knowing

| Variant | Supports delete? | Notes |
|---------|------------------|-------|
| Standard Bloom | No | Bits only go 0→1 |
| **Counting Bloom** | Yes | Replace bits with small counters |
| **Cuckoo Filter** | Yes | Better cache behavior, similar space |
| **Scalable Bloom** | N/A | Chain of filters as n grows past estimate |

## Real World

- **Cassandra / HBase / RocksDB** — SSTable Bloom filters skip disk reads
- **Bitcoin SPV clients** — probabilistic transaction filtering
- **Web crawlers** — URL deduplication at billion-URL scale
- **Distributed caches** — "definitely not in cache" fast path
- **Chrome Safe Browsing** — malicious URL checks
- **Medium / Akamai** — CDN negative-cache hints

## Tuning Checklist

1. Estimate **n** (peak items, not average).
2. Pick acceptable **p** (0.1% for DB lookups, 1% for crawlers).
3. Compute **m** and **k** with the formulas above.
4. Use **double hashing** — never k separate hash functions.
5. Monitor actual fill rate; rebuild or chain if n exceeds estimate.

## Summary

Bloom filters are a textbook trade-off: bounded memory, O(k) operations, zero false negatives, tunable false positives. The algorithm heart is **optimal m/k sizing** and **double hashing** — get those right and you have a production-grade membership sketch.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Distributed Cache](/projects/tier-4/17-distributed-cache) — Bloom filter negative lookups alongside consistent hashing and per-node LRU.
:::

**Next:** [47 - Consistent Hashing](47-consistent-hashing.md)