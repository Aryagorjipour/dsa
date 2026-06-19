# 14 - Heapsort

## The Problem Heapsort Solves

**Problem: Sort an array in O(n log n) time using O(1) extra space (in-place), with guaranteed worst-case performance, without using recursion/stack space of quicksort or merge sort.**

Heapsort is comparison-based and uses the binary heap property.

## Why It Exists

Unlike quicksort (average great but worst O(n²) without care) and merge sort (needs O(n) space), heapsort gives:
- O(n log n) worst case
- O(1) extra space
- In-place

It is useful when memory is extremely tight or you need strict guarantees.

## How It Works

1. Build a max-heap from the array (O(n))
2. Repeatedly swap the root (largest) with the last element, reduce heap size, and heapify down.

## Full Detailed Implementation

### C#

```csharp
public static void HeapSort(int[] arr) {
    int n = arr.Length;

    // Build max heap
    for (int i = n / 2 - 1; i >= 0; i--) {
        Heapify(arr, n, i);
    }

    // Extract elements one by one
    for (int i = n - 1; i > 0; i--) {
        (arr[0], arr[i]) = (arr[i], arr[0]);
        Heapify(arr, i, 0);
    }
}

private static void Heapify(int[] arr, int n, int i) {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;

    if (left < n && arr[left] > arr[largest])
        largest = left;
    if (right < n && arr[right] > arr[largest])
        largest = right;

    if (largest != i) {
        (arr[i], arr[largest]) = (arr[largest], arr[i]);
        Heapify(arr, n, largest);
    }
}
```

### Go

```go
func HeapSort(arr []int) {
    n := len(arr)
    // Build max heap
    for i := n/2 - 1; i >= 0; i-- {
        heapify(arr, n, i)
    }
    // Extract
    for i := n - 1; i > 0; i-- {
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)
    }
}

func heapify(arr []int, n, i int) {
    largest := i
    left := 2*i + 1
    right := 2*i + 2

    if left < n && arr[left] > arr[largest] {
        largest = left
    }
    if right < n && arr[right] > arr[largest] {
        largest = right
    }
    if largest != i {
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)
    }
}
```

## Complexity

- Build heap: O(n)
- Overall: O(n log n) worst, average, best
- Space: O(1)

## Real World

- Used in some embedded systems and memory-constrained environments
- Part of some selection algorithms
- Kernel sort utilities when space is critical
- Sometimes used as a fallback in introsort when recursion depth or space is concern

## Problems

- Implement heapsort using the heap data structure you built earlier
- K largest elements (heap sort can stop early)
- Sort nearly sorted data? Not the best, but guaranteed.

Heapsort is the "reliable in-place guaranteed" sorting algorithm.
