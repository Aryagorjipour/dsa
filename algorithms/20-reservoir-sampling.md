# 20 - Reservoir Sampling

## The Problem

You have a **very large** (or infinite) stream of items.

You want a **random sample** of k items, where every item in the stream has equal probability of being selected.

You cannot store the entire stream.

## Algorithm R (for k=1)

```go
var result Item
count := 0
for each item in stream {
    count++
    if rand.Float64() < 1.0/float64(count) {
        result = item
    }
}
```

For k > 1 there is a generalization.

## Real World

- Random sampling from massive logs
- A/B testing infrastructure
- Data science / ML training set sampling from huge datasets
- Analytics systems that want "representative sample" without loading everything
- Database systems doing approximate query processing

## Why It's Beautiful

It gives you true uniform random sampling with O(k) memory no matter how big the stream is.

## Summary

Reservoir sampling is the algorithm that lets you fairly sample from firehoses of data you can't store.
