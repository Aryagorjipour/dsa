// Starter for Project Lab #3 — Stack-Based Expression Evaluator
// Spec: /projects/tier-1/03-stack-calculator
package main

import "fmt"

type Stack[T any] interface {
	Push(v T)
	Pop() (T, bool)
	Peek() (T, bool)
	Len() int
}

func main() {
	fmt.Println("Implement Stack, then ShuntingYard tokenizer, then Evaluator.")
}