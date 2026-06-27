# 27 - Count-Min Sketch

## The Problem

You have a massive stream of events (clicks, log lines, packets, transactions).

You want to answer:

"How many times has item X appeared?"

You cannot store a counter for every possible item (there are too many, and many are rare).

Count-Min Sketch gives you **approximate** frequency counts with bounded error using very little memory.

## How It Works

It uses a 2D array of counters (width × depth) and multiple hash functions.

For each item:
- Hash it with each of the `d` hash functions
- Increment the corresponding counter in each row

To query frequency of X:
- Take the **minimum** across the d hashed positions

Why minimum? Because collisions can only **increase** counters, never decrease. The minimum is the most trustworthy estimate.

## Operations & Complexity

| Operation | Time   | Space          | Error |
|-----------|--------|----------------|-------|
| Add       | O(d)   | O(w × d)       | ≤ ε × total count |
| Query     | O(d)   | O(w × d)       | ≤ true + ε × total |
| Update stream | O(d) per event | O(w × d) | w = width, d = depth |

With width `w = ⌈e/ε⌉` and depth `d = ⌈ln(1/δ)⌉`, error ≤ ε × total with probability ≥ 1 − δ.

## Complete Implementation (C#)

```csharp
public class CountMinSketch {
    private readonly int[,] table;
    private readonly int width;
    private readonly int depth;
    private long totalCount;

    public CountMinSketch(double epsilon, double delta) {
        width = (int)Math.Ceiling(Math.E / epsilon);
        depth = (int)Math.Ceiling(Math.Log(1.0 / delta));
        table = new int[depth, width];
    }

    public void Add(string item, int count = 1) {
        totalCount += count;
        for (int i = 0; i < depth; i++) {
            int col = Hash(item, i) % width;
            if (col < 0) col += width;
            table[i, col] += count;
        }
    }

    public long Estimate(string item) {
        long min = long.MaxValue;
        for (int i = 0; i < depth; i++) {
            int col = Hash(item, i) % width;
            if (col < 0) col += width;
            min = Math.Min(min, table[i, col]);
        }
        return min;
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

```go
import (
    "hash/fnv"
    "math"
)

type CountMinSketch struct {
    table      [][]int
    width      int
    depth      int
    totalCount int64
}

func NewCountMinSketch(epsilon, delta float64) *CountMinSketch {
    width := int(math.Ceil(math.E / epsilon))
    depth := int(math.Ceil(math.Log(1.0 / delta)))
    table := make([][]int, depth)
    for i := range table {
        table[i] = make([]int, width)
    }
    return &CountMinSketch{table: table, width: width, depth: depth}
}

func (cms *CountMinSketch) Add(item string, count int) {
    cms.totalCount += int64(count)
    for i := 0; i < cms.depth; i++ {
        col := cms.hash(item, i) % cms.width
        if col < 0 {
            col += cms.width
        }
        cms.table[i][col] += count
    }
}

func (cms *CountMinSketch) Estimate(item string) int64 {
    min := int64(^uint64(0) >> 1)
    for i := 0; i < cms.depth; i++ {
        col := cms.hash(item, i) % cms.width
        if col < 0 {
            col += cms.width
        }
        if int64(cms.table[i][col]) < min {
            min = int64(cms.table[i][col])
        }
    }
    return min
}

func (cms *CountMinSketch) hash(item string, seed int) int {
    h := fnv.New32a()
    h.Write([]byte(item))
    h.Write([]byte{byte(seed)})
    return int(h.Sum32())
}
```

## Real World Uses

### 1. Network Traffic Analysis

"Which IP addresses are sending the most traffic?" Detecting heavy hitters and DDoS patterns.

### 2. Databases & Stream Processing

Apache Flink, Kafka Streams, Spark Streaming use Count-Min sketches for approximate aggregations.

### 3. Advertising & Recommendation

Frequency of user actions, ad views, product views. Heavy hitters identification.

### 4. Cache Admission Policies

TinyLFU uses a frequency sketch variant to decide what to admit to cache.

## Comparison With Other Sketches

| Sketch          | Answers                    |
|-----------------|----------------------------|
| HyperLogLog     | Cardinality (unique count) |
| Count-Min Sketch| Frequency estimation       |
| Bloom Filter    | Membership ("have I seen it?") |

They are often used together.

## Summary

Count-Min Sketch is the go-to tool when you need to estimate **how often** things happen in a firehose of data with limited memory.

It is another beautiful example of accepting a small, bounded error in exchange for massive scalability.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Stream Analytics Pipeline](/projects/tier-4/19-stream-analytics-pipeline)
:::

**Next:** [28 - Cuckoo Filter](28-cuckoo-filter.md)