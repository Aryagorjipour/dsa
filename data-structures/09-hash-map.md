# 09 - Hash Map (Dictionary / Map)

## What is a Hash Map?

A **hash map** (also called hash table, dictionary, map, associative array) stores **key → value** pairs with extremely fast lookup by key.

It is probably the single most used data structure in modern software after arrays/slices.

Core contract:
- `map[key] = value` → O(1) average
- `value = map[key]` → O(1) average
- `delete key` → O(1) average

## Why It's So Powerful

It lets you go from "I have to search through everything" to "I know exactly where it lives" using hashing.

Real life analogies:
- A real dictionary (word → definition)
- Your phone's contact list (name → phone number)
- A library catalog (ISBN → book location)

## How Hash Maps Work (Deep but Practical)

1. **Hash the key** → produce an integer hash code.
2. **Map the hash** to a bucket index (using `hash & (capacity-1)` or modulo).
3. Store the key + value in that bucket.
4. On collision, either:
   - Chain (list/tree per bucket)
   - Probe to another bucket (open addressing)

To retrieve:
- Hash the key
- Go to bucket
- Compare keys until you find the right one (or prove it's not there)

## C# — Dictionary<TKey, TValue>

```csharp
var ages = new Dictionary<string, int>();
ages["Alice"] = 30;
ages["Bob"] = 25;

int aliceAge = ages["Alice"];           // 30
bool exists = ages.TryGetValue("Charlie", out int age);
```

.NET's `Dictionary` uses:
- Open addressing with quadratic probing
- Stores entries in one big array
- Uses special "deleted" markers (tombstones) for removals in some paths
- Has a very clever `int[] _buckets` + `Entry[] _entries` design for cache efficiency

## Go — map[K]V

Go maps are even more interesting.

Since Go 1.18+ (and earlier experiments), the runtime uses a **Swiss-table-inspired** design with:
- 8-element groups (buckets)
- Control bytes for fast matching (using SIMD-like tricks on some arches)
- Excellent performance and memory characteristics

Usage:

```go
ages := make(map[string]int)
ages["Alice"] = 30
age := ages["Alice"]
```

Go maps are **not** safe for concurrent mutation without external synchronization (use `sync.Map` or `RWMutex` or channels).

## Full Conceptual Implementation (Educational)

Below is a simplified but working version using chaining so it's easier to understand.

**C#**

```csharp
public class MyDictionary<K, V> where K : notnull {
    private class Entry {
        public K Key;
        public V Value;
        public Entry? Next; // chain
    }

    private Entry?[] _buckets = new Entry?[16];
    private int _count;

    private int GetIndex(K key) {
        return (key.GetHashCode() & 0x7FFFFFFF) % _buckets.Length;
    }

    public void Set(K key, V value) {
        int idx = GetIndex(key);
        Entry? current = _buckets[idx];
        while (current != null) {
            if (current.Key.Equals(key)) {
                current.Value = value;
                return;
            }
            current = current.Next;
        }
        var newEntry = new Entry { Key = key, Value = value, Next = _buckets[idx] };
        _buckets[idx] = newEntry;
        _count++;
        
        if (_count > _buckets.Length * 0.75) Resize();
    }

    public bool TryGet(K key, out V value) {
        int idx = GetIndex(key);
        Entry? current = _buckets[idx];
        while (current != null) {
            if (current.Key.Equals(key)) {
                value = current.Value;
                return true;
            }
            current = current.Next;
        }
        value = default!;
        return false;
    }
}
```

## Real World Use Cases (Literally Everywhere)

### 1. Variable and Symbol Tables in Compilers / Interpreters

Every language implementation:
- JavaScript objects (historically hash maps)
- Python dicts (the language is built on them)
- C# Roslyn symbol tables
- Go type checker

### 2. Caching Layers

- In-memory caches (`MemoryCache`, Redis as big hash map of keys)
- HTTP response caches
- Database query plan caches

### 3. Database Indexes (some of them)

Hash indexes exist (PostgreSQL hash indexes, MongoDB hashed indexes). Though B+ trees are more common for range queries.

### 4. Object Property Lookup

In dynamic languages, object properties are often backed by hash maps.

### 5. Configuration and Feature Flags

```csharp
var config = new Dictionary<string, string>();
```

### 6. Counting and Aggregation

```go
counts := make(map[string]int)
counts[word]++
```

This pattern powers word count, analytics, log aggregation, etc.

### 7. Graph Representation

Adjacency lists are often:
```csharp
Dictionary<Node, List<Node>> graph;
```

### 8. HTTP Headers, Query Parameters, Cookies

All key-value.

### 9. .NET Heavy Users

- `Dictionary` is used in ASP.NET Core routing, MVC model binding, configuration, logging scopes, dependency injection, JSON serialization, etc.
- `ConcurrentDictionary` is lock-free for many scenarios and powers high-scale services.

### 10. Go Heavy Users

Go's entire ecosystem loves maps:
- `sync.Map` for concurrent access patterns
- Every JSON unmarshal to `map[string]any`
- Kubernetes, Docker, etcd internals

## Load Factor, Resizing, and Performance

When the map gets too full:
- Create a new bigger array (usually 2x)
- Rehash **every existing entry** into the new array
- This is O(n) for that operation but amortized O(1)

Modern maps try very hard to stay cache-friendly.

## Common Pitfalls

1. **Using mutable objects as keys** — disaster if they change after insertion.
2. **Poor hash distribution** — everything ends up in few buckets.
3. **Assuming iteration order** — hash maps are unordered (some languages have ordered versions like `SortedDictionary` or Go 1.12+ random iteration order on purpose).
4. **Concurrency** — regular maps/dictionaries are not thread-safe.
5. **String keys** — watch allocations. In hot paths, use `ReadOnlySpan<char>` lookups or interning where possible.

## Ordered Variants

Sometimes you need order:

- C#: `SortedDictionary<TKey,TValue>` (red-black tree), `OrderedDictionary`
- Go: No built-in. People use a slice of keys + map, or third-party ordered map.

## Hash Map vs Tree Map Decision

| Requirement                    | Hash Map          | Tree Map (BST)       |
|--------------------------------|-------------------|----------------------|
| Lookup by exact key            | O(1) avg          | O(log n)             |
| Range queries / ordered iteration | No             | Yes                  |
| Memory overhead                | Lower usually     | Higher               |
| Worst case protection          | Good in practice  | Always O(log n)      |

## Summary

Hash maps are the backbone of modern software.

If your problem involves:
- "Look something up by a unique identifier"
- "Count occurrences"
- "Group by key"
- "Memoize results"

...your first thought should almost always be: **hash map**.

Master them. Then learn their evil twins (when they aren't fast enough): trees, tries, and the probabilistic structures we'll see later (Bloom, HyperLogLog, Count-Min, etc.).


::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Hash Map from Scratch](/projects/tier-1/04-hash-map-from-scratch) — separate chaining, open addressing, Robin Hood hashing, and HashDoS awareness.
:::

**Next:** Caches! [10 - LRU Cache](10-lru-cache.md)
