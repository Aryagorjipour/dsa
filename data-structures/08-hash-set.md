# 08 - Hash Set

## What is a Hash Set?

A **hash set** is an unordered collection that contains only **unique** elements and provides extremely fast lookup, add, and remove.

Core promise:
- `Add(x)` — O(1) average
- `Remove(x)` — O(1) average  
- `Contains(x)` — O(1) average
- No duplicates allowed

It answers the question "Have I seen this thing before?" insanely fast.

## How It Works — The Magic of Hashing

1. You have a **hash function** that turns your object into an integer (hash code).
2. You take that integer and map it to a **bucket** (usually using modulo or bit masking).
3. You store the item in that bucket.
4. To check if something exists, you hash it, go to the bucket, and compare.

Collisions (multiple items hashing to same bucket) are inevitable. Good implementations handle them with:
- **Chaining** (linked list or tree per bucket)
- **Open addressing** (probing — linear, quadratic, or double hashing)

Modern .NET `HashSet<T>` uses **open addressing with quadratic probing** + clever tricks.

Modern Go maps (since Go 1.18+) use a **Swiss table** style (inspired by Google's abseil) with high performance.

## Simple Conceptual Implementation

### C#

```csharp
public class MyHashSet<T> where T : notnull {
    private const int InitialSize = 16;
    private T?[] _buckets = new T?[InitialSize];
    private int _count;

    private int GetBucketIndex(T item) {
        int hash = item.GetHashCode() & 0x7FFFFFFF;
        return hash % _buckets.Length;
    }

    public bool Add(T item) {
        if (Contains(item)) return false;
        
        if (_count > _buckets.Length * 0.75) Resize();
        
        int idx = GetBucketIndex(item);
        // Linear probing for simplicity
        while (_buckets[idx] != null) {
            idx = (idx + 1) % _buckets.Length;
        }
        _buckets[idx] = item;
        _count++;
        return true;
    }

    public bool Contains(T item) {
        int idx = GetBucketIndex(item);
        int start = idx;
        while (_buckets[idx] != null) {
            if (_buckets[idx]!.Equals(item)) return true;
            idx = (idx + 1) % _buckets.Length;
            if (idx == start) break;
        }
        return false;
    }
    
    private void Resize() { /* double size + rehash */ }
}
```

Real implementations are more sophisticated (they store both hash and value, use tombstones for deletions in open addressing, etc.).

## Real C# and .NET

```csharp
var set = new HashSet<string>();
set.Add("hello");
set.Contains("hello"); // true
set.Add("hello");      // returns false (already present)
```

Used internally by:
- `Dictionary<TKey, TValue>` (the keys are a hash set)
- LINQ `Distinct()`
- Many graph algorithms for "visited" tracking

## Go

Go does not have a separate `Set` type. People use `map[T]struct{}` as a set:

```go
seen := make(map[string]struct{})
seen["hello"] = struct{}{}
if _, ok := seen["hello"]; ok { ... }
```

This is idiomatic and extremely efficient because Go maps are very well optimized.

## Real World Use Cases

### 1. "Have I seen this before?" — Deduplication

- Removing duplicate log lines
- Unique visitors tracking (with other structures)
- Avoiding reprocessing the same event/message in queues

### 2. Graph Algorithms

- `visited` set in BFS/DFS
- Tracking seen nodes in cycle detection
- Building adjacency without duplicate edges

### 3. Caching & Memoization Keys

Many caches use a set of "keys currently being computed" to prevent thundering herd.

### 4. Database & Storage Engines

- Bloom filters are built on top of hash set ideas (we'll cover later)
- Internal uniqueness enforcement during query execution

### 5. Language Runtimes

- String interning tables
- Type tables in compilers

### 6. .NET Specific Heavy Usage

- Roslyn uses hash sets everywhere for symbol lookup and "already processed" tracking.
- ASP.NET model validation, tag helpers, etc.
- Entity Framework change tracking uses sets internally.

### 7. Security & Crypto

- Certificate stores, CRLs, and revocation lists often use hash sets for fast lookup.
- Password breach checking services (Have I Been Pwned uses bloom + hash sets internally).

### 8. Distributed Systems

- Idempotency keys (have we processed this request ID?)
- Deduping in stream processing (Kafka Streams, Flink)

## Important Properties & Gotchas

### Hash Codes Must Be Consistent

If `GetHashCode()` can return different values for the same object across runs or after mutation, your set is broken.

Rule: Objects used as set elements should be **immutable** (or at least their hash-relevant fields must not change while in the set).

### Hash Collisions & Attacks

Before good hashers, people could craft inputs that caused O(n) behavior in hash sets (hash collision DoS).

Modern languages randomize hash seeds per process:
- .NET uses randomized string hashing
- Go uses randomized hash seeds since early versions

### Load Factor

When the set gets too full, performance degrades. Implementations resize (usually at ~0.7 load factor) and rehash everything.

## When to Use HashSet vs Other Structures

| Need                              | Use HashSet     | Alternative          |
|-----------------------------------|-----------------|----------------------|
| Just unique membership            | Yes             | —                    |
| Need sorted order                 | No              | SortedSet / TreeSet  |
| Need to preserve insertion order  | No              | LinkedHashSet (Java) or custom |
| Need fast lookup + small memory   | Yes             | Bloom Filter (approx) |
| Need to know count of each item   | No              | Dictionary / map     |

## Set Operations (Very Powerful)

C# `HashSet<T>` supports mathematical set operations efficiently:

```csharp
set1.UnionWith(set2);
set1.IntersectWith(set2);
set1.ExceptWith(set2);
set1.SymmetricExceptWith(set2);
```

These are used in:
- Feature flag evaluation
- Permission systems
- Recommendation engines ("people who like A also like B")

## Summary

Hash Set = the "have I seen this?" superpower.

It is one of the highest leverage data structures in existence. Once you internalize it, you will find dozens of places in your code where using a set instead of a list makes things dramatically faster and cleaner.

**Next:** [09 - Hash Map](09-hash-map.md) — the most used data structure in modern programming after the array.
