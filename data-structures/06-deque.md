# 06 - Deque (Double-Ended Queue)

## What is a Deque?

A **deque** (pronounced "deck") is a double-ended queue.

You can efficiently:
- Add/remove from **both front and back**
- Peek at both ends

This makes it extremely versatile.

It can behave as:
- A regular queue
- A stack
- A sliding window buffer
- A palindrome checker helper
- Undo + redo in one structure

## Core Operations (All O(1) in a good implementation)

- `AddFront` / `AddBack`
- `RemoveFront` / `RemoveBack`
- `PeekFront` / `PeekBack`

## How It Is Implemented Efficiently

Two common good ways:

1. **Doubly Linked List** — trivial to add/remove both ends. Used by `LinkedList<T>` tricks.
2. **Dynamic Array + clever indexing** (circular buffer style) — best cache behavior. Used by most high-performance deques.

C# `Deque<T>` in older experimental packages and many custom implementations use a circular buffer with two "heads".

.NET 9+ has experimental `Deque<T>` in some packages, but traditionally people use `LinkedList<T>` or roll their own.

## C# Implementation Sketch (Circular Array Backed)

```csharp
public class Deque<T> {
    private T[] _buffer = new T[8];
    private int _head;
    private int _tail;
    private int _count;

    private int Capacity => _buffer.Length;

    public void AddFront(T item) {
        if (_count == Capacity) Resize();
        _head = (_head - 1 + Capacity) % Capacity;
        _buffer[_head] = item;
        _count++;
    }

    public void AddBack(T item) {
        if (_count == Capacity) Resize();
        _buffer[_tail] = item;
        _tail = (_tail + 1) % Capacity;
        _count++;
    }

    public T RemoveFront() {
        if (_count == 0) throw new InvalidOperationException();
        T val = _buffer[_head];
        _head = (_head + 1) % Capacity;
        _count--;
        return val;
    }

    public T RemoveBack() {
        if (_count == 0) throw new InvalidOperationException();
        _tail = (_tail - 1 + Capacity) % Capacity;
        T val = _buffer[_tail];
        _count--;
        return val;
    }

    // Resize logic similar to dynamic array + copy with wrap handling
    private void Resize() { /* ... */ }
}
```

## Go

`container/list` can be used as a deque (PushFront, PushBack, Remove, etc.).

Many people implement a simple slice + two indices or use a library.

## Real World Use Cases

### 1. Sliding Window Maximum / Minimum

This is one of the most beautiful and practical uses of a deque.

Problem: For every window of size K in an array, find the maximum.

Naive = O(nK). With deque = O(n).

How:
- Maintain a deque of **indices** in decreasing order of their values.
- Front of deque is always the max for current window.
- When sliding, remove indices out of window from front.
- Remove smaller values from back before adding new.

Used in:
- Stock price analysis
- Real-time metrics dashboards
- Signal processing

### 2. Undo / Redo (again)

Some implementations keep operations in a deque so you can go both ways.

### 3. Palindrome Checking

Add characters to back while reading, then compare from both ends.

### 4. Job Stealing in Schedulers

Work-stealing schedulers (used in .NET TPL, Go scheduler, Java ForkJoin) use deques:
- Owner thread pops from one end
- Thief threads steal from the other end
- Excellent cache and contention properties.

This is why deques are incredibly important in concurrent programming.

### 5. Browser Tab Management / History

Some history implementations allow efficient "forward" and "back" + branch points.

### 6. Networking

Some TCP implementations and buffering strategies use deques for out-of-order segment handling.

### 7. Game Development

- Command buffers that can be rewound
- Input event queues where you sometimes need to inject events at front

### 8. .NET TPL and ThreadPool

The .NET ThreadPool uses work-stealing deques internally for excellent scalability.

### 9. Go Runtime

The Go scheduler uses deques for runnable goroutine queues in the work stealing algorithm.

## Famous Problems

- Sliding Window Maximum (LeetCode 239)
- Design Front Middle Back Queue
- Palindrome Linked List (can be solved with deque or two pointers + reverse)
- Shortest Subarray with Sum at Least K (deque monotonic)

## Comparison Table

| Structure     | Add Front | Add Back | Remove Front | Remove Back | Random Access | Best For |
|---------------|-----------|----------|--------------|-------------|---------------|----------|
| Array/List    | O(n)      | O(1)am   | O(n)         | O(1)        | O(1)          | Most things |
| LinkedList    | O(1)      | O(1)     | O(1)         | O(1)        | O(n)          | Frequent end ops |
| Deque         | O(1)      | O(1)     | O(1)         | O(1)        | O(1) or O(n)  | Both ends + sliding |
| Stack         | -         | O(1)     | -            | O(1)        | -             | LIFO |
| Queue         | -         | O(1)     | O(1)         | -           | -             | FIFO |

## When to Reach For a Deque

Whenever your problem says:
- "I need to add/remove from both ends"
- "Sliding window of any kind"
- "Work stealing"
- "I want a queue but I sometimes need to put urgent items at the front"

## Summary

The deque is the most flexible linear structure. In high-performance concurrent systems it is often preferred over plain queues and stacks because of its two-ended nature and work-stealing friendliness.

**Next:** [07 - Ring Buffer](07-ring-buffer.md) — the bounded, memory-efficient cousin that powers a huge amount of systems code.
