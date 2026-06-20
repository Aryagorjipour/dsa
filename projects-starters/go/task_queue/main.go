// Starter for Project Lab #6 — Task Queue System
// Spec: /projects/tier-2/06-task-queue-system
package main

import "fmt"

type Task struct {
	ID         string
	Payload    []byte
	Priority   int
	DependsOn  []string
	RetryCount int
}

func main() {
	fmt.Println("Implement RingBuffer, PriorityQueue, TopoSort resolver, then Dispatcher.")
}