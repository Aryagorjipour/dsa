# 28 - Cuckoo Filter

## What is a Cuckoo Filter?

A **Cuckoo Filter** is a modern probabilistic data structure for approximate set membership (like Bloom filter) with several major improvements:

- Supports **deletion**
- Better space efficiency at low false positive rates
- Faster lookups in many cases

It is based on **cuckoo hashing** ideas.

## How Cuckoo Filters Work (High Level)

Instead of setting bits, it stores small **fingerprints** (short hashes) of items in a table of buckets.

Each item has two possible locations (like cuckoo birds kicking each other out of nests).

When inserting:
- Try to place the fingerprint in one of the two buckets.
- If both full, kick out an existing fingerprint and relocate it (cuckoo style).
- If too many kicks, the table is considered full (rare with proper sizing).

Querying is fast: check the two possible locations for the fingerprint.

Deletion: find and remove the fingerprint.

## Operations & Complexity

| Operation | Time (avg) | Space | Notes |
|-----------|------------|-------|-------|
| Insert    | O(1)       | O(n)  | May kick O(log n) items |
| Query     | O(1)       | O(n)  | Check 2 buckets |
| Delete    | O(1)       | O(n)  | Unlike standard Bloom |

False positive rate ≈ `2b / 2^f` where f = fingerprint bits, b = bucket size.

## Complete Implementation (C#)

```csharp
public class CuckooFilter {
    private const int BucketSize = 4;
    private const int MaxKicks = 500;
    private readonly ushort[][] buckets;
    private readonly int bucketCount;
    private int itemCount;

    public CuckooFilter(int capacity) {
        bucketCount = NextPowerOfTwo(capacity / BucketSize + 1);
        buckets = new ushort[bucketCount][];
        for (int i = 0; i < bucketCount; i++) {
            buckets[i] = new ushort[BucketSize];
        }
    }

    public bool Add(string item) {
        ushort fp = Fingerprint(item);
        int i1 = Hash1(item) & (bucketCount - 1);
        int i2 = AltIndex(i1, fp);

        if (InsertToBucket(i1, fp) || InsertToBucket(i2, fp)) {
            itemCount++;
            return true;
        }

        int idx = Random.Shared.Next(2) == 0 ? i1 : i2;
        for (int n = 0; n < MaxKicks; n++) {
            int slot = Random.Shared.Next(BucketSize);
            ushort kicked = buckets[idx][slot];
            buckets[idx][slot] = fp;
            fp = kicked;
            idx = AltIndex(idx, fp);
            if (InsertToBucket(idx, fp)) {
                itemCount++;
                return true;
            }
        }
        return false;
    }

    public bool Contains(string item) {
        ushort fp = Fingerprint(item);
        int i1 = Hash1(item) & (bucketCount - 1);
        int i2 = AltIndex(i1, fp);
        return BucketContains(i1, fp) || BucketContains(i2, fp);
    }

    public bool Delete(string item) {
        ushort fp = Fingerprint(item);
        int i1 = Hash1(item) & (bucketCount - 1);
        int i2 = AltIndex(i1, fp);
        if (RemoveFromBucket(i1, fp) || RemoveFromBucket(i2, fp)) {
            itemCount--;
            return true;
        }
        return false;
    }

    private bool InsertToBucket(int idx, ushort fp) {
        for (int i = 0; i < BucketSize; i++) {
            if (buckets[idx][i] == 0) {
                buckets[idx][i] = fp;
                return true;
            }
        }
        return false;
    }

    private bool BucketContains(int idx, ushort fp) {
        for (int i = 0; i < BucketSize; i++) {
            if (buckets[idx][i] == fp) return true;
        }
        return false;
    }

    private bool RemoveFromBucket(int idx, ushort fp) {
        for (int i = 0; i < BucketSize; i++) {
            if (buckets[idx][i] == fp) {
                buckets[idx][i] = 0;
                return true;
            }
        }
        return false;
    }

    private static int AltIndex(int idx, ushort fp) {
        return (idx ^ (fp * 0x5bd1e995)) & int.MaxValue;
    }

    private static ushort Fingerprint(string item) {
        int h = item.GetHashCode();
        ushort fp = (ushort)((h >> 16) ^ h);
        return fp == 0 ? (ushort)1 : fp;
    }

    private static int Hash1(string item) => item.GetHashCode();

    private static int NextPowerOfTwo(int n) {
        int p = 1;
        while (p < n) p <<= 1;
        return p;
    }
}
```

## Complete Implementation (Go)

```go
import (
    "hash/fnv"
    "math/rand"
)

const (
    bucketSize = 4
    maxKicks   = 500
)

type CuckooFilter struct {
    buckets    [][]uint16
    bucketCount int
    itemCount  int
}

func NewCuckooFilter(capacity int) *CuckooFilter {
    bucketCount := nextPowerOfTwo(capacity/bucketSize + 1)
    buckets := make([][]uint16, bucketCount)
    for i := range buckets {
        buckets[i] = make([]uint16, bucketSize)
    }
    return &CuckooFilter{buckets: buckets, bucketCount: bucketCount}
}

func (cf *CuckooFilter) Add(item string) bool {
    fp := fingerprint(item)
    i1 := hash1(item) & (cf.bucketCount - 1)
    i2 := altIndex(i1, fp)

    if cf.insertToBucket(i1, fp) || cf.insertToBucket(i2, fp) {
        cf.itemCount++
        return true
    }

    idx := i1
    if rand.Intn(2) == 1 {
        idx = i2
    }
    for n := 0; n < maxKicks; n++ {
        slot := rand.Intn(bucketSize)
        kicked := cf.buckets[idx][slot]
        cf.buckets[idx][slot] = fp
        fp = kicked
        idx = altIndex(idx, fp)
        if cf.insertToBucket(idx, fp) {
            cf.itemCount++
            return true
        }
    }
    return false
}

func (cf *CuckooFilter) Contains(item string) bool {
    fp := fingerprint(item)
    i1 := hash1(item) & (cf.bucketCount - 1)
    i2 := altIndex(i1, fp)
    return cf.bucketContains(i1, fp) || cf.bucketContains(i2, fp)
}

func (cf *CuckooFilter) Delete(item string) bool {
    fp := fingerprint(item)
    i1 := hash1(item) & (cf.bucketCount - 1)
    i2 := altIndex(i1, fp)
    if cf.removeFromBucket(i1, fp) || cf.removeFromBucket(i2, fp) {
        cf.itemCount--
        return true
    }
    return false
}

func (cf *CuckooFilter) insertToBucket(idx int, fp uint16) bool {
    for i := range cf.buckets[idx] {
        if cf.buckets[idx][i] == 0 {
            cf.buckets[idx][i] = fp
            return true
        }
    }
    return false
}

func (cf *CuckooFilter) bucketContains(idx int, fp uint16) bool {
    for _, v := range cf.buckets[idx] {
        if v == fp {
            return true
        }
    }
    return false
}

func (cf *CuckooFilter) removeFromBucket(idx int, fp uint16) bool {
    for i, v := range cf.buckets[idx] {
        if v == fp {
            cf.buckets[idx][i] = 0
            return true
        }
    }
    return false
}

func altIndex(idx int, fp uint16) int {
    return (idx ^ int(fp*0x5bd1e995)) & 0x7fffffff & (1<<20 - 1)
}

func fingerprint(item string) uint16 {
    h := hash1(item)
    fp := uint16((h >> 16) ^ uint16(h))
    if fp == 0 {
        fp = 1
    }
    return fp
}

func hash1(item string) int {
    h := fnv.New32a()
    h.Write([]byte(item))
    return int(h.Sum32())
}

func nextPowerOfTwo(n int) int {
    p := 1
    for p < n {
        p <<= 1
    }
    return p
}
```

> **Note:** This is an educational cuckoo filter. Production implementations (e.g. in storage engines) use optimized bucket layouts, partial-key cuckoo hashing, and careful load-factor tuning.

## Advantages Over Bloom Filter

| Feature              | Bloom Filter     | Cuckoo Filter       |
|----------------------|------------------|---------------------|
| Deletion             | No               | Yes                 |
| False positive rate  | Good             | Better at low rates |
| Space efficiency     | Good             | Often better        |
| Lookup speed         | Very fast        | Very fast           |

## Real World Adoption

Cuckoo filters are relatively newer (paper in 2014) but are being adopted in storage engines, networking equipment, and newer key-value stores as a Bloom filter replacement.

## Summary

Cuckoo Filter = Bloom filter's cooler younger sibling that can also delete things and often uses less space.

It shows how cuckoo hashing techniques can be applied to probabilistic structures.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Distributed Cache](/projects/tier-4/17-distributed-cache)
:::

**Next:** [29 - Rope](29-rope.md)