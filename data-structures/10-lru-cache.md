# 10 - LRU Cache (Least Recently Used)

## What Problem Does LRU Solve?

You have limited space (memory, disk, CDN edge capacity).

You want to keep the **most recently used** items and automatically evict the **least recently used** ones when space runs out.

This is one of the most important caching strategies in the world.

## Definition

**LRU** = Least Recently Used.

When you need to make room:
- Evict the item that was used **longest ago**.

## Real-World Examples (You Use These Daily)

- Browser cache (which tabs/resources to keep)
- CDN edge caches (Cloudflare, Fastly, Akamai)
- Redis with `maxmemory-policy allkeys-lru` or `volatile-lru`
- Database buffer pools (PostgreSQL, MySQL, SQL Server)
- Operating system page cache
- CPU caches (L1/L2/L3 use variants of LRU / pseudo-LRU)
- Git's object cache and packfile caches
- Application-level caches in virtually every backend

## How to Implement an Efficient LRU Cache

Naive list + scan for least recent = slow.

The classic efficient design uses **two structures together**:

1. **Hash Map** — for O(1) key → node lookup
2. **Doubly Linked List** — to maintain usage order (most recent at tail or head, least recent at the other end)

When you access or insert a key:
- Move the corresponding node to the "most recently used" end
- If over capacity, remove from the "least recently used" end

All operations become O(1).

## Complete Implementation (C#)

```csharp
public class LRUCache<K, V> where K : notnull {
    private class Node {
        public K Key;
        public V Value;
        public Node? Prev;
        public Node? Next;
    }

    private readonly int _capacity;
    private readonly Dictionary<K, Node> _map = new();
    private readonly Node _head = new(); // sentinel
    private readonly Node _tail = new(); // sentinel
    private int _count;

    public LRUCache(int capacity) {
        _capacity = capacity;
        _head.Next = _tail;
        _tail.Prev = _head;
    }

    public bool TryGet(K key, out V value) {
        if (_map.TryGetValue(key, out Node? node)) {
            MoveToRecent(node);
            value = node.Value;
            return true;
        }
        value = default!;
        return false;
    }

    public void Put(K key, V value) {
        if (_map.TryGetValue(key, out Node? node)) {
            node.Value = value;
            MoveToRecent(node);
            return;
        }

        if (_count >= _capacity) {
            RemoveLRU();
        }

        var newNode = new Node { Key = key, Value = value };
        _map[key] = newNode;
        AddToRecent(newNode);
        _count++;
    }

    private void MoveToRecent(Node node) {
        RemoveNode(node);
        AddToRecent(node);
    }

    private void AddToRecent(Node node) {
        node.Prev = _tail.Prev;
        node.Next = _tail;
        _tail.Prev!.Next = node;
        _tail.Prev = node;
    }

    private void RemoveNode(Node node) {
        node.Prev!.Next = node.Next;
        node.Next!.Prev = node.Prev;
    }

    private void RemoveLRU() {
        Node lru = _head.Next!;
        RemoveNode(lru);
        _map.Remove(lru.Key);
        _count--;
    }
}
```

## Go Implementation

```go
type LRUCache[K comparable, V any] struct {
    capacity int
    cache    map[K]*node[K, V]
    head     *node[K, V]
    tail     *node[K, V]
}

type node[K comparable, V any] struct {
    key   K
    value V
    prev  *node[K, V]
    next  *node[K, V]
}

func NewLRUCache[K comparable, V any](capacity int) *LRUCache[K, V] {
    c := &LRUCache[K, V]{
        capacity: capacity,
        cache:    make(map[K]*node[K, V]),
    }
    c.head = &node[K, V]{}
    c.tail = &node[K, V]{}
    c.head.next = c.tail
    c.tail.prev = c.head
    return c
}

func (c *LRUCache[K, V]) Get(key K) (V, bool) {
    if n, ok := c.cache[key]; ok {
        c.moveToBack(n)
        return n.value, true
    }
    var zero V
    return zero, false
}

func (c *LRUCache[K, V]) Put(key K, value V) {
    if n, ok := c.cache[key]; ok {
        n.value = value
        c.moveToBack(n)
        return
    }
    if len(c.cache) >= c.capacity {
        c.evict()
    }
    n := &node[K, V]{key: key, value: value}
    c.cache[key] = n
    c.addToBack(n)
}

func (c *LRUCache[K, V]) moveToBack(n *node[K, V]) {
    c.removeNode(n)
    c.addToBack(n)
}

func (c *LRUCache[K, V]) addToBack(n *node[K, V]) {
    n.prev = c.tail.prev
    n.next = c.tail
    c.tail.prev.next = n
    c.tail.prev = n
}

func (c *LRUCache[K, V]) removeNode(n *node[K, V]) {
    n.prev.next = n.next
    n.next.prev = n.prev
}

func (c *LRUCache[K, V]) evict() {
    lru := c.head.next
    c.removeNode(lru)
    delete(c.cache, lru.key)
}
```

## Variants and Real Considerations

### 1. Thread Safety

Production LRU caches are almost always concurrent:
- C#: Use `ConcurrentDictionary` + careful locking, or `ReaderWriterLockSlim`, or a lock-free design.
- Go: Use `sync.RWMutex` or channels.

Many people use `sync.Map` + a separate eviction goroutine, or proven libraries.

### 2. TTL + LRU (Common Hybrid)

Many real caches do "LRU + expiration":
- Redis has both
- Many application caches combine both policies

### 3. Size-based Eviction (not just count)

Instead of "max 1000 items", you track total bytes (very common for image/CDN caches).

### 4. Segmented LRU / Multi-level

Some advanced caches (like in databases) have multiple LRU lists (hot, warm, cold) to protect frequently used items better.

### 5. Clock / Second Chance

Approximate LRU that is easier to implement concurrently (used in some OS page replacement and database buffer pools).

## Problems That Demonstrate LRU Thinking

- Design LRU Cache (LeetCode 146) — the classic
- LFU Cache (next chapter)
- Design a cache with TTL
- Implement a browser history with limited size

## How Real Systems Use It

- **PostgreSQL buffer manager**: Uses a clock-sweep approximation of LRU for buffer eviction.
- **Redis**: `allkeys-lru` and `volatile-lru` policies.
- **Cloudflare / Fastly**: Extremely sophisticated LRU variants at the edge for billions of objects.
- **Chrome**: Multiple layers of LRU caches for HTTP resources, decoded images, etc.
- **Windows**: Standby list in memory manager uses LRU-like aging.

## Why LRU Usually Beats FIFO and Random

- FIFO is too naive (a one-time spike can evict important data forever).
- LRU adapts to actual access patterns ("recency" is a very strong signal for most workloads).

## Summary

LRU Cache = HashMap + Doubly Linked List working together.

It is one of the highest-ROI structures you can add to any system that has memory pressure.

Once you implement it once from scratch, you will understand caching deeply for the rest of your career.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Cache with Eviction Policies](/projects/tier-2/05-cache-with-eviction) — LRU, LFU, and benchmarkable eviction policies in a swappable cache system.
:::

**Next:** [11 - LFU Cache](11-lfu-cache.md)
