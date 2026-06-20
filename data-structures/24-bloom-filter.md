# 24 - Bloom Filter

## What is a Bloom Filter?

A **Bloom Filter** is a **probabilistic** data structure for answering:

"Have I seen this item before?"

With two special properties:
- It can say **"definitely not seen"** with 100% certainty.
- It can say **"probably seen"** (with a small false positive rate).

It **never** gives false negatives.

This is incredibly useful when false positives are acceptable but you want to save memory and be very fast.

## How It Works (Simple)

![Bloom Filter Concept](/images/bloom-filter.png)

1. You have a bit array of size `m`, initially all zeros.
2. You have `k` different hash functions.
3. To **add** an item: hash it with all k hashes, set the corresponding bits to 1.
4. To **query** an item: hash it with all k hashes; if **any** bit is 0 → "definitely not present"; if all bits are 1 → "probably present".

## Operations & Complexity

| Operation | Time   | Space | Notes |
|-----------|--------|-------|-------|
| Add       | O(k)   | O(m)  | k = number of hash functions |
| Query     | O(k)   | O(m)  | Never false negative |
| Delete    | N/A    | —     | Standard Bloom cannot delete |

False positive rate ≈ `(1 - e^(-kn/m))^k` where n = items inserted.

## Complete Implementation (C#)

```csharp
public class BloomFilter {
    private readonly BitArray _bits;
    private readonly int _k;
    private readonly int _m;

    public BloomFilter(int expectedItems, double falsePositiveRate) {
        _m = (int)(-expectedItems * Math.Log(falsePositiveRate) / (Math.Log(2) * Math.Log(2)));
        _k = Math.Max(1, (int)(Math.Log(2) * _m / expectedItems));
        _bits = new BitArray(_m);
    }

    public void Add(string item) {
        foreach (int hash in GetHashes(item)) {
            _bits[Math.Abs(hash % _m)] = true;
        }
    }

    public bool MightContain(string item) {
        foreach (int hash in GetHashes(item)) {
            if (!_bits[Math.Abs(hash % _m)]) return false;
        }
        return true;
    }

    private IEnumerable<int> GetHashes(string item) {
        int h1 = Hash(item, 0);
        int h2 = Hash(item, 1);
        for (int i = 0; i < _k; i++) {
            yield return h1 + i * h2;
        }
    }

    private static int Hash(string item, int seed) {
        unchecked {
            int hash = seed;
            foreach (char c in item) {
                hash = hash * 31 + c;
            }
            return hash;
        }
    }
}
```

## Complete Implementation (Go)

From `examples/go/bloom_filter.go`.

```go
import (
    "hash/fnv"
    "math"
)

type BloomFilter struct {
    bitArray []bool
    k        int
    m        int
}

func NewBloomFilter(expectedItems int, falsePositiveRate float64) *BloomFilter {
    m := int(-float64(expectedItems) * math.Log(falsePositiveRate) / (math.Ln2 * math.Ln2))
    k := int(float64(m) / float64(expectedItems) * math.Ln2)
    if k < 1 {
        k = 1
    }
    return &BloomFilter{
        bitArray: make([]bool, m),
        k:        k,
        m:        m,
    }
}

func (bf *BloomFilter) Add(item string) {
    for i := 0; i < bf.k; i++ {
        h := hash(item, i) % bf.m
        if h < 0 {
            h += bf.m
        }
        bf.bitArray[h] = true
    }
}

func (bf *BloomFilter) MightContain(item string) bool {
    for i := 0; i < bf.k; i++ {
        h := hash(item, i) % bf.m
        if h < 0 {
            h += bf.m
        }
        if !bf.bitArray[h] {
            return false
        }
    }
    return true
}

func hash(s string, seed int) int {
    h := fnv.New32a()
    h.Write([]byte(s))
    h.Write([]byte{byte(seed)})
    return int(h.Sum32())
}
```

## Real World Use Cases (Extremely Common)

### 1. Databases — Avoiding Disk Reads

- **Cassandra, HBase, ScyllaDB**: Each SSTable has a Bloom filter. Before reading from disk, check the filter.
- **RocksDB / LevelDB**: Same pattern.

### 2. Caches

Browser caches, CDN caches, Redis modules use Bloom filters to quickly say "we definitely don't have this".

### 3. Web Crawlers & URL Deduping

Billions of URLs. Can't store every one in memory.

### 4. Bitcoin / Cryptocurrency

SPV clients use Bloom filters to ask nodes for relevant transactions.

### 5. Advertising & Analytics

Frequency capping ("has this user seen this ad already?") at massive scale.

## Important Limitations

- Cannot remove items (standard Bloom filter).
- False positives increase as you add more items.
- You must know roughly how many items you will insert upfront.

## Variants That Fix Limitations

- **Counting Bloom Filter** — allows deletion (uses counters instead of bits)
- **Cuckoo Filter** — supports deletion + better performance in some cases
- **Blocked Bloom Filter** — cache friendly

## When to Use a Bloom Filter

Use it when:
- You can tolerate a small false positive rate
- Memory is more expensive than the cost of occasional false positives
- You have a very large number of items

Do **not** use it when you need exact answers.

## Summary

Bloom Filter = one of the most practical probabilistic data structures ever created.

It powers a huge amount of the "fast path" decisions in modern databases, caches, and distributed systems by saying "we can skip this work with high probability".

::: tip Project Lab
**Build it yourself:** [Persistent KV Store](/projects/tier-3/11-key-value-store), [Distributed Cache](/projects/tier-4/17-distributed-cache), and [Stream Analytics](/projects/tier-4/19-stream-analytics-pipeline).
:::

**Next:** [25 - Disjoint Set (Union-Find)](25-disjoint-set-union-find.md)