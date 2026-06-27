package main

import "fmt"

// Rope for efficient large-string editing.
// Problem: Edit very large strings without O(n) copies on every insert.

type Rope struct {
	left, right *Rope
	weight      int
	value       string
}

func (r *Rope) Len() int {
	if r == nil {
		return 0
	}
	return r.weight + r.right.Len()
}

func FromString(s string, chunkSize int) *Rope {
	if chunkSize <= 0 {
		chunkSize = 8
	}
	if len(s) <= chunkSize {
		return &Rope{value: s, weight: len(s)}
	}
	mid := len(s) / 2
	return Concat(FromString(s[:mid], chunkSize), FromString(s[mid:], chunkSize))
}

func Concat(a, b *Rope) *Rope {
	if a == nil {
		return b
	}
	if b == nil {
		return a
	}
	return &Rope{left: a, right: b, weight: a.Len()}
}

func (r *Rope) Split(index int) (*Rope, *Rope) {
	if r.left == nil && r.right == nil {
		return FromString(r.value[:index], 8), FromString(r.value[index:], 8)
	}
	if index < r.weight {
		l, rem := r.left.Split(index)
		return l, Concat(rem, r.right)
	}
	l, rem := r.right.Split(index - r.weight)
	return Concat(r.left, l), rem
}

func (r *Rope) Insert(index int, text string) *Rope {
	left, right := r.Split(index)
	return Concat(Concat(left, FromString(text, 8)), right)
}

func (r *Rope) Index(i int) byte {
	if r.left == nil && r.right == nil {
		return r.value[i]
	}
	if i < r.weight {
		return r.left.Index(i)
	}
	return r.right.Index(i - r.weight)
}

func (r *Rope) String() string {
	if r == nil {
		return ""
	}
	if r.left == nil && r.right == nil {
		return r.value
	}
	return r.left.String() + r.right.String()
}

func main() {
	doc := FromString("The quick brown fox jumps over the lazy dog.", 8)
	doc = doc.Insert(4, "VERY ")
	fmt.Printf("Length after insert: %d\n", doc.Len())
	fmt.Printf("Char at index 10: %c\n", doc.Index(10))
	fmt.Printf("Document: %s\n", doc.String())
}