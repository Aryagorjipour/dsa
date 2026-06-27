# 44 - Backtracking

## The Mindset

"Try a choice. If it leads to a solution, great. If not, undo it and try the next choice."

Backtracking is **DFS + pruning + undo**. You explore a decision tree depth-first, abandon branches that violate constraints early, and restore state when retreating.

## Canonical Problem: N-Queens

Place **n** queens on an **n×n** chessboard so that no two queens attack each other (same row, column, or diagonal).

**Input:** `n` (e.g. 8)  
**Output:** All distinct board configurations (or count of solutions).

**Why backtracking?** The search space is enormous (C(n², n) placements). Pruning invalid partial boards early makes the problem tractable.

## Complexity

| Problem | Time | Space | Notes |
|---------|------|-------|-------|
| N-Queens (all solutions) | O(n!) worst case | O(n²) board + O(n) recursion | Pruning cuts most branches |
| Subset sum | O(2ⁿ) | O(n) stack | Prune when sum exceeds target |
| Sudoku | Exponential | O(1) board | Constraint propagation helps heavily |
| Generate parentheses | O(4ⁿ / √n) Catalan | O(n) stack | Well-pruned tree |

Worst-case time is often exponential; **good pruning** is what separates unusable from fast.

## Full Implementation — N-Queens

### C#

```csharp
public class NQueens {
    private int n;
    private readonly List<List<string>> solutions = new();

    public IList<IList<string>> Solve(int n) {
        this.n = n;
        var board = new char[n][];
        for (int i = 0; i < n; i++) {
            board[i] = new char[n];
            Array.Fill(board[i], '.');
        }
        Backtrack(board, 0);
        return solutions;
    }

    void Backtrack(char[][] board, int row) {
        if (row == n) {
            solutions.Add(board.Select(r => new string(r)).ToList());
            return;
        }
        for (int col = 0; col < n; col++) {
            if (!IsSafe(board, row, col)) continue;
            board[row][col] = 'Q';          // choose
            Backtrack(board, row + 1);      // explore
            board[row][col] = '.';          // undo
        }
    }

    bool IsSafe(char[][] board, int row, int col) {
        for (int i = 0; i < row; i++) {
            if (board[i][col] == 'Q') return false;
            int d = row - i;
            if (col - d >= 0 && board[i][col - d] == 'Q') return false;
            if (col + d < n && board[i][col + d] == 'Q') return false;
        }
        return true;
    }
}
```

### Go

```go
func SolveNQueens(n int) [][]string {
    board := make([][]byte, n)
    for i := range board {
        board[i] = make([]byte, n)
        for j := range board[i] {
            board[i][j] = '.'
        }
    }
    var solutions [][]string
    var backtrack func(row int)
    backtrack = func(row int) {
        if row == n {
            rowStr := make([]string, n)
            for i := range board {
                rowStr[i] = string(board[i])
            }
            solutions = append(solutions, rowStr)
            return
        }
        for col := 0; col < n; col++ {
            if !isSafe(board, row, col) {
                continue
            }
            board[row][col] = 'Q'
            backtrack(row + 1)
            board[row][col] = '.'
        }
    }
    backtrack(0)
    return solutions
}

func isSafe(board [][]byte, row, col int) bool {
    n := len(board)
    for i := 0; i < row; i++ {
        if board[i][col] == 'Q' {
            return false
        }
        d := row - i
        if col-d >= 0 && board[i][col-d] == 'Q' {
            return false
        }
        if col+d < n && board[i][col+d] == 'Q' {
            return false
        }
    }
    return true
}
```

## The Backtracking Template

```
function backtrack(state, choices):
    if state is complete solution:
        record and return
    for each choice in choices:
        if choice is invalid: continue      // prune
        apply choice to state                // choose
        backtrack(state, next choices)       // explore
        undo choice from state               // unchoose
```

Every backtracking problem is this skeleton with different `state`, `choices`, and `isValid`.

## When Backtracking is the Answer

- You need to generate or find **all** (or some) valid configurations
- Constraints eliminate large branches early
- Brute force is exponential but pruning makes it practical

## Key Techniques

| Technique | What it does | Example |
|-----------|--------------|---------|
| **Pruning** | Stop when partial solution is invalid | N-Queens column/diag check |
| **Bitmask state** | O(1) conflict checks | N-Queens with bit masks (see ch. 45) |
| **Symmetry reduction** | Skip equivalent configurations | Only try first column ≤ n/2 |
| **Forward checking** | Propagate constraints before recurse | Sudoku, CSP solvers |
| **Dancing Links** | Efficient exact cover (advanced) | Sudoku at competition speed |

## Flagship Problems

| Problem | Pattern |
|---------|---------|
| N-Queens | Place with row/column/diag constraints |
| Sudoku solver | Fill cells, prune on row/col/box conflict |
| Generate valid parentheses | Open count ≤ n, close count ≤ open count |
| Combination sum | Pick/unpick elements, prune on sum |
| Word search (Boggle) | DFS on grid with used-cell tracking |
| Permutations / subsets | Include/exclude each element |
| Graph coloring | Assign colors, prune on neighbor conflict |

## Real World

- **Compilers** — register allocation via graph coloring
- **Constraint solvers** — scheduling, rostering, SAT/SMT backends
- **Test case generation** — explore input combinations with constraints
- **Game AI** — move generation, puzzle solving
- **Regex engines** — many engines backtrack on alternation and quantifiers (catastrophic backtracking is the failure mode)
- **Git bisect** — binary search on commit history with good/bad markers

## Summary

Backtracking is brute force with intelligence. The difference between "impossibly slow" and "surprisingly fast" is almost always **pruning** and **good state representation** (bitmasks, constraint propagation).

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Constraint Solver](/projects/tier-4/22-constraint-solver) — Sudoku, N-Queens, and mini-SAT with backtracking.
:::

**Next:** [45 - Bit Manipulation](45-bit-manipulation.md)