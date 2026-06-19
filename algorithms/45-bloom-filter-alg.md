# 45 - Bloom Filter Algorithms

## Problem Bloom Filters Solve (as Algorithm)

**Approximate Membership Testing at Massive Scale**

"Have we seen this item before?" with tiny memory and allowing small false positives.

## Canonical Problem

You are building a web crawler that must avoid re-crawling the same URL billions of times. You cannot store every URL seen (would take terabytes).

Solution: Bloom filter.
- If filter says "not seen" → definitely new, crawl it and add.
- If filter says "seen" → probably seen, skip (small chance of false positive, acceptable).

## Detailed Implementation + Parameters

Already have DS version. Here focus on algorithm tuning:
- Choosing optimal k and m from expected n and desired false positive rate p.
- Multiple hash functions (double hashing technique).
- Counting Bloom for deletion support.

## Real Implementations in Systems

- Cassandra / HBase SSTable filters
- Bitcoin SPV clients
- Many distributed caches

Provide full calculation code for m and k.
