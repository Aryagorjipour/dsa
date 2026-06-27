# 11 - LFU Cache (Least Frequently Used)

## The Problem LFU Solves

LRU evicts based on **recency**.

Sometimes that's wrong.

Imagine:
- You have a cache of size 3
- Item A is accessed 1000 times in the first minute, then never again.
- Items B and C are accessed once every minute.

LRU will happily keep A forever because it was used "most recently" (even if that was hours ago), while B and C keep getting evicted.

**LFU** (Least Frequently Used) evicts the item with the **lowest access count**.

## Definition

**LFU** = Least Frequently Used.

When you need to evict, remove the item that has been accessed the fewest times.

## Challenges With Pure LFU

1. **New items** start with count=1 and can be immediately evicted even if they are about to become very popular (cache pollution).
2. **Aging** — old high-frequency items can stay forever even if they are no longer used (same problem as LRU in reverse).
3. **Implementation complexity** — you need to track frequencies efficiently and find the minimum quickly.

Real systems almost always use **hybrid** or **approximate** LFU.

## Classic Efficient LFU Design

One of the most elegant designs (popularized by LeetCode 460) uses:

- A **HashMap** from key → (value + frequency + list node)
- A **frequency map**: `int → DoublyLinkedList` of nodes that have that frequency
- A variable tracking the **minimum frequency**
- All operations O(1)

When you access an item:
- Increase its frequency
- Move it from old frequency list to new frequency list
- Update min frequency if needed

When evicting:
- Remove from the list at `minFrequency`

## Operations & Complexity

| Operation | Time   | Space        | Notes |
|-----------|--------|--------------|-------|
| `Get`     | O(1)   | O(capacity)  | Bumps frequency; may update min freq |
| `Put`     | O(1)   | O(capacity)  | Evicts LFU bucket when full |
| Evict     | O(1)   | —            | Always from `minFrequency` list |

## Complete Implementation (C#)

```csharp
public class LFUCache<K, V> where K : notnull {
    private class Node {
        public K Key;
        public V Value;
        public int Freq = 1;
        public Node? Prev, Next;
    }

    private readonly int _capacity;
    private readonly Dictionary<K, Node> _keyToNode = new();
    private readonly Dictionary<int, (Node Head, Node Tail, int Count)> _freqToList = new();
    private int _minFreq;

    public LFUCache(int capacity) { _capacity = capacity; }

    public bool TryGet(K key, out V value) {
        if (!_keyToNode.TryGetValue(key, out Node? node)) {
            value = default!;
            return false;
        }
        UpdateFrequency(node);
        value = node.Value;
        return true;
    }

    public void Put(K key, V value) {
        if (_capacity == 0) return;

        if (_keyToNode.TryGetValue(key, out Node? node)) {
            node.Value = value;
            UpdateFrequency(node);
            return;
        }

        if (_keyToNode.Count >= _capacity) {
            Evict();
        }

        var newNode = new Node { Key = key, Value = value, Freq = 1 };
        _keyToNode[key] = newNode;
        AddToFrequencyList(newNode);
        _minFreq = 1;
    }

    private void UpdateFrequency(Node node) {
        RemoveFromFrequencyList(node);
        node.Freq++;
        AddToFrequencyList(node);
        if (!_freqToList.ContainsKey(_minFreq)) {
            _minFreq = node.Freq;
        }
    }

    private void AddToFrequencyList(Node node) {
        if (!_freqToList.TryGetValue(node.Freq, out var list)) {
            var head = new Node();
            var tail = new Node();
            head.Next = tail;
            tail.Prev = head;
            list = (head, tail, 0);
            _freqToList[node.Freq] = list;
        }
        var (head, tail, count) = list;
        node.Prev = tail.Prev;
        node.Next = tail;
        tail.Prev!.Next = node;
        tail.Prev = node;
        _freqToList[node.Freq] = (head, tail, count + 1);
    }

    private void RemoveFromFrequencyList(Node node) {
        var (head, tail, count) = _freqToList[node.Freq];
        node.Prev!.Next = node.Next;
        node.Next!.Prev = node.Prev;
        count--;
        if (count == 0) {
            _freqToList.Remove(node.Freq);
        } else {
            _freqToList[node.Freq] = (head, tail, count);
        }
    }

    private void Evict() {
        var (head, tail, _) = _freqToList[_minFreq];
        var toEvict = head.Next!;
        RemoveFromFrequencyList(toEvict);
        _keyToNode.Remove(toEvict.Key);
    }
}
```

## Complete Implementation (Go)

```go
type lfuNode[K comparable, V any] struct {
    key   K
    value V
    freq       int
    prev, next *lfuNode[K, V]
}

type freqList[K comparable, V any] struct {
    head, tail *lfuNode[K, V]
    count      int
}

type LFUCache[K comparable, V any] struct {
    capacity   int
    minFreq    int
    keyToNode  map[K]*lfuNode[K, V]
    freqToList map[int]*freqList[K, V]
}

func NewLFUCache[K comparable, V any](capacity int) *LFUCache[K, V] {
    return &LFUCache[K, V]{
        capacity:   capacity,
        keyToNode:  make(map[K]*lfuNode[K, V]),
        freqToList: make(map[int]*freqList[K, V]),
    }
}

func (c *LFUCache[K, V]) Get(key K) (V, bool) {
    node, ok := c.keyToNode[key]
    if !ok {
        var zero V
        return zero, false
    }
    c.updateFrequency(node)
    return node.value, true
}

func (c *LFUCache[K, V]) Put(key K, value V) {
    if c.capacity == 0 {
        return
    }
    if node, ok := c.keyToNode[key]; ok {
        node.value = value
        c.updateFrequency(node)
        return
    }
    if len(c.keyToNode) >= c.capacity {
        c.evict()
    }
    node := &lfuNode[K, V]{key: key, value: value, freq: 1}
    c.keyToNode[key] = node
    c.addToFreqList(node)
    c.minFreq = 1
}

func (c *LFUCache[K, V]) updateFrequency(node *lfuNode[K, V]) {
    c.removeFromFreqList(node)
    node.freq++
    c.addToFreqList(node)
    if _, ok := c.freqToList[c.minFreq]; !ok {
        c.minFreq = node.freq
    }
}

func (c *LFUCache[K, V]) addToFreqList(node *lfuNode[K, V]) {
    fl, ok := c.freqToList[node.freq]
    if !ok {
        head, tail := &lfuNode[K, V]{}, &lfuNode[K, V]{}
        head.next, tail.prev = tail, head
        fl = &freqList[K, V]{head: head, tail: tail}
        c.freqToList[node.freq] = fl
    }
    node.prev, node.next = fl.tail.prev, fl.tail
    fl.tail.prev.next, fl.tail.prev = node, node
    fl.count++
}

func (c *LFUCache[K, V]) removeFromFreqList(node *lfuNode[K, V]) {
    fl := c.freqToList[node.freq]
    node.prev.next, node.next.prev = node.next, node.prev
    fl.count--
    if fl.count == 0 {
        delete(c.freqToList, node.freq)
    }
}

func (c *LFUCache[K, V]) evict() {
    fl := c.freqToList[c.minFreq]
    victim := fl.head.next
    c.removeFromFreqList(victim)
    delete(c.keyToNode, victim.key)
}
```

## Real LFU in Production

Pure LFU is rare. Most systems use:

- **TinyLFU** (used by Caffeine in Java) — uses a small frequency sketch (Count-Min sketch) + admission window.
- **Adaptive Replacement Cache (ARC)** — combines LRU and LFU ideas.
- **LIRS** (Low Inter-reference Recency Set)
- **Redis** has `lfu` policies that are approximate and include decay.

## Why LFU Is Harder Than LRU

- Frequency needs aging or the cache becomes "stuck" with old popular items.
- You need efficient "find minimum frequency" data structure.
- New items need a chance to prove themselves.

## Famous Problems

- LFU Cache (LeetCode 460)
- Design a cache with multiple eviction policies
- Implement TinyLFU or ARC (advanced)

## When to Choose LFU vs LRU

| Workload Pattern                    | Better Policy |
|-------------------------------------|---------------|
| Recency matters a lot (news, sessions) | LRU        |
| Some items are genuinely much more popular long-term | LFU |
| Mixed (most production)             | Hybrid / ARC / TinyLFU |

## Summary

LFU is the "popularity contest" cache.

It is more powerful than LRU in many stable workloads, but significantly harder to implement correctly and efficiently.

Most engineers will implement LRU from scratch at some point. Fewer will need to implement full LFU — but understanding the concepts makes you dangerous in a good way when tuning caches.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Cache with Eviction Policies](/projects/tier-2/05-cache-with-eviction) — compare LRU vs heap-LFU vs O(1) bucket-LFU on Zipfian workloads.
:::

**Next:** [12 - N-ary Tree](12-tree-n-ary.md)