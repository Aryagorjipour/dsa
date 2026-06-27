# 22 - Merkle Tree

## What is a Merkle Tree?

A **Merkle tree** is a tree in which every **leaf** is a hash of a piece of data, and every **internal node** is the hash of its children's hashes.

It is also called a **hash tree**.

The root hash (Merkle root) acts as a cryptographic fingerprint of the entire dataset.

## Why This Is Brilliant

If any leaf changes, its hash changes → all parent hashes up to the root change.

You can:
- Verify that a specific piece of data is in the tree with only O(log n) hashes (Merkle proof).
- Compare two large datasets by just comparing root hashes.
- Detect exactly which parts differ efficiently.

## Visual (Simple)

![Merkle Tree](/images/merkle-tree.png)

```
          Root Hash
         /         \
     H(AB)       H(CD)
     /   \       /   \
   H(A) H(B)   H(C) H(D)
    |    |      |    |
   DataA DataB DataC DataD
```

If DataB changes, only H(B), H(AB), and Root change.

### Canonical Problem: Verify a Specific Transaction is in a Block Without Downloading the Whole Block (Blockchain SPV / Light Clients)

**Problem Description:**

A full Bitcoin block can contain thousands of transactions. A mobile wallet (light client) wants to check if a particular transaction is included in a block without downloading the entire block.

The block header contains only the Merkle root (32 bytes). The client requests a Merkle proof (log n hashes) from a full node and can verify the transaction is in the tree by recomputing the root.

This is the core reason Merkle Trees were popularized in distributed systems like Bitcoin (and used in Git for object integrity).

## Operations & Complexity

| Operation       | Time       | Space  |
|-----------------|------------|--------|
| Build tree      | O(n)       | O(n)   |
| Compute root    | O(n)       | O(1) if streaming |
| Merkle proof    | O(log n)   | O(log n) hashes |
| Verify proof    | O(log n)   | O(1)   |

## Complete Implementation (C#) — SHA-256

```csharp
using System.Security.Cryptography;
using System.Text;

public class MerkleTree {
    private readonly List<byte[]> _leaves;
    private byte[]? _root;

    public MerkleTree(IEnumerable<string> data) {
        _leaves = data.Select(HashLeaf).ToList();
        _root = BuildRoot(_leaves);
    }

    public byte[] Root => _root ?? throw new InvalidOperationException("Empty tree");

    public static byte[] HashLeaf(string data) {
        return SHA256.HashData(Encoding.UTF8.GetBytes(data));
    }

    public static byte[] HashPair(byte[] left, byte[] right) {
        var combined = new byte[left.Length + right.Length];
        Buffer.BlockCopy(left, 0, combined, 0, left.Length);
        Buffer.BlockCopy(right, 0, combined, left.Length, right.Length);
        return SHA256.HashData(combined);
    }

    private static byte[] BuildRoot(List<byte[]> leaves) {
        if (leaves.Count == 0) return SHA256.HashData(Array.Empty<byte>());
        var level = new List<byte[]>(leaves);
        while (level.Count > 1) {
            var next = new List<byte[]>();
            for (int i = 0; i < level.Count; i += 2) {
                byte[] right = i + 1 < level.Count ? level[i + 1] : level[i];
                next.Add(HashPair(level[i], right));
            }
            level = next;
        }
        return level[0];
    }

    public List<byte[]> GetProof(int index) {
        var proof = new List<byte[]>();
        var level = new List<byte[]>(_leaves);
        int idx = index;

        while (level.Count > 1) {
            int sibling = idx % 2 == 0 ? idx + 1 : idx - 1;
            if (sibling < level.Count) {
                proof.Add(level[sibling]);
            }
            var next = new List<byte[]>();
            for (int i = 0; i < level.Count; i += 2) {
                byte[] right = i + 1 < level.Count ? level[i + 1] : level[i];
                next.Add(HashPair(level[i], right));
            }
            idx /= 2;
            level = next;
        }
        return proof;
    }

    public static bool VerifyProof(string data, List<byte[]> proof, byte[] root, int index) {
        byte[] hash = HashLeaf(data);
        int idx = index;
        foreach (var sibling in proof) {
            hash = idx % 2 == 0 ? HashPair(hash, sibling) : HashPair(sibling, hash);
            idx /= 2;
        }
        return hash.SequenceEqual(root);
    }
}
```

## Complete Implementation (Go) — SHA-256

```go
import (
    "crypto/sha256"
    "encoding/hex"
)

type MerkleTree struct {
    leaves [][]byte
    root   []byte
}

func NewMerkleTree(data []string) *MerkleTree {
    leaves := make([][]byte, len(data))
    for i, d := range data {
        leaves[i] = hashLeaf(d)
    }
    return &MerkleTree{leaves: leaves, root: buildRoot(leaves)}
}

func hashLeaf(data string) []byte {
    h := sha256.Sum256([]byte(data))
    return h[:]
}

func hashPair(left, right []byte) []byte {
    combined := append(append([]byte{}, left...), right...)
    h := sha256.Sum256(combined)
    return h[:]
}

func buildRoot(leaves [][]byte) []byte {
    if len(leaves) == 0 {
        h := sha256.Sum256(nil)
        return h[:]
    }
    level := leaves
    for len(level) > 1 {
        var next [][]byte
        for i := 0; i < len(level); i += 2 {
            right := level[i]
            if i+1 < len(level) {
                right = level[i+1]
            }
            next = append(next, hashPair(level[i], right))
        }
        level = next
    }
    return level[0]
}

func (t *MerkleTree) Root() string {
    return hex.EncodeToString(t.root)
}

func (t *MerkleTree) GetProof(index int) [][]byte {
    var proof [][]byte
    level := t.leaves
    idx := index

    for len(level) > 1 {
        sibling := idx
        if idx%2 == 0 {
            sibling = idx + 1
        } else {
            sibling = idx - 1
        }
        if sibling < len(level) {
            proof = append(proof, level[sibling])
        }
        var next [][]byte
        for i := 0; i < len(level); i += 2 {
            right := level[i]
            if i+1 < len(level) {
                right = level[i+1]
            }
            next = append(next, hashPair(level[i], right))
        }
        idx /= 2
        level = next
    }
    return proof
}

func VerifyProof(data string, proof [][]byte, root []byte, index int) bool {
    hash := hashLeaf(data)
    idx := index
    for _, sibling := range proof {
        if idx%2 == 0 {
            hash = hashPair(hash, sibling)
        } else {
            hash = hashPair(sibling, hash)
        }
        idx /= 2
    }
    return string(hash) == string(root)
}
```

## Real World Use Cases (Hugely Important)

### 1. Git (The Most Successful Use)

Git uses a Merkle **DAG** of trees and blobs. Every commit, tree, and blob is identified by its SHA hash.

### 2. Blockchain (Bitcoin, Ethereum, etc.)

Every block contains a Merkle root of all transactions. Light clients verify inclusion with small proofs.

### 3. Distributed File Systems & Sync

IPFS, BitTorrent piece verification, Dropbox/Syncthing/rsync variants.

### 4. Databases & Storage Engines

Cassandra, ScyllaDB use Merkle trees for **anti-entropy** (detecting inconsistencies between replicas).

### 5. Certificate Transparency Logs

Tamper-proof logs of SSL certificates.

## Merkle Proofs

The killer feature: prove that `DataB` is in the tree without sending the whole tree.

You only need the sibling hashes along the path to the root. The verifier reconstructs the root and compares it to the trusted root hash.

## Variants

- **Merkle DAG** (Git, IPFS) — nodes can have multiple parents
- **Sparse Merkle Tree** — used in some blockchains for key-value storage
- **Merkle Patricia Trie** — used by Ethereum

## Summary

Merkle tree = tree of hashes.

It gives you a way to have a single hash that represents an entire (potentially huge) dataset, plus efficient proofs that a particular piece belongs to that dataset.

It is fundamental to version control, blockchains, distributed systems, and data integrity at scale.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Mini Version Control System](/projects/tier-4/16-mini-version-control) — content-addressable storage with Merkle DAGs.
:::

**Next:** [23 - Graph](23-graph.md)