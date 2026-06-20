# 04 - Stack

## What is a Stack?

A **stack** is a linear data structure that follows **LIFO** — Last In, First Out.

Think of a stack of plates:
- You put a plate on top (push)
- You take the top plate off (pop)
- You can only interact with the top plate

This is one of the simplest but most fundamental structures in computer science.

## Core Operations

| Operation | Description         | Time |
|-----------|---------------------|------|
| Push      | Add to top          | O(1) |
| Pop       | Remove from top     | O(1) |
| Peek      | Look at top without removing | O(1) |
| IsEmpty   | Check if empty      | O(1) |

## Mental Model

Stacks appear naturally in:
- Function call stack (every program has one)
- Undo functionality
- Expression evaluation and parsing
- Backtracking algorithms
- Browser history (back button)
- Many graph algorithms (DFS)

## Implementation

You can implement a stack using:
1. Dynamic array (most common and efficient)
2. Linked list (good when you want to avoid resizing or need to share structure)

### C# Implementation (Array-backed)

```csharp
public class MyStack<T> {
    private readonly List<T> _items = new();

    public void Push(T item) => _items.Add(item);
    public T Pop() {
        if (_items.Count == 0) throw new InvalidOperationException("Stack empty");
        var last = _items[^1];
        _items.RemoveAt(_items.Count - 1);
        return last;
    }
    public T Peek() {
        if (_items.Count == 0) throw new InvalidOperationException("Stack empty");
        return _items[^1];
    }
    public bool IsEmpty => _items.Count == 0;
    public int Count => _items.Count;
}
```

In real .NET you just use `System.Collections.Generic.Stack<T>`. It is implemented using an array + version counter for enumeration safety.

### Go Implementation

```go
type Stack[T any] struct {
    items []T
}

func (s *Stack[T]) Push(v T) {
    s.items = append(s.items, v)
}

func (s *Stack[T]) Pop() T {
    if len(s.items) == 0 {
        panic("stack empty")
    }
    n := len(s.items) - 1
    v := s.items[n]
    s.items = s.items[:n]
    return v
}

func (s *Stack[T]) Peek() T {
    if len(s.items) == 0 {
        panic("stack empty")
    }
    return s.items[len(s.items)-1]
}
```

Go standard library doesn't provide a generic Stack in `container`, so people either use slices directly or roll simple wrappers like this.

## Real World Use Cases

### 1. The Call Stack (Every Program)

When you call a function:
```csharp
void A() { B(); }
void B() { C(); }
void C() { return; }
```

The runtime pushes return addresses and locals onto a stack. When a function returns, it pops.

This is why recursion depth is limited by stack size.

### 2. Undo / Redo

Every text editor, Photoshop, spreadsheet:
- Each edit action is pushed onto an undo stack.
- Undo = pop and apply inverse operation.
- Redo often uses a second stack.

### 3. Expression Parsing & Evaluation

- Converting infix to postfix (Shunting-yard algorithm)
- Evaluating postfix expressions
- Matching brackets `() {} []`
- Syntax highlighting and compiler parsers

Classic problem: "Valid Parentheses"

### 4. Depth-First Search (DFS)

We will see this in detail later. DFS uses a stack (either the call stack via recursion or an explicit stack).

Used in:
- File system traversal
- Web crawlers
- Game AI (state space exploration)
- Dependency resolution (topological sort)

### 5. Browser History

The "Back" button is literally a stack of previous URLs.

### 6. Memory Management & Garbage Collection

Some GC algorithms and finalization queues use stacks.

### 7. .NET Specific

- `Stack<T>` is used in `System.Text.Json` for tracking object depth during serialization.
- Roslyn (C# compiler) uses stacks heavily while walking syntax trees.
- Many algorithms in ASP.NET middleware pipelines.

### 8. Go Specific

- The Go scheduler uses stacks (goroutine stacks).
- Parser and compiler in `go/ast` and `go/parser` use stack-based traversal.
- Many linters and static analysis tools use explicit stacks for DFS.

## Famous Problems That Use Stacks

1. **Valid Parentheses** / Bracket matching
2. **Next Greater Element** (monotonic stack)
3. **Daily Temperatures**
4. **Largest Rectangle in Histogram** (monotonic stack)
5. **Evaluate Reverse Polish Notation**
6. **Remove K Digits** to form smallest number
7. **Asteroid Collision**

We will implement several of these in the algorithms section.

## Monotonic Stack (Advanced but Extremely Useful)

A monotonic stack keeps elements in sorted (usually decreasing) order.

It is used to solve "next greater / previous smaller" problems in O(n) instead of O(n²).

Example intuition: "For each building, find the first taller building to the right."

You maintain a decreasing stack of indices. When you find a taller one, you pop and answer for previous buildings.

This pattern appears in:
- Stock span problems
- Histogram problems
- Temperature problems
- Many "next X" leetcode-style problems that show up in real monitoring systems

## Stack vs Recursion

Using an explicit stack instead of recursion often lets you:
- Handle much larger input (no call stack limit)
- Pause and resume processing
- Implement DFS iteratively

## Summary

Stack is simple but everywhere.

If your problem says:
- "last thing I did"
- "most recent"
- "go back"
- "undo"
- "depth first"

...your brain should immediately think **Stack**.


::: tip Project Lab
**Build it yourself:** [Stack-Based Expression Evaluator](/projects/tier-1/03-stack-calculator) — infix/postfix parsing, evaluation, and recursive descent.
:::

**Next:** [05 - Queue](05-queue.md)
