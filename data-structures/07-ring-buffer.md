# 07 - Ring Buffer (Circular Buffer)

## What is a Ring Buffer?

A **ring buffer** (or circular buffer) is a fixed-size buffer that wraps around.

When you reach the end, you go back to the beginning.

It is one of the most important low-level data structures in systems programming.

## Visual Intuition

Capacity = 5

After adding A B C D E:

```
[ A ][ B ][ C ][ D ][ E ]   head=0, tail=0 (full), or use count
```

After consuming two items (dequeue A, B):

```
[ _ ][ _ ][ C ][ D ][ E ]   head=2
```

Add F, G:

```
[ G ][ _ ][ C ][ D ][ F ]   head=2, tail=1  (wrapped)
```

The "ring" allows reuse of space without shifting.

## Why Ring Buffers Matter

They give you:
- O(1) enqueue and dequeue (when not full/empty)
- Bounded memory (no unbounded growth)
- Excellent cache behavior
- No allocations after initial creation (huge for real-time systems)

## Key Design Decisions

1. **How to distinguish full vs empty?**
   - Use a separate `count`
   - Or always keep one slot empty
   - Or use a "full" flag

2. **Overwrite policy when full?**
   - Block producer
   - Overwrite oldest (common in real-time logging)
   - Error

## Implementation (C#)

```csharp
public class RingBuffer<T> {
    private readonly T[] _buffer;
    private int _head;
    private int _count;

    public RingBuffer(int capacity) {
        _buffer = new T[capacity];
    }

    public int Capacity => _buffer.Length;
    public int Count => _count;

    public void Write(T item) {
        int index = (_head + _count) % Capacity;
        _buffer[index] = item;
        if (_count < Capacity) {
            _count++;
        } else {
            _head = (_head + 1) % Capacity; // overwrite oldest
        }
    }

    public T Read() {
        if (_count == 0) throw new InvalidOperationException("Empty");
        T item = _buffer[_head];
        _head = (_head + 1) % Capacity;
        _count--;
        return item;
    }

    public bool TryRead(out T item) {
        if (_count == 0) {
            item = default!;
            return false;
        }
        item = Read();
        return true;
    }
}
```

## Implementation (Go)

```go
type RingBuffer[T any] struct {
    buf   []T
    head  int
    count int
}

func NewRingBuffer[T any](cap int) *RingBuffer[T] {
    return &RingBuffer[T]{buf: make([]T, cap)}
}

func (r *RingBuffer[T]) Write(v T) {
    idx := (r.head + r.count) % len(r.buf)
    r.buf[idx] = v
    if r.count < len(r.buf) {
        r.count++
    } else {
        r.head = (r.head + 1) % len(r.buf)
    }
}

func (r *RingBuffer[T]) Read() T {
    if r.count == 0 {
        panic("empty")
    }
    v := r.buf[r.head]
    r.head = (r.head + 1) % len(r.buf)
    r.count--
    return v
}
```

## Real World Use Cases (This List Is Huge)

### 1. Operating Systems & Drivers

- Keyboard input buffer
- Serial port / UART buffers
- Network packet rings (very common in NIC drivers)
- Audio subsystem buffers (ALSA, CoreAudio, WASAPI)

### 2. Networking

- TCP send/receive buffers
- QUIC and HTTP/3 stream buffers
- Zero-copy networking rings (io_uring in Linux, registered buffers)

### 3. Logging & Observability

- In-memory circular log buffers (many high-performance loggers keep last N lines)
- OpenTelemetry, many APM agents

### 4. Audio / Video Processing

- Audio ring buffers for glitch-free playback
- Video frame buffers
- Jitter buffers in VoIP (Discord, Zoom, WebRTC)

### 5. Message Queues & Brokers (bounded)

Many internal queues in brokers are ring buffers or ring-buffer-like for fixed memory.

### 6. Game Development

- Input command buffers
- Replay systems (record last 30 seconds of inputs)
- Network prediction buffers

### 7. High-Performance .NET

- `System.Buffers` + `ArrayPool` users often build ring buffers on top
- Channels in some high-throughput scenarios use ring semantics
- Many custom `Memory<T>` based ring buffers in trading systems and game servers

### 8. Go

- Many high-performance Go network libraries implement their own ring buffers on `[]byte`
- `github.com/valyala/bytebufferpool` and similar often have ring flavor
- Go's `runtime` uses ring-style structures in some scheduler and GC components

### 9. Databases & Storage

- Write-ahead log (WAL) buffers
- Page replacement buffers (sometimes circular)
- Replication log shipping buffers

### 10. Embedded & Real-time Systems

Ring buffers are *everywhere* because:
- Predictable memory usage
- No malloc in hot path
- Deterministic timing

## Variants

- **Single Producer / Single Consumer (SPSC)** — easiest to make lock-free
- **Multiple Producer / Multiple Consumer (MPMC)** — requires careful atomic operations
- **Disruptor pattern** (LMAX) — famous high-performance ring buffer used in finance (Java)

## Common Operations on Ring Buffers

- Bulk write / read (very important for performance)
- Peek multiple items without consuming
- Resize (rare — most are fixed capacity)

## The "Bounded Buffer" Problem (Classic Concurrency)

The ring buffer is the classic example used to teach:
- Producer / Consumer problem
- Condition variables
- Semaphores
- Lock-free programming with atomics

## Pitfalls

1. **Off-by-one errors** with head/tail/count.
2. **Forgetting to handle wrap-around** when copying ranges.
3. **Memory visibility** issues in concurrent implementations (need proper memory barriers or atomics).
4. **Data races** on count vs head/tail.

## Summary

If you ever work on:
- Networking
- Audio/Video
- Logging
- Embedded
- High-performance services
- Real-time systems

...you will implement or use a ring buffer.

It is one of the most "systems-y" data structures that still appears constantly in application code.


::: tip Project Lab
**Build it yourself:** [Task Queue System](/projects/tier-2/06-task-queue-system) and [API Rate Limiter](/projects/tier-4/18-api-rate-limiter) — ring buffers for zero-allocation queues.
:::

**Next:** [08 - Hash Set](08-hash-set.md)
