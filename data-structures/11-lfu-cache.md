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

This is quite beautiful.

## Complete Implementation Sketch (C#)

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
    private readonly Dictionary<int, LinkedList<Node>> _freqToList = new();
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
            _minFreq = node.Freq; // min may have increased
        }
    }

    private void AddToFrequencyList(Node node) {
        if (!_freqToList.TryGetValue(node.Freq, out var list)) {
            list = new LinkedList<Node>();
            _freqToList[node.Freq] = list;
        }
        list.AddLast(node);
    }

    private void RemoveFromFrequencyList(Node node) {
        var list = _freqToList[node.Freq];
        list.Remove(node);
        if (list.Count == 0) {
            _freqToList.Remove(node.Freq);
        }
    }

    private void Evict() {
        var list = _freqToList[_minFreq];
        var toEvict = list.First!.Value;
        list.RemoveFirst();
        _keyToNode.Remove(toEvict.Key);
        if (list.Count == 0) {
            _freqToList.Remove(_minFreq);
        }
    }
}
```

The Go version follows the exact same structure using maps and a custom doubly linked list per frequency or using `container/list`.

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

**Next:** Trees! Starting with general n-ary trees.
