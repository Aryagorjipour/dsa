# 48 - Rate Limiting Algorithms

## The Problem

Protect your system from overload and enforce fair usage:

- Per user, IP, API key, or endpoint
- Different tiers (free vs paid)
- Bursty vs smooth traffic policies

Every public API implements some form of rate limiting. The algorithm choice determines accuracy, memory cost, and burst tolerance.

## Canonical Problem: API Gateway Request Quota

**Scenario:** A REST API allows 100 requests per minute per API key, with short bursts up to 20 extra requests.

You need an algorithm that:
1. Rejects excess requests with HTTP 429.
2. Allows controlled bursts.
3. Runs in O(1) or near-O(1) per request.
4. Scales across multiple gateway instances (Redis-backed in production).

## Algorithm Comparison

| Algorithm | Memory | Check time | Burst handling | Accuracy |
|-----------|--------|------------|----------------|----------|
| **Token bucket** | O(1) | O(1) | Excellent — configurable burst | Good |
| **Leaky bucket** | O(1) | O(1) | Smooths output, queues excess | Good |
| **Fixed window** | O(1) | O(1) | Poor — 2× burst at boundaries | Low |
| **Sliding window log** | O(n) per client | O(n) eviction | Precise | Excellent |
| **Sliding window counter** | O(1) | O(1) | Good hybrid | Good |

## Complexity (per client)

| Algorithm | Allow() time | Space per client |
|-----------|--------------|------------------|
| Token bucket | O(1) | O(1) — 3 integers + timestamp |
| Sliding window log | O(k) amortized | O(k) — k = requests in window |
| Fixed window | O(1) | O(1) — counter + window start |
| Distributed (Redis) | O(1) network + O(1) local | Shared state |

## Full Implementation — Token Bucket

Refill tokens at a steady rate. Each request consumes one token. Reject when empty.

### C#

```csharp
public class TokenBucket {
    private readonly int capacity;
    private readonly double refillRate; // tokens per second
    private double tokens;
    private DateTime lastRefill;

    public TokenBucket(int capacity, double refillRatePerSecond) {
        this.capacity = capacity;
        this.refillRate = refillRatePerSecond;
        tokens = capacity;
        lastRefill = DateTime.UtcNow;
    }

    public bool Allow() {
        Refill();
        if (tokens >= 1) {
            tokens -= 1;
            return true;
        }
        return false;
    }

    void Refill() {
        var now = DateTime.UtcNow;
        double elapsed = (now - lastRefill).TotalSeconds;
        tokens = Math.Min(capacity, tokens + elapsed * refillRate);
        lastRefill = now;
    }
}
```

### Go

```go
type TokenBucket struct {
    capacity   int
    tokens     float64
    refillRate float64 // tokens per second
    lastRefill time.Time
}

func NewTokenBucket(capacity int, refillRate float64) *TokenBucket {
    return &TokenBucket{
        capacity:   capacity,
        tokens:     float64(capacity),
        refillRate: refillRate,
        lastRefill: time.Now(),
    }
}

func (tb *TokenBucket) Allow() bool {
    now := time.Now()
    elapsed := now.Sub(tb.lastRefill).Seconds()
    tb.tokens = math.Min(float64(tb.capacity), tb.tokens+elapsed*tb.refillRate)
    tb.lastRefill = now

    if tb.tokens >= 1 {
        tb.tokens--
        return true
    }
    return false
}
```

## Full Implementation — Sliding Window Log

Store timestamps of recent requests. Evict entries older than the window. Reject if count ≥ limit.

### C#

```csharp
public class SlidingWindowLog {
    private readonly int limit;
    private readonly TimeSpan window;
    private readonly Queue<DateTime> timestamps = new();

    public SlidingWindowLog(int limit, TimeSpan window) {
        this.limit = limit;
        this.window = window;
    }

    public bool Allow() {
        var now = DateTime.UtcNow;
        var cutoff = now - window;

        while (timestamps.Count > 0 && timestamps.Peek() < cutoff)
            timestamps.Dequeue();

        if (timestamps.Count >= limit)
            return false;

        timestamps.Enqueue(now);
        return true;
    }
}
```

### Go

```go
type SlidingWindowLog struct {
    limit      int
    window     time.Duration
    timestamps []time.Time
}

func NewSlidingWindowLog(limit int, window time.Duration) *SlidingWindowLog {
    return &SlidingWindowLog{limit: limit, window: window}
}

func (sw *SlidingWindowLog) Allow() bool {
    now := time.Now()
    cutoff := now.Add(-sw.window)

    // Drop expired timestamps
    i := 0
    for i < len(sw.timestamps) && sw.timestamps[i].Before(cutoff) {
        i++
    }
    sw.timestamps = sw.timestamps[i:]

    if len(sw.timestamps) >= sw.limit {
        return false
    }
    sw.timestamps = append(sw.timestamps, now)
    return true
}
```

See `examples/go/rate_limiter.go` for a runnable token bucket demo.

## Other Algorithms (Quick Reference)

### Fixed Window Counter

```
window = floor(now / windowSize)
if window != stored_window: counter = 0
if counter >= limit: reject
counter++; allow
```

**Flaw:** A client can send `limit` requests at 00:59 and `limit` more at 01:00 → 2× burst.

### Leaky Bucket

Requests enter a queue. Process (leak) at a constant rate. Overflow is dropped or queued. Shapes traffic to a steady drip — common in network QoS.

### Sliding Window Counter (Hybrid)

```
count = prev_window_count × (1 - elapsed/window) + curr_window_count
```

O(1) memory, approximates a true sliding window. Used by Cloudflare and many API gateways.

## Distributed Rate Limiting

Single-server limiters fail behind load balancers. Production patterns:

| Pattern | How it works |
|---------|--------------|
| **Redis token bucket** | `INCR` + `EXPIRE` or Lua script for atomic refill |
| **Redis sliding window** | Sorted set of timestamps per client key |
| **Gossip sync** | Each node holds local counter, periodically syncs |
| **Centralized gateway** | All checks hit one rate-limit service |

**Redis sliding window with sorted set:**
```
ZREMRANGEBYSCORE key 0 (now - window)
ZCARD key → if >= limit: reject
ZADD key now now
```

## Real World

Every major public API uses sophisticated rate limiting:

- **Twitter / X, GitHub, Stripe, OpenAI, Google, AWS** — tiered limits per key
- **Cloudflare** — sliding window counter at the edge
- **NGINX** — `limit_req` module (leaky bucket variant)
- **Envoy / Istio** — token bucket in service mesh
- **Stripe** — documented rate limits with `Retry-After` headers

## Implementation Considerations

- Return **HTTP 429** with `Retry-After` header (seconds until next allowed request).
- Use **idempotent** check-and-consume in distributed systems (Lua, Redis transactions).
- Separate limits per **endpoint** (read vs write), **tier** (free vs pro), and **global** (circuit breaker).
- **Graceful degradation** — shed load before hard failure; prioritize paying customers.
- Log rate-limit hits for abuse detection and capacity planning.

## Choosing an Algorithm

| Need | Choose |
|------|--------|
| Allow bursts, simple logic | Token bucket |
| Precise per-minute enforcement | Sliding window log |
| O(1) memory at scale | Sliding window counter or token bucket |
| Smooth outgoing traffic | Leaky bucket |
| Quick prototype | Fixed window (know the boundary flaw) |

## Summary

Rate limiting is one of the most important applied algorithms in reliable internet services. **Token bucket** gives burst tolerance with O(1) cost; **sliding window log** gives precision when memory allows. In production, combine these with Redis and return proper 429 semantics.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [API Rate Limiter](/projects/tier-4/18-api-rate-limiter) — token bucket, sliding window log, sliding window counter, and HTTP 429 middleware.
:::