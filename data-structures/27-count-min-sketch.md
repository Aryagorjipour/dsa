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

## Error Guarantees

With high probability:
- The estimate is at most `true_count + ε * total_count`
- Memory is proportional to `1/ε` and confidence parameter

You can tune it for your needs.

## Real World Uses

### 1. Network Traffic Analysis

- "Which IP addresses are sending the most traffic?"
- Detecting heavy hitters and DDoS patterns without storing everything.

### 2. Databases & Stream Processing

- Apache Flink, Kafka Streams, Spark Streaming use Count-Min sketches for approximate aggregations.

### 3. Advertising & Recommendation

- Frequency of certain user actions, ad views, product views.
- "Heavy hitters" identification.

### 4. Log Analysis & Monitoring

Counting rare-but-important error codes or user IDs without materializing full histograms.

### 5. Cache Admission Policies

Some advanced caches use frequency sketches (including Count-Min) to decide what to admit to cache (TinyLFU uses a variant).

## Comparison With Other Sketches

- **HyperLogLog**: Cardinality (unique count)
- **Count-Min Sketch**: Frequency estimation
- **Bloom Filter**: Membership ("have I seen it?")

They are often used together.

## Cuckoo Filter Connection

We'll see Cuckoo Filter next. It is more about membership with deletion support.

## Summary

Count-Min Sketch is the go-to tool when you need to estimate **how often** things happen in a firehose of data with limited memory.

It is another beautiful example of accepting a small, bounded error in exchange for massive scalability.

**Next:** [28 - Cuckoo Filter](28-cuckoo-filter.md)
