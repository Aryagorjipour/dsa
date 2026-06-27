# 29 - Rope

## What is a Rope?

A **rope** is a binary tree data structure designed for **efficient manipulation of very long strings**.

### Canonical Problem: Efficient Editing of Very Large Documents (Text Editors with Million+ Lines)

**Problem:**

In a text editor handling a 10 MB+ file, you need:
- Insert/delete at arbitrary positions in O(log n)
- Extract substring
- Concatenate
- Without O(n) copies every time.

Standard string (contiguous array) makes middle inserts O(n).

Rope splits the string into small chunks in a balanced tree, allowing local changes to be cheap.

Instead of storing the entire string in one contiguous buffer, a rope splits the string into pieces (leaves) and connects them in a tree.

Each internal node stores the total length of the string in its left subtree.

## Operations & Complexity

| Operation        | Time     | Space |
|------------------|----------|-------|
| Index (char at i)| O(log n) | O(n)  |
| Concat           | O(1)     | O(1)  |
| Split            | O(log n) | O(log n) |
| Insert           | O(log n) | O(log n) |
| Delete           | O(log n) | O(log n) |
| ToString         | O(n)     | O(n)  |

## Complete Implementation (C#)

```csharp
public class Rope {
    public Rope? Left, Right;
    public int Weight;
    public string Value = "";

    public int Length() => Weight + (Right?.Length() ?? 0);

    public static Rope FromString(string s, int chunkSize = 8) {
        if (s.Length <= chunkSize) return new Rope { Value = s, Weight = s.Length };
        int mid = s.Length / 2;
        return Concat(FromString(s[..mid], chunkSize), FromString(s[mid..], chunkSize));
    }

    public static Rope Concat(Rope? a, Rope? b) {
        if (a == null) return b!;
        if (b == null) return a;
        return new Rope { Left = a, Right = b, Weight = a.Length() };
    }

    public (Rope left, Rope right) Split(int index) {
        if (Left == null && Right == null) {
            return (FromString(Value[..index]), FromString(Value[index..]));
        }
        if (index < Weight) {
            var (l, r) = Left!.Split(index);
            return (l, Concat(r, Right));
        }
        var (l2, r2) = Right!.Split(index - Weight);
        return (Concat(Left, l2), r2);
    }

    public Rope Insert(int index, string text) {
        var (left, right) = Split(index);
        return Concat(Concat(left, FromString(text)), right);
    }

    public char Index(int i) {
        if (Left == null && Right == null) return Value[i];
        if (i < Weight) return Left!.Index(i);
        return Right!.Index(i - Weight);
    }

    public string ToString() {
        if (Left == null && Right == null) return Value;
        return (Left?.ToString() ?? "") + (Right?.ToString() ?? "");
    }
}
```

## Complete Implementation (Go)

From `examples/go/rope_basic.go`, expanded with Concat, Split, and Insert.

```go
type Rope struct {
    left, right *Rope
    weight      int
    value       string
}

func (r *Rope) Len() int {
    if r == nil {
        return 0
    }
    return r.weight + r.right.Len()
}

func FromString(s string, chunkSize int) *Rope {
    if chunkSize <= 0 {
        chunkSize = 8
    }
    if len(s) <= chunkSize {
        return &Rope{value: s, weight: len(s)}
    }
    mid := len(s) / 2
    return Concat(FromString(s[:mid], chunkSize), FromString(s[mid:], chunkSize))
}

func Concat(a, b *Rope) *Rope {
    if a == nil {
        return b
    }
    if b == nil {
        return a
    }
    return &Rope{left: a, right: b, weight: a.Len()}
}

func (r *Rope) Split(index int) (*Rope, *Rope) {
    if r.left == nil && r.right == nil {
        return FromString(r.value[:index], 8), FromString(r.value[index:], 8)
    }
    if index < r.weight {
        l, rem := r.left.Split(index)
        return l, Concat(rem, r.right)
    }
    l, rem := r.right.Split(index - r.weight)
    return Concat(r.left, l), rem
}

func (r *Rope) Insert(index int, text string) *Rope {
    left, right := r.Split(index)
    return Concat(Concat(left, FromString(text, 8)), right)
}

func (r *Rope) Index(i int) byte {
    if r.left == nil && r.right == nil {
        return r.value[i]
    }
    if i < r.weight {
        return r.left.Index(i)
    }
    return r.right.Index(i - r.weight)
}

func (r *Rope) String() string {
    if r == nil {
        return ""
    }
    if r.left == nil && r.right == nil {
        return r.value
    }
    return r.left.String() + r.right.String()
}
```

## Real World Use

### 1. Text Editors

Some advanced text editors and IDEs use rope-like structures for the document buffer (especially when dealing with very large files).

### 2. C++ Standard Library

GCC's `std::rope` (from the SGI STL extension) was one of the most famous implementations.

### 3. Functional Languages & Immutable Data

Ropes are popular in functional settings because concatenation can share structure.

## When You Should Care

For normal application strings, modern `StringBuilder` / `strings.Builder` are usually fine.

Ropes become interesting when:
- You have **tens or hundreds of megabytes** of text
- You do a **lot** of middle insertions/deletions
- You need efficient structural sharing (immutability)

## Summary

Rope = tree of string chunks optimized for large-scale text editing and manipulation.

It is a specialized but beautiful data structure that shows how thinking in trees instead of flat buffers can completely change performance characteristics.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Text Editor Engine](/projects/tier-4/20-text-editor-engine) — rope-backed editing with gap buffer and spell-check.
:::

**Next:** [30 - Gap Buffer](30-gap-buffer.md)