# 05 - Queue

## What is a Queue?

A **queue** is a linear data structure that follows **FIFO** — First In, First Out.

Think of a line at a coffee shop:
- People join at the back (enqueue)
- People get served from the front (dequeue)

Oldest items are processed first.

## Core Operations

| Operation | Description           | Time (good impl) |
|-----------|-----------------------|------------------|
| Enqueue   | Add to back           | O(1)             |
| Dequeue   | Remove from front     | O(1)             |
| Peek      | Look at front         | O(1)             |
| IsEmpty   | Check if empty        | O(1)             |

## Implementations

You can implement a queue using:
- **Dynamic array** with head/tail indices (most common in practice)
- **Linked list** (especially doubly linked)
- **Two stacks** (clever trick, sometimes used in interviews)

### Why Not Just Use a List and Remove(0)?

Because `Remove(0)` on a dynamic array is O(n) — it shifts every element.

A proper queue implementation must make both ends fast.

### C# — Proper Queue Using Array

.NET has `Queue<T>` which is excellent.

Simplified version:

```csharp
public class MyQueue<T> {
    private T[] _data;
    private int _head;
    private int _tail;
    private int _count;

    public MyQueue(int capacity = 4) {
        _data = new T[capacity];
    }

    public void Enqueue(T item) {
        if (_count == _data.Length) Resize();
        _data[_tail] = item;
        _tail = (_tail + 1) % _data.Length;  // wrap around
        _count++;
    }

    public T Dequeue() {
        if (_count == 0) throw new InvalidOperationException("Empty");
        T item = _data[_head];
        _head = (_head + 1) % _data.Length;
        _count--;
        return item;
    }

    private void Resize() {
        T[] newData = new T[_data.Length * 2];
        for (int i = 0; i < _count; i++) {
            newData[i] = _data[(_head + i) % _data.Length];
        }
        _data = newData;
        _head = 0;
        _tail = _count;
    }
}
```

Note the **circular / ring** behavior using modulo. This is very important.

Real `System.Collections.Generic.Queue<T>` does exactly this pattern.

### Go

Go doesn't have a built-in `Queue` type. People use:
- `container/list` (doubly linked)
- Slices with head index (manual)
- Channels (for concurrent queues)

Simple slice + head:

```go
type Queue[T any] struct {
    data []T
    head int
}

func (q *Queue[T]) Enqueue(v T) {
    q.data = append(q.data, v)
}

func (q *Queue[T]) Dequeue() T {
    if len(q.data)-q.head == 0 {
        panic("empty")
    }
    v := q.data[q.head]
    q.head++
    // Optional: shrink slice when head is large to avoid memory leak
    if q.head > len(q.data)/2 {
        q.data = q.data[q.head:]
        q.head = 0
    }
    return v
}
```

Better production implementations use a ring buffer (next chapter).

## Real World Use Cases

### 1. Task Scheduling & Job Queues

- Message brokers: RabbitMQ, Kafka (partitions act like queues), Azure Service Bus, AWS SQS
- Background job processors: Hangfire, Quartz.NET, Sidekiq, Asynq (Go)
- Operating system process scheduler (ready queue)

### 2. Breadth-First Search (BFS)

BFS uses a queue. This is one of the most important graph algorithms.

Used for:
- Finding shortest path in unweighted graph
- Level-order tree traversal
- Web crawling (crawl level by level)
- Social network "degrees of separation"
- Puzzle solvers (Rubik's cube, chess endgames at low depth)

### 3. Buffering and Streaming

- Audio/video players (buffer frames)
- Network packet queues in routers and NICs
- Logging pipelines
- Producer-consumer patterns

### 4. Print Spooling

Classic "print queue".

### 5. .NET Specific

- `Queue<T>` used inside `Channel<T>` (System.Threading.Channels)
- ASP.NET request processing pipelines sometimes use queues
- `ConcurrentQueue<T>` is lock-free and used everywhere for high-performance producer/consumer

### 6. Go Specific

- Go channels are queues (buffered channels are bounded queues)
- The Go scheduler has goroutine queues per P (processor)
- Many worker pool implementations use queues

### 7. Rate Limiting & Fairness

Token bucket + queue of waiting requests.

## Variants

- **Priority Queue** — not FIFO, serves highest priority first (covered later)
- **Circular Queue** / Ring Buffer (next chapter) — bounded, efficient reuse of space
- **Deque** (double-ended queue) — can add/remove from both ends (very useful)
- **Blocking Queue** — thread-safe version that blocks when full/empty
- **ConcurrentQueue** — lock-free versions

## Famous Problems

- Implement Queue using Stacks (and vice versa)
- Design a circular queue
- Sliding window maximum (deque)
- Task scheduler with cooldown
- Number of recent calls (queue)

## Queue vs Stack Decision Guide

- "Process oldest first" or "level by level" → **Queue**
- "Process most recent first" or "backtrack" → **Stack**

## Summary

Queues are fundamental to:
- Concurrency
- Graph algorithms (BFS)
- Almost every distributed system

Master both the array-backed circular version and the linked version conceptually.


::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Task Queue System](/projects/tier-2/06-task-queue-system) — ring buffer, priority queue, and dependency-aware scheduling.
:::

**Next:** [06 - Deque](06-deque.md) — the Swiss Army knife of linear structures.
