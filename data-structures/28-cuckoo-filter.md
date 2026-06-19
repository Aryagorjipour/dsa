# 28 - Cuckoo Filter

## What is a Cuckoo Filter?

A **Cuckoo Filter** is a modern probabilistic data structure for approximate set membership (like Bloom filter) with several major improvements:

- Supports **deletion**
- Better space efficiency at low false positive rates
- Faster lookups in many cases

It is based on **cuckoo hashing** ideas.

## How Cuckoo Filters Work (High Level)

Instead of setting bits, it stores small **fingerprints** (short hashes) of items in a table.

Each item has two possible locations (like cuckoo birds kicking each other out of nests).

When inserting:
- Try to place the fingerprint in one of the two buckets.
- If both full, kick out an existing fingerprint and relocate it (cuckoo style).
- If too many kicks, the table is considered full (rare with proper sizing).

Querying is fast: check the two possible locations for the fingerprint.

Deletion: find and remove the fingerprint.

## Advantages Over Bloom Filter

| Feature              | Bloom Filter     | Cuckoo Filter       |
|----------------------|------------------|---------------------|
| Deletion             | No               | Yes                 |
| False positive rate  | Good             | Better at low rates |
| Space efficiency     | Good             | Often better        |
| Lookup speed         | Very fast        | Very fast           |

## Real World Adoption

Cuckoo filters are relatively newer (paper in 2014) but are being adopted in:

- Some storage engines and caches
- Networking equipment
- Newer key-value stores
- Research into better replacement for Bloom filters in databases

Redis has experimental modules and some people have implemented cuckoo filters on top of Redis.

## When to Choose Cuckoo Filter

- You need deletion support
- You want good performance at very low false positive rates (< 1%)
- You are willing to implement or use a solid library

## Summary

Cuckoo Filter = Bloom filter's cooler younger sibling that can also delete things and often uses less space.

It shows how cuckoo hashing techniques (which we'll see more of in consistent hashing) can be applied to probabilistic structures.

**Next:** [29 - Rope](29-rope.md)
