# 26 - HyperLogLog

## What Problem Does HyperLogLog Solve?

"How many **unique** items are there in this huge stream?"

### Canonical Problem: Estimate Number of Unique Visitors to a Website (Cardinality Estimation at Scale)

**Problem:**

A website has billions of page views. You want to know "how many unique users visited today?" Storing all user IDs exactly would use too much memory.

HyperLogLog gives ~2% error with ~1.5 KB memory, no matter how many events.

Examples:
- How many unique visitors came to my website today?
- How many unique search queries were executed?
- How many distinct products were viewed?

Storing every item in a HashSet would use too much memory for billions of events.

HyperLogLog gives you a **very good approximation** of the count of distinct elements using **tiny** fixed memory (often 1–2 KB for very accurate estimates).

## The Magic

It is based on a beautiful probabilistic observation:

If you hash items uniformly, the **longest run of leading zeros** in the binary representation of the hash tells you something about how many distinct items you've seen.

Example intuition:
- If you see a hash starting with 10 zeros, it's likely you've seen roughly 2^10 ≈ 1K distinct items.
- You combine many such observations using clever math (harmonic mean + bias correction).

## Operations & Complexity

| Operation | Time   | Space        | Accuracy |
|-----------|--------|--------------|----------|
| Add       | O(1)   | O(2^p) regs  | ~2% rel error (p=14) |
| Estimate  | O(2^p) | O(2^p) regs  | ~2% rel error (p=14) |
| Merge     | O(2^p) | O(2^p) regs  | For distributed counting |

Typical p=10–14: memory 1.5 KB–24 KB.

## Complete Implementation (C#)

```csharp
using System.Security.Cryptography;
using System.Text;

public class HyperLogLog {
    private readonly int[] registers;
    private readonly int p;
    private readonly int m;

    public HyperLogLog(int precision) {
        p = precision;
        m = 1 << p;
        registers = new int[m];
    }

    public void Add(string item) {
        uint hash = Hash32(item);
        int idx = (int)(hash >> (32 - p));
        int w = (int)(hash << p | (1u << (p - 1)));
        int rho = LeadingZeros(w) + 1;
        if (rho > registers[idx]) {
            registers[idx] = rho;
        }
    }

    public double Estimate() {
        double sum = 0;
        int zeros = 0;
        foreach (int r in registers) {
            sum += Math.Pow(2, -r);
            if (r == 0) zeros++;
        }
        double alpha = m switch {
            16 => 0.673,
            32 => 0.697,
            64 => 0.709,
            _ => 0.7213 / (1 + 1.079 / m)
        };
        double estimate = alpha * m * m / sum;
        if (estimate <= 2.5 * m && zeros > 0) {
            estimate = m * Math.Log((double)m / zeros);
        }
        return estimate;
    }

    private static uint Hash32(string item) {
        byte[] hash = SHA256.HashData(Encoding.UTF8.GetBytes(item));
        return BitConverter.ToUInt32(hash, 0);
    }

    private static int LeadingZeros(int x) {
        if (x == 0) return 32;
        int n = 0;
        if ((x & 0xFFFF0000) == 0) { n += 16; x <<= 16; }
        if ((x & 0xFF000000) == 0) { n += 8; x <<= 8; }
        if ((x & 0xF0000000) == 0) { n += 4; x <<= 4; }
        if ((x & 0xC0000000) == 0) { n += 2; x <<= 2; }
        if ((x & 0x80000000) == 0) { n += 1; }
        return n;
    }
}
```

## Complete Implementation (Go)

From `examples/go/hyperloglog_simple.go`, with proper leading-zero counting.

```go
import (
    "hash/fnv"
    "math"
    "math/bits"
)

type HyperLogLog struct {
    registers []int
    p         int
    m         int
}

func NewHyperLogLog(p int) *HyperLogLog {
    return &HyperLogLog{
        registers: make([]int, 1<<p),
        p:         p,
        m:         1 << p,
    }
}

func (h *HyperLogLog) Add(item string) {
    hash := hash32(item)
    idx := hash >> (32 - h.p)
    w := (hash << h.p) | (1 << (h.p - 1))
    rho := bits.LeadingZeros32(w) + 1
    if int(rho) > h.registers[idx] {
        h.registers[idx] = int(rho)
    }
}

func (h *HyperLogLog) Estimate() float64 {
    sum := 0.0
    zeros := 0
    for _, r := range h.registers {
        sum += math.Pow(2, -float64(r))
        if r == 0 {
            zeros++
        }
    }
    alpha := 0.7213 / (1.0 + 1.079/float64(h.m))
    estimate := alpha * float64(h.m) * float64(h.m) / sum
    if estimate <= 2.5*float64(h.m) && zeros > 0 {
        estimate = float64(h.m) * math.Log(float64(h.m)/float64(zeros))
    }
    return estimate
}

func hash32(s string) uint32 {
    h := fnv.New32a()
    h.Write([]byte(s))
    return h.Sum32()
}
```

## Real World Use Cases

### 1. Redis

`PFADD`, `PFCOUNT`, `PFMERGE` commands are HyperLogLog.

### 2. Google, Facebook, Twitter, Netflix, etc.

Unique visitor counts, unique search terms, ad impression uniqueness, A/B test metrics.

### 3. Analytics Databases

ClickHouse, Druid, BigQuery, Snowflake use HyperLogLog or similar sketches for approximate distinct counts.

### 4. Telemetry & Monitoring

Prometheus, Datadog, New Relic use cardinality sketches.

## Comparison With Exact

| Method         | Memory for 1B uniques | Accuracy | Speed |
|----------------|-----------------------|----------|-------|
| HashSet        | Gigabytes             | 100%     | Fast  |
| HyperLogLog    | ~2 KB                 | ~2% error| Very fast |

## When to Use It

Use HyperLogLog when:
- You need **approximate** distinct counts
- The data volume is huge
- You care more about memory and speed than perfect precision

Do not use it when you need exact numbers for financial, security, or billing purposes.

## Summary

HyperLogLog is one of the greatest "good enough" data structures in existence.

It lets companies count unique things at planetary scale with almost no memory.

If you ever work in analytics, big data, or high-scale web systems, you will encounter it.

::: tip Project Lab
**Build it yourself:** [Stream Analytics Pipeline](/projects/tier-4/19-stream-analytics-pipeline) — cardinality estimation at streaming scale.
:::

**Next:** [27 - Count-Min Sketch](27-count-min-sketch.md)