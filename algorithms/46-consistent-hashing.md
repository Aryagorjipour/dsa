# 46 - Consistent Hashing

## The Problem

You have a distributed system with many cache nodes or database shards.

You want to assign keys to nodes such that:
- Adding or removing a node only moves a small fraction of keys (not everything)
- Load is roughly balanced

Regular hashing (key % number_of_nodes) fails badly when nodes change.

## The Solution

Consistent hashing maps both keys **and** nodes onto a circle (hash ring).

Each key is assigned to the next node clockwise on the ring.

When a node is added/removed, only the keys in a small arc need to move.

## Real World (Massive)

- Memcached clients (original famous use)
- Cassandra, Dynamo, Riak, Voldemort (Dynamo-style databases)
- Akamai and many CDNs
- Kubernetes consistent hashing for some load balancing and sharding decisions
- Many load balancers (Maglev, etc. use consistent hashing variants)
- Distributed caches in general

## Improvements

- **Virtual nodes** (vnodes): Each physical node appears multiple times on the ring for better balance.
- **Consistent hashing with bounded loads**
- **Jump consistent hash** (Google paper — extremely elegant for certain cases)

## Summary

Consistent hashing is the reason you can add cache servers to your cluster without causing a thundering herd or massive data movement.
::: tip Project Lab
**Build it yourself:** [Distributed Cache](/projects/tier-4/17-distributed-cache) — virtual nodes, key migration, and per-node LRU.
:::
