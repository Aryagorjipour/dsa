# 16 - Priority Queue

## What is a Priority Queue?

A **priority queue** is an abstract data type that always gives you the "highest priority" (or lowest, depending on definition) item next.

It is **not** FIFO like a regular queue.

"Priority" can mean:
- Smallest number (min-heap)
- Largest number (max-heap)
- Earliest deadline
- Highest customer tier
- Most urgent task

## The Relationship With Heap

In practice, **almost all priority queues are implemented using heaps** (usually binary heaps).

You can also implement them with:
- Self-balancing BSTs (SortedSet in C# can act as one)
- Fibonacci heaps (rare in practice)
- Buckets / counting structures (when priorities have limited range)

## Core API

```csharp
pq.Enqueue(item, priority);
var (item, priority) = pq.Dequeue();
var (item, priority) = pq.Peek();
```

## C# (.NET 6+ has a built-in one!)

```csharp
var pq = new PriorityQueue<string, int>();

pq.Enqueue("low", 10);
pq.Enqueue("high", 1);
pq.Enqueue("medium", 5);

while (pq.Count > 0) {
    var (item, pri) = pq.Dequeue();
    Console.WriteLine($"{item} (priority {pri})");
}
// Output: high, medium, low  (assuming min-heap on priority)
```

Under the hood it uses a binary heap + clever handling of ties.

## Go

Use `container/heap` with a custom type that includes priority.

Example:

```go
type Item struct {
    value    string
    priority int
    index    int // needed by heap.Interface
}

type PriorityQueue []*Item

func (pq PriorityQueue) Len() int { return len(pq) }
func (pq PriorityQueue) Less(i, j int) bool { return pq[i].priority < pq[j].priority }
func (pq PriorityQueue) Swap(i, j int) {
    pq[i], pq[j] = pq[j], pq[i]
    pq[i].index = i
    pq[j].index = j
}

func (pq *PriorityQueue) Push(x any) {
    n := len(*pq)
    item := x.(*Item)
    item.index = n
    *pq = append(*pq, item)
}

func (pq *PriorityQueue) Pop() any {
    old := *pq
    n := len(old)
    item := old[n-1]
    old[n-1] = nil
    item.index = -1
    *pq = old[0 : n-1]
    return item
}
```

Then:

```go
pq := &PriorityQueue{}
heap.Init(pq)
heap.Push(pq, &Item{value: "urgent", priority: 1})
item := heap.Pop(pq).(*Item)
```

## Real World Use Cases

### 1. Operating System Schedulers

The kernel must constantly decide "which process/thread runs next?"

Modern schedulers use sophisticated priority queues (often multiple queues + heaps).

### 2. Network Routers & QoS

Packets have priorities or deadlines. Routers decide which packet to send next.

### 3. Graph Algorithms

- Dijkstra's algorithm
- A* search
- Prim's MST algorithm

All of them are "repeatedly extract the best vertex" → priority queue.

### 4. Task Scheduling in Applications

- Background job processors (Hangfire, Quartz, Celery, Asynq)
- Rate limiters with different priorities
- Build systems (make, Bazel, MSBuild) — tasks have dependencies and priorities

### 5. Game AI and Simulation

- Which unit should act next?
- Which particle effect updates first?
- Event queues in simulations

### 6. Databases

- Query scheduling
- Background vacuum / compaction tasks
- Merge join operations

### 7. .NET Ecosystem

- `PriorityQueue<TElement, TPriority>` is used in ASP.NET, SignalR backplanes, Orleans, and many high-scale services.
- Kestrel (web server) uses priority queues for certain scheduling decisions.

### 8. Go Ecosystem

- Kubernetes scheduler core is built around priority queues.
- Many distributed systems and job runners use `container/heap`.

### 9. Real-time Systems & Audio

Low-latency audio and video often use priority queues for "most important buffer to process next".

## Advanced Variants

### Decrease-Key / Increase-Key

In Dijkstra, when we find a better path to a node, we need to **decrease** its priority in the queue.

Naive binary heap doesn't support this efficiently.

Solutions:
- Use a regular heap + "lazy deletion" (insert duplicates, ignore old ones when popped)
- Use Fibonacci heap (theoretical)
- Use an indexed heap or set + handle (C++ set, or .NET SortedSet with pairs + removal)

### Pairing Heap

Simpler than Fibonacci, often faster in practice.

### Bucket Queues / Dial's Algorithm

When priorities are small integers, you can use an array of buckets for O(1) operations.

## Common Problems

- Kth largest / smallest using priority queue
- Merge k sorted lists
- Find median from data stream (two heaps trick)
- Task scheduler with cooldown periods
- Reorganize string (rearrange with no two same adjacent)
- Sliding window problems sometimes use monotonic queues instead

## Summary

Priority Queue = "always give me the best next thing according to some ordering".

It is one of the most important abstract data types in algorithms and systems.

Almost always backed by a binary heap in real code.

**Next:** [17 - Trie](17-trie.md)
