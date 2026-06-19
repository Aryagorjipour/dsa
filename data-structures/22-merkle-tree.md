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

A full Bitcoin block can contain thousands of transactions. A mobile wallet (light client) wants to check if a particular transaction is included in a block without downloading the entire block (which can be large).

The block header contains only the Merkle root (32 bytes). The client requests a Merkle proof (log n hashes) from a full node and can verify the transaction is in the tree by recomputing the root.

This is the core reason Merkle Trees were popularized in distributed systems like Bitcoin (and used in Git for object integrity).

**Implementation:**

Simple hash tree build and proof verification code is in the chapter. Full production code in Bitcoin Core.

See resources/production-use-cases.md for more.

## Real World Use Cases (Hugely Important)

### 1. Git (The Most Successful Use)

Git uses a Merkle **DAG** (directed acyclic graph) of trees and blobs.

Every commit, tree, and blob is identified by its SHA-1 (now SHA-256) hash.

This gives Git:
- Incredible integrity guarantees
- Efficient `diff` and `clone`
- Content-addressable storage

When you `git push`, only the changed parts are transferred.

### 2. Blockchain (Bitcoin, Ethereum, etc.)

Every block contains a Merkle root of all transactions in that block.

This allows:
- Light clients (SPV) to verify a transaction was included with a small proof.
- Efficient verification that the transaction set hasn't been tampered with.

### 3. Distributed File Systems & Sync

- **IPFS** — heavily uses Merkle DAGs
- **BitTorrent** — uses Merkle trees for piece verification
- **Dropbox, Syncthing, rsync** variants use Merkle or similar trees for efficient sync

### 4. Databases & Storage Engines

- Cassandra, ScyllaDB, and some LSM engines use Merkle trees for **anti-entropy** (detecting inconsistencies between replicas during repair).
- Amazon Dynamo and many Dynamo-style systems use Merkle trees for replica reconciliation.

### 5. Certificate Transparency Logs

Merkle trees are used to create auditable, tamper-proof logs of SSL certificates.

### 6. Package Managers & Artifact Repositories

Some systems use Merkle trees to verify that a set of artifacts matches exactly.

## Merkle Proofs

The killer feature.

Suppose you want to prove that `DataB` is in the tree without sending the whole tree.

You only need to send:
- H(A)
- H(AB) sibling path
- H(CD)

The verifier can reconstruct the root and compare it to the trusted root hash.

This is how light clients in blockchains work.

## Implementation Note

Merkle trees are usually **not** balanced in the traditional search-tree sense. They are often just complete binary trees over a list of items.

In Git they are actually trees of directories (each directory object is a Merkle node).

## Security Properties

- Collision resistance depends on the hash function (SHA-256 is currently considered safe).
- Any change anywhere is detectable at the root.

## Variants

- **Merkle DAG** (Git, IPFS) — nodes can have multiple parents, not a strict tree
- **Sparse Merkle Tree** — used in some blockchains for key-value storage
- **Merkle Patricia Trie** — used by Ethereum (combination of trie + Merkle)

## Summary

Merkle tree = tree of hashes.

It gives you a way to have a single hash that represents an entire (potentially huge) dataset, plus efficient proofs that a particular piece belongs to that dataset.

It is fundamental to version control, blockchains, distributed systems, and data integrity at scale.

**Next:** [23 - Graph](23-graph.md)
