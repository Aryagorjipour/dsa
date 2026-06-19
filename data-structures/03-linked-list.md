# 03 - Linked List

## What is a Linked List?

A **linked list** is a linear collection of elements where each element (called a **node**) stores:
- The data
- A reference (pointer) to the next node (singly linked)
- Optionally a reference to the previous node (doubly linked)

Unlike arrays, nodes do **not** need to live next to each other in memory. They are scattered and connected by pointers.

## Visual

Singly Linked List:

```
[42] → [17] → [99] → [23] → null
```

Doubly Linked List:

```
null ← [42] ⇄ [17] ⇄ [99] ⇄ [23] → null
```

Each box is a separate heap allocation in most languages.

## Types

1. **Singly Linked** — only forward pointers
2. **Doubly Linked** — forward + backward
3. **Circular** — last points back to first (or first's prev points to last)

## Operations & Complexity

| Operation                  | Singly | Doubly | Notes |
|----------------------------|--------|--------|-------|
| Add to front               | O(1)   | O(1)   | With head reference |
| Add to back                | O(1)*  | O(1)   | *If you keep tail |
| Insert in middle           | O(n)   | O(n)   | Need to find position |
| Remove from front          | O(1)   | O(1)   | Easy |
| Remove from back           | O(n)   | O(1)   | Doubly needs tail |
| Remove arbitrary node      | O(n)   | O(1)*  | *If you have the node ref |
| Access by index            | O(n)   | O(n)   | No random access |
| Search                       | O(n)   | O(n)   | Linear scan |

This is the fundamental tradeoff vs arrays:
- Arrays win on access and locality
- Linked lists win on cheap insertion/deletion **at known positions** without shifting

## C# Implementation — Singly + Doubly

C# has `LinkedList<T>` which is a **doubly linked list** with sentinels.

Here is a clean from-scratch version for learning.

**Singly Linked List (C#)**

```csharp
public class SinglyLinkedList<T> {
    private class Node {
        public T Value;
        public Node? Next;
        public Node(T value) => Value = value;
    }

    private Node? _head;
    private int _count;

    public void AddFirst(T value) {
        var node = new Node(value) { Next = _head };
        _head = node;
        _count++;
    }

    public void AddLast(T value) {
        var node = new Node(value);
        if (_head == null) {
            _head = node;
        } else {
            var current = _head;
            while (current.Next != null) current = current.Next;
            current.Next = node;
        }
        _count++;
    }

    public bool RemoveFirst() {
        if (_head == null) return false;
        _head = _head.Next;
        _count--;
        return true;
    }

    public T? GetAt(int index) {
        var current = _head;
        for (int i = 0; i < index && current != null; i++) {
            current = current.Next;
        }
        return current?.Value;
    }

    public int Count => _count;
}
```

**Doubly Linked (simplified)**

Add `Prev` pointer on nodes + keep `_tail`.

Real `System.Collections.Generic.LinkedList<T>` keeps both head and tail, uses sentinel nodes internally for simpler edge cases.

## Go Implementation

Go does not have a built-in linked list in the language, but provides `container/list`:

```go
import "container/list"

l := list.New()
l.PushBack(42)
l.PushFront(17)
```

For learning, here is a manual doubly linked list:

```go
type Node[T any] struct {
    Value T
    Prev  *Node[T]
    Next  *Node[T]
}

type DoublyLinkedList[T any] struct {
    Head *Node[T]
    Tail *Node[T]
    len  int
}

func (l *DoublyLinkedList[T]) PushFront(v T) {
    n := &Node[T]{Value: v, Next: l.Head}
    if l.Head != nil {
        l.Head.Prev = n
    } else {
        l.Tail = n
    }
    l.Head = n
    l.len++
}
```

## Real World Use Cases

### 1. Low-Level / Systems

- Operating system process lists, file descriptor tables (sometimes)
- Linux kernel uses doubly linked lists *everywhere* (`struct list_head`)

### 2. Language Runtimes & Memory Management

- Some garbage collectors use linked lists for free lists or remembered sets.

### 3. Undo/Redo and History

Many text editors and applications keep a doubly linked list (or deque of commands) for undo because they need cheap removal from both ends and traversal.

### 4. Music / Media Players

"Next song", "Previous song" — classic doubly linked list use case (playlists).

### 5. Browser History Navigation (sometimes)

Forward and back buttons.

### 6. .NET Specific

`LinkedList<T>` is used internally in some `ConcurrentQueue<T>` segment implementations and certain legacy collection scenarios.

Most modern .NET code prefers `List<T>` + careful management because of cache locality.

### 7. Go Specific

`container/list` appears in:
- Some parts of the `net/http` (older code)
- Various buffer management code
- People rarely use it in new high-performance code. Slices dominate.

## When Linked Lists Win (Rare in 2025+)

- You need **O(1)** removal when you already have a pointer to the node (e.g., you have an iterator).
- You do a **lot** of insertions/deletions in the middle and almost never iterate or access by position.
- Memory is extremely fragmented and you cannot afford large contiguous allocations.

In practice, for most workloads, a dynamic array + swap-remove trick or a `Deque` is faster due to modern CPU caches.

## The Famous "Detect Cycle" Problem

This is *the* canonical linked list interview question that appears in real systems too.

We already showed Floyd's tortoise and hare (fast/slow pointers) in the fundamentals.

Full version appears in the algorithm chapter.

## Singly vs Doubly vs XOR Linked List (fun fact)

There is a clever technique called XOR linked list that stores only one pointer per node using bitwise XOR of prev and next. Used in some extremely memory-constrained embedded systems.

You probably won't need it.

## Summary — The Honest Take

**Linked lists are over-hyped in teaching.**

They teach you pointers and node thinking beautifully.

In modern high-performance code you reach for them **much less** than arrays, slices, or deques.

But they are still important because:
- Many old systems and kernels are built on them.
- Some concurrent data structures use linked nodes.
- They are the foundation for understanding more complex pointer-based structures (trees, skip lists, etc.).

**Next:** [04 - Stack](04-stack.md)
