# 44 - Bit Manipulation

## Why It Matters

Many low-level and high-performance tricks rely on clever use of bits.

Modern CPUs are extremely fast at bitwise operations.

## Common Tricks (You Should Know These Cold)

- Check if power of 2: `n > 0 && (n & (n-1)) == 0`
- Count set bits (popcount)
- Set / clear / toggle a bit
- Isolate rightmost set bit: `n & -n`
- Swap two numbers without temp: `a ^= b; b ^= a; a ^= b` (don't actually do this in real code)
- Fast multiplication / division by powers of 2 using shifts
- Gray codes
- Subsets using bitmasks (2^n iteration)

## Real World

- Operating systems (page tables, permissions, flags)
- Network protocols (TCP flags, IP headers)
- Compression algorithms
- Chess engines (bitboards — extremely famous technique)
- Graphics (masks, blending)
- Hashing and Bloom filters
- Cryptography (constant time operations to avoid side channels)
- Database bitmap indexes

## Famous Problems

- Single Number (XOR magic)
- Missing Number
- Power of Two
- Reverse Bits
- Bitwise AND of range
- Maximum XOR of two numbers in array (Trie of bits)

## Summary

Bit manipulation is the "I need to go fast and close to the metal" toolkit.

Every senior engineer should be comfortable with it.
