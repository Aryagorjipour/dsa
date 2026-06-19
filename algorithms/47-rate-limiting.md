# 47 - Rate Limiting Algorithms

## The Problem

Protect your system from overload:
- Per user
- Per IP
- Per API key
- Per endpoint

Common algorithms:

### 1. Token Bucket
- Refill tokens at a steady rate
- Each request consumes a token
- Very flexible, allows bursts

### 2. Leaky Bucket
- Requests go into a bucket
- Processed at constant rate
- Excess are dropped or queued

### 3. Fixed Window Counter
- Simple but can have bursts at window boundaries

### 4. Sliding Window Log
- Keep timestamps of requests in a window
- Accurate but more memory

### 5. Sliding Window Counter
- Hybrid, very popular in practice

## Real World

Every public API you have ever used:
- Twitter, GitHub, Stripe, OpenAI, Google, AWS all use sophisticated rate limiting
- Usually implemented with Redis + one of the above (often token bucket or sliding window)

## Data Structures Involved

- Often combined with **sorted sets** or **hash + timestamps** in Redis
- Sometimes use **sliding window** + **hash map** per client
- High-scale systems use probabilistic structures or approximate counters

## Implementation Considerations

- Distributed rate limiting (multiple servers)
- Bursty vs smooth traffic
- Different limits for different tiers
- Graceful degradation

## Summary

Rate limiting is one of the most important "applied algorithms" in building reliable internet services.

It combines classic algorithms with distributed systems data structures (Redis, etc.).
