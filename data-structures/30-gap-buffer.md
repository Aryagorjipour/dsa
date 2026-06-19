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

## Performance

- Insert / Delete at cursor: O(1) amortized (until gap is exhausted)
- Move cursor: O(distance) in worst case (but usually small)
- Random access: O(1)

This is why typing in a text editor feels instant even on huge files.

## Real World Use

### 1. Text Editors

- Emacs famously used gap buffers for a long time.
- Many other editors (Vim has used variations, VS Code uses more sophisticated structures now, but the idea remains).
- Many custom in-house editors in games and tools.

### 2. IDEs and Source Code Editors

Some internal buffers in older IDEs and code editors used gap buffers.

### 3. Any "mostly sequential editing" workload

Anywhere the user or a process tends to make local changes.

## Comparison With Other Structures

- **Rope**: Better for very large files + non-local edits + undo
- **Gap Buffer**: Extremely simple and fast for normal typing workloads
- **Piece Table**: Another popular approach (used by Microsoft Word historically)

Modern editors often use a combination or more advanced structures (piece tables + ropes + trees).

## Implementation Intuition (Simplified)

```csharp
public class GapBuffer {
    private char[] _buffer;
    private int _gapStart;
    private int _gapEnd;

    public void Insert(char c) {
        if (_gapStart == _gapEnd) Grow();
        _buffer[_gapStart++] = c;
    }

    public void MoveCursor(int newPos) {
        // Move gap to new position by shifting characters
    }
}
```

## Summary

Gap Buffer = one of the simplest and most effective data structures for interactive text editing.

It exploits the locality of human editing behavior (we usually edit near where we were editing before).

**Next:** [31 - Suffix Array](31-suffix-array.md)
