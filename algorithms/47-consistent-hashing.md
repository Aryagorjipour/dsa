# 47 - Consistent Hashing

## The Problem

You have a distributed system with many cache nodes or database shards. You want to assign keys to nodes such that:

1. **Minimal remapping** — adding or removing a node moves only a small fraction of keys.
2. **Load balance** — keys spread roughly evenly across nodes.

**Naive hashing fails:** `node = hash(key) % n`

When `n` changes from 3 to 4, nearly **every** key remaps. A single node addition triggers a thundering herd of cache misses and data migration.

## Canonical Problem: Distributed Cache Key Routing

**Scenario:** 3 Memcached servers hold user session data. You add a 4th server.

- `key % 3` → ~100% of keys invalidate on resize.
- **Consistent hashing** → only ~25% of keys move (K/n for n nodes, K/(n+1) for the new node).

## The Solution: Hash Ring

Map both **keys** and **nodes** onto a circle (0 to 2³²-1 or 0 to 2⁶⁴-1).

1. Hash each node to one or more positions on the ring.
2. Hash each key to a position on the ring.
3. Walk **clockwise** from the key's position to the **first node** — that node owns the key.

When a node is added/removed, only keys in the arc between that node and its predecessor move.

## Virtual Nodes (vnodes)

One physical node at one ring position creates uneven arcs. **Virtual nodes** place each physical machine at multiple positions (e.g. 100–150 replicas) for near-uniform load.

```
physical "nodeA" → hash("nodeA-0"), hash("nodeA-1"), …, hash("nodeA-149")
```

## Complexity

| Operation | Time | Space | Notes |
|-----------|------|-------|-------|
| Add node | O(v log r) | O(v) | v = virtual nodes, r = ring size |
| Remove node | O(v log r) | O(v) | Delete v positions, resort |
| Lookup key | O(log r) | O(1) extra | Binary search on sorted ring |
| Keys remapped on add | — | K/(n+1) | K = total keys, n = old node count |

## Full Implementation

### C#

```csharp
using System.Collections.Generic;

public class ConsistentHash {
    private readonly Dictionary<uint, string> ring = new();
    private readonly List<uint> sortedKeys = new();
    private readonly int replicas;

    public ConsistentHash(int replicas = 150) {
        this.replicas = replicas;
    }

    static uint Hash(string key) => (uint)key.GetHashCode(); // production: FNV-1a or Murmur3

    public void AddNode(string node) {
        for (int i = 0; i < replicas; i++) {
            uint h = Hash($"{node}-{i}");
            ring[h] = node;
            sortedKeys.Add(h);
        }
        sortedKeys.Sort();
    }

    public void RemoveNode(string node) {
        for (int i = 0; i < replicas; i++) {
            uint h = Hash($"{node}-{i}");
            ring.Remove(h);
            sortedKeys.Remove(h);
        }
    }

    public string GetNode(string key) {
        if (ring.Count == 0) return "";
        uint h = Hash(key);
        int idx = sortedKeys.BinarySearch(h);
        if (idx < 0) idx = ~idx;           // first position >= h
        if (idx == sortedKeys.Count) idx = 0; // wrap around ring
        return ring[sortedKeys[idx]];
    }
}
```

### Go

```go
type ConsistentHash struct {
    ring       map[uint32]string
    sortedKeys []uint32
    replicas   int
}

func NewConsistentHash(replicas int) *ConsistentHash {
    return &ConsistentHash{
        ring:     make(map[uint32]string),
        replicas: replicas,
    }
}

func (ch *ConsistentHash) hash(key string) uint32 {
    h := fnv.New32a()
    h.Write([]byte(key))
    return h.Sum32()
}

func (ch *ConsistentHash) AddNode(node string) {
    for i := 0; i < ch.replicas; i++ {
        virtualKey := fmt.Sprintf("%s-%d", node, i)
        h := ch.hash(virtualKey)
        ch.ring[h] = node
        ch.sortedKeys = append(ch.sortedKeys, h)
    }
    sort.Slice(ch.sortedKeys, func(i, j int) bool {
        return ch.sortedKeys[i] < ch.sortedKeys[j]
    })
}

func (ch *ConsistentHash) GetNode(key string) string {
    if len(ch.ring) == 0 {
        return ""
    }
    h := ch.hash(key)
    idx := sort.Search(len(ch.sortedKeys), func(i int) bool {
        return ch.sortedKeys[i] >= h
    })
    if idx == len(ch.sortedKeys) {
        idx = 0
    }
    return ch.ring[ch.sortedKeys[idx]]
}
```

See `examples/go/consistent_hashing.go` and `examples/csharp/ConsistentHashing.cs` for runnable demos.

## Comparison: Naive vs Consistent

| Approach | Keys moved when adding 1 node to cluster of n | Lookup |
|----------|------------------------------------------------|--------|
| `hash(key) % n` | ~100% | O(1) |
| Consistent hashing | ~1/(n+1) ≈ K/(n+1) | O(log n) |
| Jump consistent hash | Minimal, order-preserving | O(log n) |

## Improvements Beyond Basic Ring

| Technique | Benefit |
|-------------|---------|
| **Virtual nodes** | Better load balance across heterogeneous machines |
| **Bounded loads** | Cap keys per node; spill to next node if overloaded |
| **Jump consistent hash** | O(ln n) lookup, minimal migration, no ring storage (Google 2014) |
| **Rendezvous hashing** | No ring; higher lookup cost, excellent balance |

## Real World (Massive)

- **Memcached clients** — Ketama library (original famous use)
- **Cassandra, Dynamo, Riak, Voldemort** — Dynamo-style partition assignment
- **Akamai, Cloudflare CDNs** — edge server selection
- **Kubernetes** — some load balancing and endpoint hashing
- **Redis Cluster** — hash slots (16,384 slots variant of consistent hashing)
- **Maglev (Google)** — consistent hashing variant for network load balancers

## Production Considerations

- Use a **stable, well-distributed hash** (FNV-1a, Murmur3, xxHash) — not `GetHashCode()` (varies across processes in .NET).
- **150 virtual nodes** per physical node is a common starting point.
- On node failure, keys migrate to the successor; plan for **replication** (successor list of k nodes).
- Combine with **Bloom filters** for negative-cache fast paths in distributed caches.

## Summary

Consistent hashing is why you can add cache servers to a cluster without causing a thundering herd or massive data movement. The ring + virtual nodes + binary search pattern is the foundation of most production sharding systems.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Distributed Cache](/projects/tier-4/17-distributed-cache) — virtual nodes, key migration on resize, Bloom filter negative lookups, and per-node LRU.
:::

**Next:** [48 - Rate Limiting Algorithms](48-rate-limiting.md)