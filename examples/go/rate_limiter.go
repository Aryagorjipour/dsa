package main

import (
	"fmt"
	"time"
)

// Token Bucket Rate Limiter
// Real-world: Twitter, Amazon, Stripe APIs. Protects services from overload.

type TokenBucket struct {
	capacity   int
	tokens     int
	refillRate int // tokens per second
	lastRefill time.Time
}

func NewTokenBucket(capacity, refillRate int) *TokenBucket {
	return &TokenBucket{
		capacity:   capacity,
		tokens:     capacity,
		refillRate: refillRate,
		lastRefill: time.Now(),
	}
}

func (tb *TokenBucket) Allow() bool {
	now := time.Now()
	elapsed := now.Sub(tb.lastRefill).Seconds()
	tb.tokens += int(elapsed * float64(tb.refillRate))
	if tb.tokens > tb.capacity {
		tb.tokens = tb.capacity
	}
	tb.lastRefill = now

	if tb.tokens > 0 {
		tb.tokens--
		return true
	}
	return false
}

func main() {
	limiter := NewTokenBucket(5, 1) // 5 tokens, refill 1/sec

	for i := 0; i < 10; i++ {
		if limiter.Allow() {
			fmt.Printf("Request %d: ALLOWED\n", i)
		} else {
			fmt.Printf("Request %d: RATE LIMITED\n", i)
		}
		time.Sleep(200 * time.Millisecond)
	}

	// Production: API gateways, microservices to enforce quotas.
}