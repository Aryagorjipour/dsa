# 26 - HyperLogLog

## What Problem Does HyperLogLog Solve?

"How many **unique** items are there in this huge stream?"

### Canonical Problem: Estimate Number of Unique Visitors to a Website (Cardinality Estimation at Scale)

**Problem:**

A website has billions of page views. You want to know "how many unique users visited today?" exactly would require storing all user IDs (too much memory).

HyperLogLog gives ~2% error with ~1.5KB memory, no matter how many events.

Used by every major analytics platform.

Full register update and estimate code in the chapter. See Netflix and Redis production use in resources/.

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

## Accuracy

Typical configuration:
- 12–14 bits of precision
- Memory: ~1.5 KB to ~6 KB
- Relative error: ~2% or better

This is good enough for almost all analytics use cases.

## Real World Use Cases

### 1. Redis

`PFADD`, `PFCOUNT`, `PFMERGE` commands are HyperLogLog.

Used by almost every company using Redis for unique counting at scale (daily active users, unique sessions, etc.).

### 2. Google, Facebook, Twitter, Netflix, etc.

Virtually every large tech company uses HyperLogLog (or improved variants) for:
- Unique visitor counts
- Unique search terms
- Ad impression uniqueness
- A/B test metrics

### 3. Analytics Databases

ClickHouse, Druid, BigQuery, Snowflake and others use HyperLogLog or similar sketches for approximate distinct counts.

### 4. Telemetry & Monitoring

Prometheus, Datadog, New Relic, etc. use cardinality sketches.

## Implementation Complexity

The actual algorithm is a bit involved (multiple registers, bias correction tables, etc.).

Most people use a well-tested library rather than implement from scratch:
- Redis has a very good implementation
- stream-lib (Java)
- Various Go and C# ports exist

## Variants & Improvements

- **HyperLogLog++** (Google) — better accuracy and bias correction
- **HLL** with sparse representation for very small cardinalities
- **MinHash + HyperLogLog** combinations for set similarity

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

**Next:** [27 - Count-Min Sketch](27-count-min-sketch.md)
