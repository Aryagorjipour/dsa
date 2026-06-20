// Starter for Project Lab #5 — Cache with Eviction Policies
// Spec: /projects/tier-2/05-cache-with-eviction
package main

import "fmt"

// Cache is the policy-agnostic interface LRU and LFU implementations satisfy.
type Cache[K comparable, V any] interface {
	Get(key K) (V, bool)
	Put(key K, val V)
}

func main() {
	fmt.Println("Start with DoublyLinkedList, then LRUCache, then LFU variants.")
}