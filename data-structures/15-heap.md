# 15 - Heap

## What is a Heap?

A **heap** is a specialized tree-based data structure that satisfies the **heap property**.

There are two main kinds:

- **Max-Heap**: Every parent is **greater than or equal to** its children. The largest element is always at the root.
- **Min-Heap**: Every parent is **less than or equal to** its children. The smallest element is always at the root.

Heaps are **not** sorted. They only guarantee the root is the extreme value.

## Binary Heap (The Common One)

We almost always mean **binary heap** when we say "heap".

It is a **complete binary tree** (all levels full except possibly the last, filled left-to-right).

This property lets us store it very efficiently in an **array** without using node objects.

## Array Representation (The Trick)

![Heap as Tree and Array](/images/heap-array.png)

For a node at index `i`:
- Left child: `2*i + 1`
- Right child: `2*i + 2`
- Parent: `(i - 1) / 2`

This is incredibly cache-friendly and memory efficient.

## Core Operations

| Operation       | Time     | Description |
|-----------------|----------|-----------|
| Peek (Get root) | O(1)     | Just look at index 0 |
| Insert          | O(log n) | Add at end, "bubble up" (heapify up) |
| Extract-Min/Max | O(log n) | Remove root, put last element at root, "bubble down" (heapify down) |
| Build-Heap      | O(n)     | Turn an arbitrary array into a heap |

## Implementation (Min-Heap in C#)

```csharp
public class MinHeap {
    private readonly List<int> _data = new();

    public int Count => _data.Count;
    public int Peek() => _data.Count > 0 ? _data[0] : throw new InvalidOperationException();

    public void Insert(int val) {
        _data.Add(val);
        HeapifyUp(_data.Count - 1);
    }

    public int ExtractMin() {
        if (_data.Count == 0) throw new InvalidOperationException();
        int min = _data[0];
        _data[0] = _data[^1];
        _data.RemoveAt(_data.Count - 1);
        HeapifyDown(0);
        return min;
    }

    private void HeapifyUp(int i) {
        while (i > 0) {
            int parent = (i - 1) / 2;
            if (_data[i] >= _data[parent]) break;
            (_data[i], _data[parent]) = (_data[parent], _data[i]);
            i = parent;
        }
    }

    private void HeapifyDown(int i) {
        int n = _data.Count;
        while (true) {
            int left = 2 * i + 1;
            int right = 2 * i + 2;
            int smallest = i;

            if (left < n && _data[left] < _data[smallest]) smallest = left;
            if (right < n && _data[right] < _data[smallest]) smallest = right;

            if (smallest == i) break;
            (_data[i], _data[smallest]) = (_data[smallest], _data[i]);
            i = smallest;
        }
    }
}
```

## Go Version (Min Heap)

```go
type MinHeap []int

func (h MinHeap) Len() int           { return len(h) }
func (h MinHeap) Less(i, j int) bool { return h[i] < h[j] }
func (h MinHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }

func (h *MinHeap) Push(x any) {
    *h = append(*h, x.(int))
}

func (h *MinHeap) Pop() any {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[0 : n-1]
    return x
}
```

Go's `container/heap` package uses the interface pattern above. You embed your slice and implement the interface.

## Real World Use Cases

### 1. Priority Queues (Next Chapter)

Heaps are the most common way to implement priority queues.

### 2. Dijkstra's Shortest Path & A*

Both algorithms use a priority queue. The heap is the workhorse.

### 3. Heap Sort

One of the few O(n log n) in-place sorts with O(1) extra space.

### 4. Task Scheduling

Operating systems use heaps (or multi-level feedback queues backed by heaps) to pick the next process.

### 5. .NET

- `PriorityQueue<TElement, TPriority>` (since .NET 6) is implemented using a binary heap.
- Used in Kestrel, various schedulers, background services.

### 6. Go

- `container/heap` is used in many priority-based schedulers and algorithms.
- Kubernetes scheduler, many database internal queues.

### 7. Databases & Storage

- Merge operations during external sort
- Top-K queries
- Managing background compaction priorities

### 8. Games

- AI decision making (best action first)
- Event queues (next event to process)
- Pathfinding

## Heap Variants

- **Binary Heap** (most common)
- **Fibonacci Heap** — theoretically amazing (O(1) decrease-key), horrible in practice due to constants and cache misses. Mostly of theoretical interest.
- **Binomial Heap**
- **d-ary Heap** — higher branching factor can be faster in practice for some workloads (used in some Java priority queues).

## Important Heap Properties

- It is **not** a sorted array.
- You only have a **guarantee about the root**.
- After `BuildHeap` on an array of n elements, you have a valid heap in O(n) — not O(n log n). This is a nice result.

## Common Heap Problems

- Kth Largest Element in an Array (use min-heap of size k)
- Top K Frequent Elements
- Merge K Sorted Lists
- Find Median from Data Stream (two heaps)
- Task Scheduler (with cooldown)
- Sliding Window Maximum (actually monotonic deque, not heap)

## Summary

Heap = complete binary tree in array form + heap property.

It gives you the ability to always get the "best" (min or max) item extremely efficiently.

This is why it powers priority queues, scheduling, graph algorithms, and many "Top K" problems.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Cache with Eviction](/projects/tier-2/05-cache-with-eviction)
:::

**Next:** [16 - Priority Queue](16-priority-queue.md)
