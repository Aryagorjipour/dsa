# 02 - Dynamic Array

## What is a Dynamic Array?

A **dynamic array** is a resizable array.

It gives you:
- O(1) random access like a regular array
- The ability to grow and shrink as you add/remove elements

This is the workhorse structure behind:
- C#: `List&lt;T&gt;`
- Java: `ArrayList`
- Go: slices (`[]T` with `append`)
- Python: `list`
- JavaScript: arrays (they are dynamic)

## How It Actually Works (The Secret)

A dynamic array maintains:
1. A **backing fixed array** (the real contiguous memory)
2. A **count** (logical size)
3. A **capacity** (physical size of the backing array)

When you add an element:
- If `count < capacity` → just put it in and increment count. **O(1)**
- If full → allocate a **larger** array (usually 2×), copy everything over, then add. This is O(n) for that operation.

Because resizing is rare, over many operations the cost is **amortized O(1)** per addition.

## Growth Strategy

Most implementations double the capacity when full.

- .NET `List&lt;T&gt;` doubles
- Go slices grow by 2x when small, then by 1.25x when larger (implementation has evolved)

Doubling gives excellent amortized performance.

## Operations

| Operation            | Average     | Worst Case     | Notes |
|----------------------|-------------|----------------|-------|
| Append / Add         | O(1) amortized | O(n)         | Resize |
| Access by index      | O(1)        | O(1)           | Always |
| Insert at position   | O(n)        | O(n)           | Shift elements |
| Remove at position   | O(n)        | O(n)           | Shift |
| Remove last          | O(1)        | O(1)           | Just decrement count |
| Search               | O(n)        | O(n)           | Linear scan |

## C# — List&lt;T&gt; Internals (Simplified)

```csharp
public class MyList<T> {
    private T[] _items;
    private int _size;
    private int _capacity;

    public MyList() {
        _capacity = 4;
        _items = new T[_capacity];
    }

    public void Add(T item) {
        if (_size == _capacity) {
            Resize();
        }
        _items[_size++] = item;
    }

    private void Resize() {
        int newCapacity = _capacity * 2;
        T[] newArray = new T[newCapacity];
        Array.Copy(_items, newArray, _size);
        _items = newArray;
        _capacity = newCapacity;
    }

    public T this[int index] {
        get {
            if (index < 0 || index >= _size) throw new IndexOutOfRangeException();
            return _items[index];
        }
        set {
            if (index < 0 || index >= _size) throw new IndexOutOfRangeException();
            _items[index] = value;
        }
    }

    public int Count => _size;
}
```

Real .NET `List<T>` does exactly this plus some optimizations (it uses `Array.Copy` which is highly optimized, and has `EnsureCapacity`).

## Go — Slices

In Go, a slice is a small header struct:

```go
type slice struct {
    array unsafe.Pointer
    len   int
    cap   int
}
```

When you do:

```go
s := []int{1, 2, 3}
s = append(s, 4)
```

The runtime does the same dance:
- If len < cap, just write and increase len.
- If full, allocate bigger backing array (with growth policy), copy, update header.

You can preallocate:

```go
s := make([]int, 0, 1000) // length 0, capacity 1000
```

This avoids many resizes.

## Real World Use Cases

### Everywhere

Dynamic arrays are the default "list" in almost every application.

### Specific Notable Uses

- **.NET**: `List<T>` is used in ASP.NET model binding, Entity Framework, JSON serialization (System.Text.Json), logging buffers, etc.
- **Go**: Every slice in the standard library and your code. `[]byte` buffers in `net/http`, `io`, `encoding/*`.
- **Databases**: In-memory row buffers, sort buffers, query result materialization.
- **Game engines**: Entity lists, particle systems, command buffers.
- **Compilers**: Token lists, AST node lists (before they become trees).
- **Text editors**: Line lists, undo stacks (though gap buffers are also used for the actual text — see later chapter).

### Memory & Performance Reality

Because they are contiguous, iteration is extremely fast due to CPU prefetching.

This is why `List<T>` or `[]T` often beats `LinkedList` by a huge margin even for insert-heavy workloads (unless inserts are at the front constantly).

## Common Patterns

### Pre-size when you know the size

```csharp
var results = new List<int>(expectedCount);
```

```go
results := make([]int, 0, expectedCount)
```

### Remove from middle efficiently

If order doesn't matter:

```csharp
// C# trick - swap with last then remove last
list[index] = list[list.Count - 1];
list.RemoveAt(list.Count - 1);
```

Same pattern in Go.

### Copy-on-write or slicing in Go

Go slices are very cheap to create from other slices because they share the backing array (until append forces reallocation).

```go
header := data[:10]           // new slice header, same array
body := data[10:len(data)]
```

Be careful with aliasing.

## Pitfalls

1. **Accidental O(n²)** from repeated `Insert(0, x)` or `Remove(0)`.
2. **Capacity leaks**: In Go, if you slice a small window out of a giant array and keep it around, the whole backing array stays alive (memory leak until you copy).
3. **Forgetting to preallocate** in hot paths.
4. In C#, using `List<T>` when `ImmutableList<T>` or `Span<T>` would be better for safety or performance.

## Comparison With Other Structures

| Use Case                        | Use Dynamic Array | Use Something Else |
|---------------------------------|-------------------|--------------------|
| Need fast random access         | Yes               | —                  |
| Frequent insert at front        | No                | LinkedList / Deque |
| Need to keep sorted + search    | No                | SortedSet / Tree   |
| Need O(1) removal by value      | No                | HashSet            |
| Frequent append + occasional shrink | Yes            | Yes                |

## Full Practical Example: A Simple Ring-Style Buffer on Top of Dynamic Array (Preview)

We'll build a proper Ring Buffer in a later chapter. But many people start with a List and just clear or use modulo logic.

## Summary

Dynamic array = the best "default list" for 80% of use cases because:
- Amazing cache behavior
- O(1) access
- Amortized O(1) append

Master it. You will use it every single day.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Sorting Benchmarker](/projects/tier-1/02-sorting-benchmarker)
:::

**Next:** [03 - Linked List](03-linked-list.md)
