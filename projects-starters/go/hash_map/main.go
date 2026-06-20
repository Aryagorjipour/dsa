// Starter for Project Lab #4 — Hash Map from Scratch
// Spec: /projects/tier-1/04-hash-map-from-scratch
package main

import "fmt"

// HashMap is the interface both chaining and open-addressing maps implement.
type HashMap[K comparable, V any] interface {
	Put(key K, val V)
	Get(key K) (V, bool)
	Delete(key K) bool
	Size() int
}

func main() {
	fmt.Println("Implement ChainingHashMap with FNV-1a hashing and load-factor resizing.")
}