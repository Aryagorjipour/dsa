# 20 - Reservoir Sampling

## The Problem

You have a **very large** (or infinite) stream of items. You want a **uniform random sample** of k items without storing the entire stream.

### Canonical Problem: Sample 1000 Rows from a Billion-Row Log

You cannot load the log into memory. You need every row to have equal probability k/n of being in the final sample.

## How It Works

**Algorithm R (k = 1):** For item i (1-indexed), replace the reservoir with probability 1/i.

**General (k > 1):** Keep reservoir of size k. For item i, if i ≤ k, add it. Else replace a random slot j ∈ [0, k) with probability k/i.

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| One pass | O(n) | O(k) |

## Full Implementation

### C#

```csharp
public static List<T> ReservoirSample<T>(IEnumerable<T> stream, int k, Random rng) {
    var reservoir = new List<T>(k);
    int i = 0;
    foreach (var item in stream) {
        i++;
        if (reservoir.Count < k) {
            reservoir.Add(item);
        } else {
            int j = rng.Next(i);
            if (j < k) reservoir[j] = item;
        }
    }
    return reservoir;
}
```

### Go

```go
func ReservoirSample[T any](stream <-chan T, k int, rng *rand.Rand) []T {
    reservoir := make([]T, 0, k)
    i := 0
    for item := range stream {
        i++
        if len(reservoir) < k {
            reservoir = append(reservoir, item)
        } else if j := rng.Intn(i); j < k {
            reservoir[j] = item
        }
    }
    return reservoir
}
```

## Real World

- Log and telemetry sampling (Datadog, Splunk-style pipelines)
- A/B testing and experiment bucketing
- ML training set sampling from huge datasets
- Approximate query processing in databases

## Summary

Reservoir sampling gives true uniform random samples with O(k) memory no matter how large the stream.

**Next:** [21 - BST Operations](21-bst-operations.md)