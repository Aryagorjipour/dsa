# 30 - Gap Buffer

## What is a Gap Buffer?

A **gap buffer** is a data structure used for text editing.

It is a dynamic array (usually of characters or runes) that maintains a **gap** (empty region) around the current cursor position.

When the user is typing or moving the cursor, most edits happen near the cursor. By keeping the gap there, inserts and deletes become very cheap.

## How It Works

Imagine the text "Hello World" with cursor after "Hello":

```
Hello|     World
     ^gap^
```

Inserting characters just writes into the gap and moves the gap start.

When the user moves the cursor far away, the gap is moved (which requires copying characters, but this happens relatively rarely compared to typing).

## Operations & Complexity

| Operation           | Time (typical) | Worst case |
|---------------------|----------------|------------|
| Insert at cursor    | O(1)           | O(n) if gap exhausted |
| Delete at cursor    | O(1)           | O(n) if gap exhausted |
| Move cursor         | O(distance)    | O(n)       |
| Random access       | O(1)           | O(1)       |
| Grow buffer         | O(n)           | O(n) amortized |

## Complete Implementation (C#)

```csharp
public class GapBuffer {
    private char[] _buffer;
    private int _gapStart;
    private int _gapEnd;

    public GapBuffer(int capacity = 16) {
        _buffer = new char[capacity];
        _gapStart = 0;
        _gapEnd = capacity;
    }

    public int Cursor => _gapStart;
    public int Length => _buffer.Length - (_gapEnd - _gapStart);

    public void Insert(char c) {
        if (_gapStart == _gapEnd) Grow();
        _buffer[_gapStart++] = c;
    }

    public void Delete() {
        if (_gapStart > 0) {
            MoveGap(_gapStart - 1);
            _gapStart++;
        }
    }

    public void MoveCursor(int newPos) {
        if (newPos < 0 || newPos > Length) {
            throw new ArgumentOutOfRangeException(nameof(newPos));
        }
        MoveGap(newPos);
    }

    private void MoveGap(int newPos) {
        if (newPos == _gapStart) return;

        if (newPos < _gapStart) {
            int delta = _gapStart - newPos;
            Array.Copy(_buffer, newPos, _buffer, _gapEnd - delta, delta);
            _gapStart = newPos;
            _gapEnd -= delta;
        } else {
            int delta = newPos - _gapStart;
            Array.Copy(_buffer, _gapEnd, _buffer, _gapStart, delta);
            _gapStart += delta;
            _gapEnd += delta;
        }
    }

    private void Grow() {
        int gapSize = _gapEnd - _gapStart;
        int newSize = _buffer.Length * 2;
        var newBuf = new char[newSize];
        int newGapEnd = newSize - gapSize;

        Array.Copy(_buffer, 0, newBuf, 0, _gapStart);
        Array.Copy(_buffer, _gapEnd, newBuf, newGapEnd, _buffer.Length - _gapEnd);

        _buffer = newBuf;
        _gapEnd = newGapEnd;
    }

    public string ToString() {
        return new string(_buffer, 0, _gapStart) +
               new string(_buffer, _gapEnd, _buffer.Length - _gapEnd);
    }
}
```

## Complete Implementation (Go)

```go
type GapBuffer struct {
    buffer   []rune
    gapStart int
    gapEnd   int
}

func NewGapBuffer(capacity int) *GapBuffer {
    if capacity < 8 {
        capacity = 8
    }
    return &GapBuffer{
        buffer:   make([]rune, capacity),
        gapStart: 0,
        gapEnd:   capacity,
    }
}

func (g *GapBuffer) Len() int {
    return len(g.buffer) - (g.gapEnd - g.gapStart)
}

func (g *GapBuffer) Insert(r rune) {
    if g.gapStart == g.gapEnd {
        g.grow()
    }
    g.buffer[g.gapStart] = r
    g.gapStart++
}

func (g *GapBuffer) Delete() {
    if g.gapStart > 0 {
        g.moveGap(g.gapStart - 1)
        g.gapStart++
    }
}

func (g *GapBuffer) MoveCursor(pos int) {
    if pos < 0 || pos > g.Len() {
        panic("cursor out of range")
    }
    g.moveGap(pos)
}

func (g *GapBuffer) moveGap(newPos int) {
    if newPos == g.gapStart {
        return
    }
    if newPos < g.gapStart {
        delta := g.gapStart - newPos
        copy(g.buffer[g.gapEnd-delta:], g.buffer[newPos:g.gapStart])
        g.gapStart = newPos
        g.gapEnd -= delta
    } else {
        delta := newPos - g.gapStart
        copy(g.buffer[g.gapStart:], g.buffer[g.gapEnd:g.gapEnd+delta])
        g.gapStart += delta
        g.gapEnd += delta
    }
}

func (g *GapBuffer) grow() {
    gapSize := g.gapEnd - g.gapStart
    newSize := len(g.buffer) * 2
    newBuf := make([]rune, newSize)
    newGapEnd := newSize - gapSize
    copy(newBuf, g.buffer[:g.gapStart])
    copy(newBuf[newGapEnd:], g.buffer[g.gapEnd:])
    g.buffer = newBuf
    g.gapEnd = newGapEnd
}

func (g *GapBuffer) String() string {
    return string(g.buffer[:g.gapStart]) + string(g.buffer[g.gapEnd:])
}
```

## Real World Use

### 1. Text Editors

- Emacs famously used gap buffers for a long time.
- Many other editors (Vim has used variations; VS Code uses more sophisticated structures now).

### 2. IDEs and Source Code Editors

Some internal buffers in older IDEs and code editors used gap buffers.

### 3. Any "mostly sequential editing" workload

Anywhere the user or a process tends to make local changes.

## Comparison With Other Structures

| Structure   | Best for                          |
|-------------|-----------------------------------|
| Gap Buffer  | Normal typing, cursor-local edits |
| Rope        | Very large files, non-local edits |
| Piece Table | Word-style editing (Microsoft Word)|

## Summary

Gap Buffer = one of the simplest and most effective data structures for interactive text editing.

It exploits the locality of human editing behavior (we usually edit near where we were editing before).

::: tip Project Lab
**Build it yourself:** [Text Editor Engine](/projects/tier-4/20-text-editor-engine)
:::

**Next:** [31 - Suffix Array](31-suffix-array.md)