# 03 - Divide and Conquer

## The Core Idea

**Divide and Conquer** is a strategy:

1. **Divide** the problem into two or more smaller subproblems of the same type.
2. **Conquer** (solve) the subproblems recursively.
3. **Combine** the solutions of the subproblems into a solution for the original problem.

This is one of the most powerful algorithmic patterns ever invented.

## Classic Example: Merge Sort

We will do the full implementation later, but here's the shape:

```
MergeSort(array):
    if array size <= 1: return array
    
    middle = array length / 2
    left = MergeSort(first half)
    right = MergeSort(second half)
    
    return Merge(left, right)   // the "combine" step
```

Divide: split in half  
Conquer: sort each half recursively  
Combine: merge two sorted halves in linear time

Result: O(n log n) time.

## Another Classic: Quick Sort (sort of)

Quick sort:
- Pick a pivot
- Partition around the pivot (smaller on left, larger on right)
- Recursively sort left and right

The "combine" step is trivial (nothing to do — partitioning already put things in place).

Average O(n log n), worst O(n²).

## The Power of "Combine"

The magic often lives in the combine step being efficient.

- Merge sort combine = O(n)
- If combine was O(n²), whole thing would be bad.

## Real-World Systems That Use Divide & Conquer

1. **Sorting in every database and language runtime**
   - Timsort (Python, Java, C# Array.Sort for objects uses a variant)
   - Go's sort package uses a hybrid that includes divide & conquer ideas

2. **Fast Fourier Transform (FFT)**
   - Used in audio processing, image compression (JPEG), signal processing, Shazam-like apps.
   - Cooley-Tukey algorithm is classic divide & conquer.

3. **Matrix Multiplication**
   - Strassen's algorithm (historical, now mostly theoretical because cache behavior is bad).

4. **Closest pair of points** — computational geometry (used in GIS, games).

5. **Karatsuba multiplication** for big integers (used in cryptographic libraries).

6. **MapReduce** at Google (and Hadoop, Spark) is divide-and-conquer at massive scale:
   - Map = conquer pieces independently
   - Reduce = combine

7. **Git blame / diff / merge algorithms** use clever divide & conquer + LCS techniques internally.

## When Divide and Conquer Shines

- Problem can be cleanly broken into independent subproblems.
- Combining results is cheaper than solving the whole thing at once.
- Subproblems are similar in size (balanced divide gives log n depth).

## Divide and Conquer vs Dynamic Programming

Both break problems down.

- **Divide and Conquer**: subproblems are **independent**. No overlapping work.
- **Dynamic Programming**: subproblems **overlap**. We use memoization or bottom-up tabulation to avoid recomputing.

Example:
- Merge Sort = pure divide and conquer (no overlapping subproblems)
- Fibonacci with memo = DP (heavy overlapping)

Many advanced algorithms are a mix.

## Implementation Pattern (Template)

### C# (merge sort shape)

```csharp
int[] MergeSort(int[] arr, int lo, int hi) {
    if (lo >= hi) return new[] { arr[lo] };
    int mid = lo + (hi - lo) / 2;
    var left = MergeSort(arr, lo, mid);
    var right = MergeSort(arr, mid + 1, hi);
    return Merge(left, right);
}
```

Most divide and conquer code follows this skeleton:

```go
func Solve(input) Result {
    if smallEnough(input) {
        return BaseCase(input)
    }
    // Divide
    leftInput, rightInput := Split(input)
    
    // Conquer
    leftResult := Solve(leftInput)
    rightResult := Solve(rightInput)
    
    // Combine
    return Combine(leftResult, rightResult)
}
```

## Important Practical Notes

- **Stack depth**: log n levels is usually safe. n levels is dangerous.
- **Memory**: recursive versions often use O(log n) stack + whatever combine allocates.
- **Parallelism**: independent subproblems are perfect for goroutines or Tasks.
- **Cache behavior**: sometimes iterative or cache-friendly versions beat beautiful recursive ones (this is why many production sorts are hybrids).

## Next

We will see divide and conquer everywhere:
- Merge Sort (detailed later)
- Quick Sort
- Quickselect
- Closest pair
- Many tree algorithms
- Fast string algorithms

Now let's look at another paradigm: Greedy.
