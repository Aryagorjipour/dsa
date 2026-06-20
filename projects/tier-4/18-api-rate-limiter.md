# Build Your Own API Rate Limiter

## 1. Motivation & Real-World Context

Every public API faces the same threat: a single client — malicious or merely enthusiastic — can overwhelm your servers and degrade service for everyone else. Rate limiting is the first line of defense. It is not a single algorithm but a family of trade-offs between accuracy, memory, burst tolerance, and distributed correctness.

**Stripe** enforces per-API-key rate limits across its payment, billing, and Connect APIs. Their documentation exposes `RateLimit` response headers (`Stripe-RateLimit-Limit`, `Remaining`, `Reset`) that map directly to token-bucket or sliding-window implementations. When you hit a 429, you are experiencing the output of one of the algorithms you will build here.

**Twitter/X (now X)** rate-limits tweet creation, timeline reads, and search queries independently per endpoint and per user tier. The v2 API documents 15-minute sliding windows for most endpoints — not fixed windows — because fixed windows create the "burst at boundary" problem where a client sends 2× the limit by straddling two windows.

**AWS API Gateway** offers both burst and steady-state limits via a token bucket model. The `burstLimit` allows short spikes; the `rateLimit` enforces sustained throughput. This maps exactly to token bucket with configurable capacity and refill rate. API Gateway also supports usage plans with per-key quotas — your rate limiter will implement the same per-client keying.

**Cloudflare** applies rate limiting at the edge across 300+ cities. Edge rate limiting must be memory-efficient (millions of clients, bounded RAM per server) and fast (sub-millisecond decision per request). Sliding window counter — a hybrid of fixed window and sliding window log — is Cloudflare's documented approach for balancing accuracy against memory at scale.

**nginx** `limit_req` module implements the leaky bucket algorithm: requests drip out at a constant rate, excess requests are delayed or rejected. Understanding leaky bucket explains why nginx can smooth bursty traffic without the sharp cliff of a fixed window counter.

## 2. Learning Objectives

By completing this project, you will deeply understand:

1. **Fixed window counter and its boundary burst flaw** — O(1) memory and O(1) check, but clients can send 2× the limit by timing requests across window edges. See [`/algorithms/47-rate-limiting`](/algorithms/47-rate-limiting).

2. **Sliding window log for precise rate enforcement** — store per-request timestamps in a deque, evict entries older than the window, count remaining entries. Accurate but O(n) memory per client. See [`/algorithms/47-rate-limiting`](/algorithms/47-rate-limiting) and [`/data-structures/06-deque`](/data-structures/06-deque).

3. **Token bucket for burst-tolerant limiting** — refill tokens at a steady rate, consume one per request, reject when empty. Allows controlled bursts up to bucket capacity. See [`/algorithms/47-rate-limiting`](/algorithms/47-rate-limiting).

4. **Leaky bucket for traffic shaping** — requests queue in a bucket, processed at a constant drip rate, overflow is dropped. Smooths traffic rather than hard-rejecting bursts. See [`/algorithms/47-rate-limiting`](/algorithms/47-rate-limiting) and [`/data-structures/05-queue`](/data-structures/05-queue).

5. **Sliding window counter as a practical hybrid** — combine the previous window's weighted count with the current window's count to approximate a sliding window with O(1) memory. See [`/algorithms/47-rate-limiting`](/algorithms/47-rate-limiting) and [`/fundamentals/05-two-pointers-sliding-window`](/fundamentals/05-two-pointers-sliding-window).

6. **Ring buffer for bounded per-client state** — fixed-capacity circular buffer stores recent request timestamps without unbounded growth; essential when millions of clients each need a sliding window. See [`/data-structures/07-ring-buffer`](/data-structures/07-ring-buffer).

7. **How rate limiting algorithms compose into middleware** — pluggable limiter interface, per-key state isolation, HTTP 429 responses with `Retry-After` headers, and benchmark comparison of accuracy vs memory across algorithms.

## 3. Project Scope

**In Scope:**
- `RateLimiter` interface: `Allow(key string, now time.Time) (allowed bool, retryAfter time.Duration)`
- Fixed window counter per client key
- Sliding window log using a deque of timestamps per key
- Token bucket with configurable capacity and refill rate
- Leaky bucket with bounded queue and constant drip rate
- Sliding window counter (weighted previous + current window)
- Ring-buffer-backed sliding window for memory-bounded timestamp storage
- `RateLimiterRegistry`: map of client key → limiter state, with TTL eviction of stale keys
- HTTP middleware wrapper returning 429 with `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`
- Benchmark suite: accuracy under boundary-burst attack, memory per 10,000 keys, throughput (decisions/second)
- CLI demo: replay a CSV of `(timestamp, client_key)` and print allow/deny decisions per algorithm

**Out of Scope (for v1):**
- Distributed rate limiting across multiple servers (Redis-backed)
- Lua scripting or atomic multi-key operations
- Hierarchical rate limits (per-IP AND per-API-key simultaneously)
- Dynamic limit adjustment based on server load
- TLS termination or real HTTP server (middleware is in-process)
- Billing-tier quota tracking (monthly limits)

## 4. Core DSA Concepts Used

| Concept | Role in this project | Handbook Link | Difficulty |
|---------|----------------------|---------------|------------|
| Rate Limiting Algorithms | Core policy: fixed window, sliding log, token bucket, leaky bucket, sliding counter | [/algorithms/47-rate-limiting](/algorithms/47-rate-limiting) | Intermediate |
| Ring Buffer | Bounded circular storage for per-client request timestamps | [/data-structures/07-ring-buffer](/data-structures/07-ring-buffer) | Intermediate |
| Deque | Sliding window log: O(1) push back, O(1) pop front for expired timestamps | [/data-structures/06-deque](/data-structures/06-deque) | Beginner |
| Queue | Leaky bucket: FIFO request queue dripping at constant rate | [/data-structures/05-queue](/data-structures/05-queue) | Beginner |
| Sliding Window | Sliding window counter: two-pointer weighted count across adjacent windows | [/fundamentals/05-two-pointers-sliding-window](/fundamentals/05-two-pointers-sliding-window) | Intermediate |
| Hash Map | Per-client key → limiter state registry | [/data-structures/09-hash-map](/data-structures/09-hash-map) | Beginner |

## 5. High-Level Architecture

The `RateLimiterMiddleware` receives HTTP requests, extracts a client key (API key or IP), delegates to a pluggable `RateLimiter` implementation, and returns 200 or 429 with standard rate-limit headers.

```mermaid
graph TD
    REQ[HTTP Request\nAPI key / IP / endpoint]

    subgraph "Rate Limiter Middleware"
        EXTRACT[KeyExtractor\nX-API-Key or RemoteAddr]
        REGISTRY["RateLimiterRegistry\nmap[key] → LimiterState\n+ TTL eviction"]
        SELECT{Algorithm}
    end

    subgraph "Limiter Implementations"
        FW[FixedWindowCounter\nO(1) memory]
        SWL[SlidingWindowLog\nDeque of timestamps]
        TB[TokenBucket\nrefill + capacity]
        LB[LeakyBucket\nQueue + drip rate]
        SWC[SlidingWindowCounter\nweighted hybrid]
        RB[RingBufferWindow\nbounded timestamp ring]
    end

    REQ --> EXTRACT
    EXTRACT --> REGISTRY
    REGISTRY --> SELECT
    SELECT --> FW
    SELECT --> SWL
    SELECT --> TB
    SELECT --> LB
    SELECT --> SWC
    SELECT --> RB

    FW -->|allow / deny| RESP[HTTP Response\n200 or 429 + headers]
    SWL --> RESP
    TB --> RESP
    LB --> RESP
    SWC --> RESP
    RB --> RESP
```

**Key interfaces:**

```
RateLimiter
  Allow(key string, now time.Time) (allowed bool, retryAfter time.Duration)
  Remaining(key string, now time.Time) int
  Limit() int

FixedWindowCounter
  WindowSize time.Duration
  MaxRequests int

SlidingWindowLog
  WindowSize time.Duration
  MaxRequests int
  // per key: Deque<time.Time>

TokenBucket
  Capacity int
  RefillRate float64   // tokens per second

LeakyBucket
  QueueCapacity int
  DripRate float64     // requests per second

RateLimiterRegistry
  GetOrCreate(key string) RateLimiter
  EvictStale(before time.Time)
```

## 6. Implementation Milestones (with Hints)

### Milestone 1: Fixed Window Counter

**Goal:** Implement the simplest rate limiter: count requests in the current time window, reset when the window expires. Demonstrate the boundary-burst vulnerability.

**Key Challenges:** Computing the current window start from `now` and `windowSize`. Thread-safe per-key state in a concurrent registry.

**Hints & Guidance:**
- Window start: `windowStart = now.Truncate(windowSize)` or `now - (now.UnixNano() % windowSize.Nanoseconds())`.
- Per key: `{ count int, windowStart time.Time }`. If `now` is in a new window, reset count to 0 and update windowStart.
- `Allow`: if `count &lt; maxRequests`, increment count and return true. Otherwise return false with `retryAfter = windowStart + windowSize - now`.
- Boundary burst demo: limit = 100 req/min. Send 100 requests at t=59s and 100 at t=61s. Fixed window allows all 200; a true sliding window would reject the second batch.
- In Go: protect per-key state with `sync.Map` or a sharded mutex array. In C#: `ConcurrentDictionary&lt;string, WindowState&gt;`.

**Success Criteria:**
- 100 requests in a 60-second window: first 100 allowed, 101st denied
- Counter resets to 0 when a new window begins
- `retryAfter` is positive and ≤ windowSize when denied
- Boundary burst test demonstrates 2× limit exploitation

### Milestone 2: Sliding Window Log with Deque

**Goal:** Store timestamps of each allowed request in a deque per client key. On each `Allow` call, remove timestamps older than `now - windowSize`, then check if count &lt; limit.

**Key Challenges:** Efficient eviction of expired timestamps from the front of the deque. Memory growth when many clients each store up to `limit` timestamps.

**Hints & Guidance:**
- Deque operations: `PushBack(now)` on allow, `PopFront()` while front &lt; `now - windowSize`.
- `Allow`: evict expired, then if `Len() &lt; maxRequests`, push and return true. Else return false; `retryAfter` = front timestamp + windowSize - now (when the oldest request ages out).
- This is the most accurate algorithm — no boundary burst, no approximation. Cost: O(limit) memory and O(1) amortized time per request (each timestamp pushed and popped once).
- Compare to fixed window on the boundary burst test: sliding window log must reject the second batch of 100.
- Use your deque from project 06 or implement as a circular buffer with head/tail indices.

**Success Criteria:**
- Boundary burst test: only 100 of 200 rapid requests allowed in any 60-second span
- Deque length never exceeds `maxRequests`
- `retryAfter` equals time until oldest timestamp exits the window
- 10,000 unique client keys each making 10 requests: memory is bounded at 10,000 × limit × 8 bytes

### Milestone 3: Token Bucket

**Goal:** Implement a token bucket: tokens refill continuously at `refillRate`, each request consumes one token, requests are rejected when the bucket is empty. Allow bursts up to `capacity`.

**Key Challenges:** Computing fractional token refill between requests without floating-point drift. Lazy refill (compute tokens on demand rather than a background goroutine).

**Hints & Guidance:**
- Per key: `{ tokens float64, lastRefill time.Time }`.
- On `Allow(now)`: `elapsed = now - lastRefill`. `tokens = min(capacity, tokens + elapsed.Seconds() * refillRate)`. Update `lastRefill = now`.
- If `tokens >= 1.0`: decrement by 1, return true. Else: `retryAfter = (1.0 - tokens) / refillRate`.
- Burst test: capacity=10, refillRate=1/sec. Send 10 requests instantly (all allowed). 11th denied. Wait 5 seconds. 5 more allowed.
- Stripe/AWS model: `burstLimit` = capacity, `rateLimit` = refillRate. Your implementation maps directly.

**Success Criteria:**
- Burst of `capacity` requests allowed instantly
- Sustained rate converges to `refillRate` requests/second
- Tokens never exceed `capacity` after refill
- After idle period, bucket is full (tokens = capacity)

### Milestone 4: Leaky Bucket with Queue

**Goal:** Implement a leaky bucket: incoming requests enqueue; a drip process dequeues at a constant rate. If the queue is full, reject the request.

**Key Challenges:** Simulating the drip without a background thread (lazy drip on each `Allow` call). Distinguishing leaky bucket (shapes traffic) from token bucket (allows bursts).

**Hints & Guidance:**
- Per key: `{ queue []time.Time (or count int), lastDrip time.Time }`.
- Lazy drip: on `Allow(now)`, compute how many requests have "leaked" since `lastDrip`: `dripped = int((now - lastDrip).Seconds() * dripRate)`. Reduce queue length by `dripped` (minimum 0). Update `lastDrip`.
- If queue length &lt; capacity: enqueue, return true. Else: return false; `retryAfter = 1.0 / dripRate`.
- Leaky bucket smooths traffic: even if 100 requests arrive instantly, they drip out at `dripRate` — the queue absorbs the burst but the server sees smooth traffic.
- Contrast with token bucket: leaky bucket does NOT allow the server to see a burst; it delays excess requests in the queue.

**Success Criteria:**
- Queue never exceeds `capacity`
- Sustained throughput to the "server" (dequeue side) is ≤ `dripRate`
- 100 instant requests with capacity=50: first 50 queued, next 50 rejected
- After queue drains, new requests are accepted again

### Milestone 5: Sliding Window Counter

**Goal:** Implement the hybrid sliding window counter used by Cloudflare and many production systems: approximate the sliding window count using the previous window's weighted contribution plus the current window's count. O(1) memory per key.

**Key Challenges:** Computing the weighted previous window count. The formula: `estimated = prevWindowCount * (1 - elapsed/windowSize) + currentWindowCount`.

**Hints & Guidance:**
- Per key: `{ prevCount, prevWindowStart, currCount, currWindowStart }`.
- On `Allow(now)`: determine current window. If new window, shift: `prevCount = currCount`, `prevWindowStart = currWindowStart`, `currCount = 0`, `currWindowStart = newStart`.
- `elapsed = now - currWindowStart`. `weight = 1.0 - elapsed.Seconds() / windowSize.Seconds()`. `estimated = prevCount * weight + currCount`.
- If `estimated &lt; maxRequests`: increment `currCount`, return true. Else deny.
- Compare accuracy: run boundary burst test. Sliding window counter should reject most of the second batch (not all, unlike the log — it is an approximation).
- Memory: exactly 4 integers/floats per key regardless of limit. This is why Cloudflare uses it at the edge.

**Success Criteria:**
- O(1) memory per key (no timestamp storage)
- Boundary burst test: rejects significantly more than fixed window (≥ 50% of the exploit batch)
- At window midpoint, previous window weight is 0.5
- Estimated count is always ≤ actual sliding window log count (conservative approximation)

### Milestone 6: Ring-Buffer Window and HTTP Middleware

**Goal:** Implement a ring-buffer-backed sliding window for bounded timestamp storage. Compose all limiters into HTTP middleware with standard headers. Run the benchmark suite.

**Key Challenges:** Ring buffer overwrite when full (oldest timestamp replaced). Selecting the correct limiter per route. Generating accurate `Retry-After` and `X-RateLimit-*` headers.

**Hints & Guidance:**
- Ring buffer per key: fixed size = `maxRequests`. On allow, write timestamp at `tail % size`, advance tail. On check, iterate from head to tail, count entries where `timestamp >= now - windowSize`.
- When buffer is full and a new request arrives, overwrite the oldest entry (advance head). This gives a bounded-memory approximation of sliding window log.
- Middleware: extract key from `X-API-Key` header or `RemoteAddr`. Call `limiter.Allow(key, time.Now())`. On deny: HTTP 429, `Retry-After: &lt;seconds&gt;`, `X-RateLimit-Limit`, `X-RateLimit-Remaining: 0`.
- Registry TTL: evict keys not seen in 10 minutes to prevent unbounded map growth.
- Benchmark: 1,000,000 `Allow` calls across 10,000 keys. Compare throughput: fixed window > sliding counter > token bucket > ring buffer > sliding log.

**Success Criteria:**
- Ring buffer storage is exactly `maxRequests * 8 bytes` per key (no growth)
- Middleware returns correct 429 status with `Retry-After` header
- `X-RateLimit-Remaining` decrements correctly on each allowed request
- Benchmark table printed: Algorithm | Memory/key | Throughput (ops/s) | Boundary-burst accuracy

## 7. Stretch Goals

1. **Hierarchical rate limiting:** Enforce both a per-IP limit (1000 req/min) and a per-API-key limit (100 req/min). A request must pass both. Implement as a chain of limiters.

2. **Redis-backed distributed limiter:** Serialize sliding window counter state to Redis with `INCR` + `EXPIRE`. Simulate two server instances sharing state and verify consistent enforcement.

3. **Adaptive rate limiting:** Reduce the effective limit when server CPU exceeds 80% (simulate with a counter). Increase back to normal when CPU drops. Models Google Cloud Armor's adaptive protection.

4. **GCRA (Generic Cell Rate Algorithm):** Implement the algorithm used by Cloudflare and Kong. It is a mathematically precise variant of leaky bucket with O(1) state (just one timestamp per key). Compare memory and accuracy to your leaky bucket.

5. **Rate limit analytics dashboard:** Record allow/deny events in a ring buffer. Compute deny rate per client, top offenders, and plot requests/second over time. Uses the same ring buffer primitive as the limiter itself.

## 8. Testing & Validation Strategy

**Unit tests — fixed window:**
- Exactly `limit` requests allowed in a window; next request denied.
- Counter resets when `now` crosses window boundary.
- `retryAfter` is in the range `(0, windowSize]`.

**Unit tests — sliding window log:**
- 100 requests in 30 seconds, limit 100/window 60s: all allowed. 101st denied.
- After 60 seconds of idle, deque is empty and requests are allowed again.
- Boundary burst: 200 requests across a window edge — at most 100 allowed.

**Unit tests — token bucket:**
- Capacity 5, rate 1/s: 5 instant requests allowed, 6th denied.
- After 3 seconds idle: 3 tokens available (capped at capacity).
- Sustained 10 requests over 10 seconds at rate 1/s: all allowed.

**Unit tests — leaky bucket:**
- Queue capacity 3, drip 1/s: 3 enqueued, 4th rejected.
- After 3 seconds: queue empty, new requests accepted.

**Unit tests — sliding window counter:**
- Previous window count of 80, current count of 30, at start of new window: estimated ≈ 80 (weight ≈ 1.0 for prev).
- At midpoint of current window: previous weight ≈ 0.5.

**Integration tests:**
- Middleware: send 101 requests with limit 100. First 100 return 200, 101st returns 429 with `Retry-After` header.
- Registry eviction: create 1,000 keys, wait for TTL, verify map size drops.

**Benchmark suite:**
- Throughput: 1M `Allow` calls, single key, per algorithm.
- Memory: 10,000 keys × limit 100, measure total heap usage per algorithm.
- Accuracy: boundary-burst test across all algorithms, print allow count for each.

## 9. C# and Go Implementation Notes

**C# notes:**
- `ConcurrentDictionary&lt;string, LimiterState&gt;` for the per-key registry. Each `LimiterState` is a small struct or class with its own lock for fine-grained concurrency.
- Deque: `LinkedList&lt;DateTime&gt;` with `AddLast` and `RemoveFirst`, or a circular array deque from project 06.
- Token bucket: use `double` for fractional tokens. `Math.Min(capacity, tokens + elapsed * refillRate)`.
- Ring buffer: `DateTime[] buffer` with `int head, tail, count`. Index: `tail % capacity`.
- Middleware: ASP.NET Core `RequestDelegate` middleware. Read `context.Request.Headers["X-API-Key"]`. Set `context.Response.StatusCode = 429` and `context.Response.Headers["Retry-After"]`.
- Time: use `DateTime.UtcNow` consistently. Never mix local and UTC.

**Go notes:**
- Registry: `sync.Map` for lock-free reads on hot paths, or sharded `[]sync.Mutex` with `hash(key) % numShards` to reduce contention.
- Deque: slice with head index `buf[head:tail]` or circular buffer. `container/list` works but allocates per node — prefer array-backed deque.
- Token bucket: `float64` tokens, lazy refill on each `Allow` call. No background goroutine needed.
- Ring buffer: `[]int64` storing Unix nanoseconds. Fixed size, overwrite oldest on full.
- Middleware: `func(next http.Handler) http.Handler` wrapping pattern. Extract key, call limiter, write headers.
- Time: `time.Now()` returns monotonic clock on Go 1.9+. Use `time.Since` for elapsed calculations.
- Benchmark: `testing.B` with `b.RunParallel` for concurrent throughput measurement. Report `b.ReportAllocs()` for memory comparison.

## 10. Potential Extensions & Related Projects

- **Build Your Own Task Queue System (`06-task-queue-system.md`):** Task queues use rate limiting to prevent worker overload. The leaky bucket you implement here is the same traffic-shaping primitive that Kubernetes work queues use for controller rate limiting.
- **Build Your Own Distributed Cache (`17-distributed-cache.md`):** Production rate limiters (Stripe, AWS) store per-key state in Redis. Your distributed cache's consistent hashing determines which Redis node holds a client's rate limit state — the two systems compose in every API gateway.
- **Build Your Own Stream Analytics Pipeline (`19-stream-analytics-pipeline.md`):** Count-Min Sketch provides approximate per-key frequency counting. A Count-Min Sketch rate limiter trades accuracy for constant memory — useful when exact counts are unnecessary and key cardinality is in the billions.
- **Build Your Own Network Optimizer (`15-network-optimizer.md`):** Both projects address overload protection — rate limiting protects API servers from request floods, network optimization protects backbone links from over-provisioning. Platform engineers implement both.
- **nginx / Envoy rate limit filter:** Wrap your middleware in a TCP proxy that forwards requests to a backend only when the limiter allows. This turns your in-process limiter into an edge rate limiter matching Cloudflare's architecture.