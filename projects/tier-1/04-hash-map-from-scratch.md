# Build Your Own Hash Map

## 1. Motivation & Real-World Context

The hash map is the single most-used data structure in production code. Not understanding its internals means you cannot reason about its failure modes — and it does fail.

**Redis is a hash table.** At its core, Redis is a hash map from string keys to values. The entire key space of a Redis instance is one giant hash table in memory, with separate chaining for collision resolution. When Redis rehashes (doubles the table), it does so incrementally across many operations (called "progressive rehashing") to avoid blocking the server for seconds on a large table. Without knowing that rehashing is a thing, you cannot explain why a Redis latency spike correlates with memory usage crossing a threshold.

**Hash map attacks (HashDoS).** In 2011, a vulnerability was disclosed affecting PHP, Java, Python, Ruby, ASP.NET, and dozens of other platforms: if the hash function is deterministic and public, an attacker can craft HTTP POST parameters with keys that all hash to the same bucket. A request with 10,000 such keys degrades insertion from O(10,000) to O(100,000,000) — turning your server into O(n²) in the number of request parameters. The fix was randomized hash seeds (perturbation). Go randomizes its map seed per process. .NET randomizes `string.GetHashCode()` per process. Knowing this requires knowing how chaining degrades under adversarial inputs.

**Database query caching and deduplication.** PostgreSQL uses hash tables internally for hash joins (when sorting both relations is too expensive) and for hash aggregation (`GROUP BY` without an index). Deduplication pipelines — such as event deduplication in Apache Kafka Streams or AWS Kinesis — use in-memory hash sets to track seen event IDs within a time window, with eviction when the window slides.

---

## 2. Learning Objectives

By completing this project, you will deeply understand:

1. **Hash function properties** — what makes a hash function good (determinism, uniformity, avalanche effect, bit mixing), why naive implementations like summing character codes fail, and how FNV-1a achieves good distribution in 10 lines of code. See [Hashing](/algorithms/18-hashing).
2. **Collision resolution strategies** — the performance difference between separate chaining (linked lists) and open addressing (linear probing), when each is preferable, and what "probe sequence" means in practice. See [Hash Map](/data-structures/09-hash-map).
3. **Load factor and amortized resizing** — why the load factor threshold of 0.75 is the standard choice, how doubling the table provides amortized O(1) insertion, and what happens to all existing entries (they must be rehashed). See [Hash Set](/data-structures/08-hash-set).
4. **Tombstones in open addressing** — why you cannot simply clear a slot on deletion in linear probing (it breaks the probe chain), and how tombstone markers solve this at the cost of wasted space.
5. **Robin Hood hashing** — how swapping entries during insertion to minimize variance in probe lengths improves worst-case lookup performance and simplifies deletion.
6. **Hash Set as a specialization** — how a hash set is just a hash map where the value is the unit type / empty struct, and why `map[K]struct{}` in Go is idiomatic for sets.
7. **String hashing pitfalls** — why commutative hash functions (sum-of-chars) are catastrophically bad for string keys, and how polynomial rolling hash prevents anagram collisions.

---

## 3. Project Scope

**In Scope:**
- Hash map with separate chaining (linked list per bucket)
- Dynamic resizing triggered by load factor > 0.75
- Open addressing hash map with linear probing and tombstone deletion
- Robin Hood hashing optimization on the open addressing map
- Hash set implemented on top of your hash map
- FNV-1a hash function for string keys; polynomial rolling hash for comparison
- Word-frequency counter use-case running on a large text file
- Benchmark against the language standard library map
- Basic iterator/range support to enumerate entries

**Out of Scope (for v1):**
- Concurrent/thread-safe map (sync.Map, ConcurrentDictionary)
- Consistent hashing (distributed systems use-case)
- Cuckoo hashing or other advanced schemes
- Perfect hashing for static key sets
- LRU eviction layer on top of the hash map

---

## 4. Core DSA Concepts Used

| Concept | Role in this project | Handbook Link | Difficulty |
|---------|----------------------|---------------|------------|
| Hash Map | The primary implementation target; separate chaining variant | [/data-structures/09-hash-map](/data-structures/09-hash-map) | Intermediate |
| Hash Set | Built on top of hash map as a value-less variant; core use-case for deduplication | [/data-structures/08-hash-set](/data-structures/08-hash-set) | Beginner |
| Hashing | Core primitive; FNV-1a and polynomial rolling hash implemented from scratch | [/algorithms/18-hashing](/algorithms/18-hashing) | Intermediate |
| Array | Backing storage for the bucket array; direct-addressed by hash % capacity | [/data-structures/01-array](/data-structures/01-array) | Beginner |
| Linked List | Chain of entries in each bucket for separate chaining collision resolution | [/data-structures/03-linked-list](/data-structures/03-linked-list) | Beginner |
| Dynamic Array | Conceptual model for resizing the bucket array; same doubling pattern | [/data-structures/02-dynamic-array](/data-structures/02-dynamic-array) | Beginner |

---

## 5. High-Level Architecture

Two independent hash map implementations (chaining and open addressing) share a common interface. The hash set and the word-frequency counter are built on top of the chaining map.

```mermaid
graph TD
    subgraph HashMap Interface
        A["Put(key, value)"]
        B["Get(key) → value, ok"]
        C["Delete(key)"]
        D["Size() int"]
        E["Keys() []K"]
    end

    subgraph ChainingHashMap
        F[Bucket Array]
        G[Entry Node - key value next]
        F --> G
        G --> G
    end

    subgraph OpenAddressingHashMap
        H[Flat Entry Array]
        I[Tombstone Marker]
        H --> I
    end

    subgraph Built On Top
        J[HashSet K]
        K[WordFrequencyCounter]
        L[RobinHoodHashMap]
    end

    HashMap Interface --> ChainingHashMap
    HashMap Interface --> OpenAddressingHashMap
    ChainingHashMap --> J
    ChainingHashMap --> K
    OpenAddressingHashMap --> L

    subgraph Hash Functions
        M[FNV-1a for strings]
        N[Polynomial Rolling Hash]
        O[Integer hash - multiply-shift]
    end

    ChainingHashMap --> M
    ChainingHashMap --> N
    OpenAddressingHashMap --> M
```

**Key interfaces/abstractions:**

- `HashMap[K, V]` interface: `Put(key K, val V)`, `Get(key K) (V, bool)`, `Delete(key K) bool`, `Size() int`, `Keys() []K`.
- `Entry[K, V]` — a node in the chaining list: `{key K; val V; next *Entry[K, V]}`.
- `OpenEntry[K, V]` — a slot in the flat array: `{key K; val V; state: Empty|Occupied|Tombstone}`.
- `HashFunc[K]` — `type HashFunc[K any] func(key K, capacity int) int`. Separate from the map itself so different hash functions can be plugged in for benchmarking.
- `LoadFactor` — constant `0.75`. When `float64(m.size) / float64(len(m.buckets)) > LoadFactor`, call `resize(2 * cap)`.

---

## 6. Implementation Milestones (with Hints)

### Milestone 1: Implement Hash Map with Separate Chaining

**Goal:** Implement `ChainingHashMap[K comparable, V any]` with an initial capacity of 16 buckets. Each bucket is the head of a singly-linked list of `Entry[K, V]` nodes. Implement `Put`, `Get`, `Delete`, and `Size`.

**Key Challenges:**
- Computing the bucket index: `bucketIndex = hash(key) % len(buckets)`. The modulo must always be non-negative — in Go, the result of `%` can be negative for negative hash values. Use `(hash(key) % cap + cap) % cap` or `uint(hash(key)) % uint(cap)`.
- Chaining Put: if the key already exists in the chain, update the value in place (do not insert a duplicate node).
- Chaining Delete: requires a predecessor pointer. Traverse the chain keeping track of `prev`. When `current.key == key`, set `prev.next = current.next`. If deleting the head, update `buckets[i] = current.next`.
- Initial hash function: use FNV-1a for string keys. Start with a placeholder for non-string keys (just `fmt.Sprintf("%v", key)` hashed, or require the caller to provide a hash function).

**Hints & Guidance:**
- FNV-1a for strings: `const fnvOffset = 14695981039346656037; const fnvPrime = 1099511628211`. Initialize `hash = fnvOffset`. For each byte `b` in the key: `hash ^= uint64(b); hash *= fnvPrime`.
- For generic keys in Go: use `comparable` constraint and a `hashFunc func(K) uint64` parameter in the constructor. The caller provides the hash function. In C#: use `IEqualityComparer&lt;K&gt;` parameter with a default of `EqualityComparer&lt;K&gt;.Default`.
- Test collision handling explicitly: force two keys to the same bucket by using a tiny capacity (2 buckets) and verify both entries are retrievable.

**Success Criteria:**
- `Put("hello", 1)` then `Get("hello")` returns `(1, true)`.
- `Put("hello", 1)` then `Put("hello", 2)` then `Get("hello")` returns `(2, true)` (update, not duplicate insert).
- `Delete("hello")` returns `true` and subsequent `Get("hello")` returns `(zero, false)`.
- Two keys that hash to the same bucket are both retrievable.
- `Size()` returns the correct count after insertions and deletions.

---

### Milestone 2: Add Dynamic Resizing

**Goal:** Trigger a resize when `size / capacity > 0.75`. Double the capacity. Reinsert all existing entries into the new bucket array (rehash).

**Key Challenges:**
- You cannot copy the old buckets array to the new one — bucket index is `hash % capacity`, so all indices change with the new capacity. You must traverse every bucket chain and re-Put every entry.
- Capacity should be a power of 2 for efficient modulo via bitmasking, OR a prime number for better distribution with a poor hash. Choose one approach and stick with it.
- After resizing, `size` must remain the same (you are not adding new entries, just redistributing).

**Hints & Guidance:**
- Resize: `newBuckets := make([]*Entry[K,V], newCap)`. Then for each old bucket, walk the chain; for each entry, compute `newIdx = hash(entry.key) % newCap` and insert at `newBuckets[newIdx]`.
- To avoid triggering another resize during rehash, set the new map's size only after all entries are reinserted, and do not call `Put` recursively (that would check load factor again). Insert directly into `newBuckets`.
- Use a prime-sequence for capacities: 17 → 37 → 79 → 163 → 331 → 673 → ... Primes reduce clustering when using a bad hash function. If you use a power-of-2 capacity with a good hash (FNV-1a), you can use bitmask: `index = hash & (cap - 1)`.
- Test: insert 1,000 entries one by one and verify `len(m.buckets)` is approximately `1000 / 0.75 = 1333`, rounded to the next capacity checkpoint.

**Success Criteria:**
- After inserting 14 entries into a map with initial capacity 16, a resize to capacity 32 (or nearest prime > 16*2) is triggered.
- All 14 entries remain retrievable after resize.
- `Size()` still returns 14 after resize.
- Resize is triggered exactly once during a sequence of 14 inserts (not on every insert, not never).

---

### Milestone 3: Implement Open Addressing with Linear Probing

**Goal:** Implement a second `OpenAddressingHashMap[K comparable, V any]` where all entries live in a flat array. Use linear probing for collision resolution. Use tombstone markers for deletion.

**Key Challenges:**
- Linear probing Put: if `buckets[hash % cap]` is Occupied by a different key, try `(hash % cap + 1) % cap`, then `(hash % cap + 2) % cap`, etc.
- Get must also probe: it cannot stop at an Empty slot reached mid-probe only because the slot is empty. Wait — it *can*: an Empty slot means the key was never inserted on this probe path. A Tombstone means there *was* something here that was deleted; skip it and keep probing.
- Resize: tombstones are not reinserted (they are expired). Only Occupied entries are reinserted.
- Danger: with load factor approaching 1.0, linear probing degrades badly (clustering). Keep load factor ≤ 0.70 for open addressing.

**Hints & Guidance:**
- Define `slotState` as an enum/const: `const (Empty = 0; Occupied = 1; Tombstone = 2)`.
- `type OpenEntry[K, V any] struct { key K; val V; state slotState }`.
- For Delete: set `buckets[probeIndex].state = Tombstone`. Do NOT zero out key/val (they may be needed for probing correctness in some variants). Do decrement `size`.
- Testing probe chains: use a map with capacity 8 and insert keys that all hash to index 0. Verify they end up at indices 0, 1, 2, 3, etc., and all are retrievable.

**Success Criteria:**
- All operations from Milestone 1 (Put, Get, Delete, Size) work correctly with open addressing.
- Deleting an entry in the middle of a probe chain does not break retrieval of entries after it in the chain (tombstone correctly bridges the gap).
- Benchmark shows open addressing is 1.5–3x faster than separate chaining for integer keys (better cache behavior).

---

### Milestone 4: Implement Hash Set

**Goal:** Build `HashSet[K comparable]` on top of `ChainingHashMap[K, struct{}]`. Implement `Add(key K)`, `Contains(key K) bool`, `Remove(key K) bool`, `Size() int`, and `Intersection`, `Union`, `Difference` set operations.

**Key Challenges:**
- In Go, `map[K]struct{}` is the idiomatic set. Use `struct{}` as the value type to signal "no value" and take zero additional memory.
- In C#, `HashSet&lt;T&gt;` exists in BCL. Build your own using your `ChainingHashMap&lt;T, bool&gt;` or `ChainingHashMap&lt;T, Unit&gt;` where `Unit` is a zero-size struct.
- Set operations: `Intersection` returns a new set containing keys present in both sets. Iterate the smaller set, check membership in the larger. `Union` iterates both and adds all. `Difference(A, B)` iterates A and includes keys not in B.

**Hints & Guidance:**
- `func (s *HashSet[K]) Add(key K) { s.m.Put(key, struct{}{}) }`.
- `func (s *HashSet[K]) Contains(key K) bool { _, ok := s.m.Get(key); return ok }`.
- For Intersection: `for _, k := range smaller.Keys() { if larger.Contains(k) { result.Add(k) } }`.
- Test: deduplicate a slice of 10,000 strings (with many duplicates) by adding all to a set and calling `Keys()`. Result should have only unique values.

**Success Criteria:**
- `Add` then `Contains` returns true; `Contains` on missing key returns false.
- `Remove` returns true for existing keys, false for missing keys.
- `Intersection({"a","b","c"}, {"b","c","d"})` returns `{"b","c"}`.
- `Union({"a","b"}, {"b","c"})` returns `{"a","b","c"}`.
- `Difference({"a","b","c"}, {"b"})` returns `{"a","c"}`.
- Deduplication of a 10,000-element slice with 5,000 unique values produces exactly 5,000 elements.

---

### Milestone 5: Implement Robin Hood Hashing

**Goal:** Extend the open-addressing map with Robin Hood hashing: during insertion, if the incoming entry has a longer probe length than the entry currently occupying the slot, swap them. Continue probing with the displaced entry.

**Key Challenges:**
- You need to track probe length (PSL — probe sequence length) for each entry. Add `psl int` field to `OpenEntry`.
- During Put: at each probe step, compute PSL of the incoming entry. If `incoming.psl > buckets[i].psl`, swap incoming with `buckets[i]` and continue probing with the swapped-out entry.
- Deletion is simpler: instead of tombstones, use "backward shift deletion." When you delete at index `i`, shift subsequent entries in the probe chain back by one slot until you find an empty slot or an entry with PSL == 0.

**Hints & Guidance:**
- PSL for a slot `i` containing key `k`: `psl = (i - hash(k) % cap + cap) % cap`. This is the number of positions the key has been displaced from its ideal bucket.
- Robin Hood property: after all insertions, the maximum PSL is minimized (balanced probe lengths). This makes average lookup time more predictable.
- Backward shift deletion: after deleting at `i`, check slot `(i+1) % cap`. If it has `psl > 0`, move it to `i` (decreasing its PSL by 1) and continue to `i+1`, repeating until empty or PSL == 0.
- Benchmark: compare Get performance (specifically the variance / standard deviation of lookup times) between linear probing and Robin Hood. Robin Hood should show lower variance.

**Success Criteria:**
- All operations produce correct results, verified against the standard-library map.
- After 10,000 inserts, the maximum PSL is less than 20 (log(n) bound for Robin Hood).
- Deletion without tombstones works correctly: delete an entry in the middle of a probe chain and verify that all subsequent entries in the chain are still retrievable.

---

### Milestone 6: Word Frequency Counter and Benchmark

**Goal:** Implement `WordFrequency(filepath string) map[string]int` using your `ChainingHashMap`. Benchmark it against the standard library map on a text file of at least 1MB (e.g., a Project Gutenberg novel).

**Key Challenges:**
- Tokenizing words from a file: split on whitespace and punctuation, lowercase all words.
- Your map's string hash function quality directly impacts performance here. Poor distribution means long chains on common prefixes.
- Benchmarking fairly: the stdlib map has had years of optimization. You will likely lose. Document the gap and explain why.

**Hints & Guidance:**
- In Go: `scanner := bufio.NewScanner(f); scanner.Split(bufio.ScanWords)`. Then normalize: `word = strings.ToLower(strings.Trim(word, ".,!?;:\"'()"))`.
- In C#: `StreamReader` with `ReadToEnd()` and `Regex.Split(text, @"\W+")` then `word.ToLower()`.
- For the benchmark: run 5 iterations of each, take median. Report: total words processed, unique words found, time, and words/second throughput.
- To make your map competitive: ensure your FNV-1a hash is correct, your load factor is 0.75, and your bucket count starts at a reasonable size (not 16 for a 50,000-word input).

**Success Criteria:**
- Word count results match the standard library map's results exactly (same unique words, same counts).
- Benchmark completes on a 1MB file in under 500ms.
- Performance gap vs. stdlib is documented with a reason (e.g., "stdlib uses open addressing with better cache behavior; our chaining map has pointer indirection per lookup").

---

## 7. Stretch Goals (for advanced learners)

1. **Implement consistent hashing.** Assign both keys and servers to positions on a hash ring. When a server is added or removed, only `n/servers` keys need to be remapped. Used by Cassandra, DynamoDB, and Akamai's CDN. Build a `ConsistentHashRing` that distributes keys across virtual nodes.
2. **Implement a concurrent hash map.** Use striped locking: divide the bucket array into `n` stripes (e.g., 16), each protected by its own mutex. `Put` and `Get` only lock the stripe for the target bucket. Benchmark throughput at 1, 2, 4, and 8 goroutines/threads.
3. **Implement a Bloom filter.** A space-efficient probabilistic set that never has false negatives but may have false positives. Uses `k` independent hash functions and a bitset. Implement it as a `BloomFilter` with `Add`, `MightContain`, and a configurable false-positive rate. Used in RocksDB and Cassandra to avoid disk reads for absent keys.
4. **HashDoS demonstration.** Build a program that generates 1,000 strings that all hash to the same bucket under your non-randomized FNV-1a hash. Demonstrate the O(n²) insertion degradation. Then implement hash-seed randomization (XOR with a per-instance random uint64) and show the attack no longer works.
5. **Implement LRU Cache** using a hash map plus a doubly-linked list. O(1) get and put. This is the most common interview question that requires knowing hash map internals, and it is the architecture of Redis's key eviction policy.

---

## 8. Testing & Validation Strategy

**Correctness (all implementations):**
- Empty map: `Get` returns `(zero, false)`, `Delete` returns `false`, `Size` returns 0.
- Single entry: Put then Get returns the correct value.
- Update: Put the same key twice, Get returns the second value, Size is still 1.
- Delete: Put then Delete then Get returns `(zero, false)`. Size is 0.
- Delete absent key returns `false`.
- 1,000 random insertions followed by 1,000 Gets all return the expected values.
- 1,000 insertions, 500 deletions (of known keys), 1,000 Gets: deleted keys return `(zero, false)`, remaining keys return correct values.

**Resize correctness:**
- Insert exactly `initial_capacity * load_factor + 1` entries. Verify resize occurred and all entries are still correct.
- Insert 10,000 entries into a map with initial capacity 4. Verify all entries are correct after multiple resizes.

**Collision handling:**
- Open addressing: force collisions at bucket 0 by using a map with capacity 4 and inserting keys 0, 4, 8, 12. Verify all four are retrievable.
- Chaining: same test. Verify the chain at bucket 0 has 4 nodes.

**Hash function quality test:**
- Insert 100,000 string keys. Count the number of chains (for chaining) or probe lengths (for open addressing) exceeding length 5. Should be near zero for FNV-1a.
- Use naive sum-of-chars hash as a baseline comparison. Show it produces far more long chains.

**Performance benchmarks:**
- `Put` 1,000,000 integer keys: complete in under 2 seconds.
- `Get` 1,000,000 existing integer keys: complete in under 500ms.
- `Get` 1,000,000 absent integer keys: complete in under 500ms.
- Open addressing should be 1.5–3x faster than chaining for integer keys (document if not).

---

## 9. C# and Go Implementation Notes

### C#

- **`GetHashCode()` as starting point.** Every C# object has `GetHashCode()` from `Object`. For strings, it is randomized per-process in .NET 5+. For your implementation, implement FNV-1a over the string's bytes directly: `Encoding.UTF8.GetBytes(key)` then apply FNV-1a. Do not rely on `string.GetHashCode()` in your hash map (it changes between runs).
- **`IEqualityComparer&lt;K&gt;` pattern.** Your hash map constructor should accept `IEqualityComparer&lt;K&gt; comparer = null` and default to `EqualityComparer&lt;K&gt;.Default`. Use `comparer.GetHashCode(key)` and `comparer.Equals(k1, k2)`. This is exactly how `Dictionary&lt;K,V&gt;` works.
- **Struct equality trap.** If `K` is a struct, `EqualityComparer&lt;K&gt;.Default` uses field-by-field comparison via reflection if `Equals` is not overridden. This is correct but slow. Document this pitfall in a comment.
- **`Dictionary&lt;K,V&gt;` internals.** .NET's `Dictionary&lt;K,V&gt;` uses open addressing with a prime-sized table and a linked-list structure *within* the flat array (not pointer-based chaining) since .NET 5+. It is not the same as either your chaining or linear-probing implementation.
- **Zero-allocation iteration.** Implement `IEnumerable<KeyValuePair&lt;K,V&gt;>` on your hash map so it works with `foreach`. For chaining, walk each bucket's chain. Use `yield return` for simplicity.
- **`GC.GetAllocatedBytesForCurrentThread()`** before and after 1,000,000 inserts to measure allocation pressure. Your chaining map allocates one `Entry` node per insert; your open-addressing map allocates almost nothing after initial array creation.

### Go

- **Go maps use open addressing with buckets of 8 entries.** Each Go map bucket holds up to 8 key-value pairs before chaining to an overflow bucket. `runtime.mapaccess1` and `runtime.mapassign` in the runtime source are worth reading after building your own. `go tool compile -S main.go` shows how `m[key]` compiles.
- **`comparable` constraint for keys.** In Go generics, `comparable` allows `==` and `!=` but not `&lt;`. Your hash map needs `comparable` for key equality checks. Your hash function must be provided externally since Go has no universal `GetHashCode()`. Provide helpers: `StringHash(s string) uint64`, `IntHash(n int) uint64`.
- **`map[K]struct{}` for sets.** This is the idiomatic Go set. `struct{}` takes exactly 0 bytes. A `map[string]struct{}` with 1,000,000 entries uses significantly less memory than `map[string]bool` (which allocates 1 byte per entry for the bool on modern compilers, but identical in practice — document what you measure).
- **Avoid `interface{}` / `any` for key or value in hot paths.** Storing `any` causes a heap allocation per value (boxing). Use generics: `type ChainingHashMap[K comparable, V any] struct`.
- **Integer hash functions.** For integer keys, do not use FNV-1a (it is designed for byte sequences). Use a multiply-shift hash: `func IntHash(x uint64) uint64 { x = (x ^ (x >> 30)) * 0xbf58476d1ce4e5b9; x = (x ^ (x >> 27)) * 0x94d049bb133111eb; return x ^ (x >> 31) }`. This is the finalizer from the splitmix64 PRNG and has excellent avalanche properties.
- **Benchmarking against stdlib:** `go test -bench=BenchmarkPut -benchmem -count=5`. The `-benchmem` flag shows allocations per operation. Your chaining map will show 1 alloc/op for Put (the Entry node); your open-addressing map should show 0 alloc/op after the initial resize.

---

## 10. Potential Extensions & Related Projects

1. **Build Your Own LRU Cache.** Combine your hash map with a doubly-linked list: the map stores key → list node, the list maintains LRU order. `Get` moves the accessed node to the front; `Put` evicts the tail when over capacity. This is the exact architecture of Redis's LRU eviction and the most common hash-map interview question.
2. **Build Your Own Trie.** For string-keyed maps where keys share long common prefixes (URL routing, file system paths, autocomplete), a trie achieves O(m) lookup (m = key length) versus O(m) hash computation + O(1) table lookup — but uses much less memory when prefixes are dense. Benchmark trie vs. hash map on a dictionary of 500,000 English words.
3. **Build Your Own Persistent Hash Map (HAMT).** A Hash Array Mapped Trie is an immutable hash map where "updates" produce a new map sharing structure with the old one. Used in Clojure (`PersistentHashMap`), Scala (`HashMap`), and Erlang. Each Put returns a new map in O(log n) time and O(log n) extra space.
4. **Build Your Own Graph with Adjacency Hash Map.** Represent a graph as `HashMap[NodeID, HashSet[NodeID]]` — each node maps to its set of neighbors. Implement BFS and DFS traversal. This is the natural representation for sparse graphs (social networks, dependency graphs) and exercises both your hash map and hash set implementations.
