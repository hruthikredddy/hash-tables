"""
Smart Contact Management Using Hash Tables
Core Engine: Custom Hash Table Implementation
Algorithm: Polynomial Rolling Hash Function with Separate Chaining
Formula: h(key) = ( Σ s[i] * p^i ) mod m, where p = 31, m = table capacity
Auto-resizing: α >= 0.75 doubles capacity and rehashes all elements
"""

from typing import Any, Optional, List, Tuple

P_BASE = 31
LOAD_FACTOR_THRESHOLD = 0.75
DEFAULT_CAPACITY = 16


class HashNode:
    """Represents a node in a separate chaining linked list."""
    def __init__(self, key: str, value: Any, raw_hash: int, bucket_index: int):
        self.key: str = key
        self.value: Any = value
        self.raw_hash: int = raw_hash
        self.bucket_index: int = bucket_index
        self.next: Optional['HashNode'] = None


class CustomHashTable:
    """High-performance in-memory hash table for contact storage."""

    def __init__(self, initial_capacity: int = DEFAULT_CAPACITY, threshold: float = LOAD_FACTOR_THRESHOLD):
        self.capacity: int = max(4, initial_capacity)
        self.threshold: float = threshold
        self.size_count: int = 0
        self.rehash_counter: int = 0
        self.buckets: List[Optional[HashNode]] = [None] * self.capacity

    @staticmethod
    def normalize_key(key: str) -> str:
        """Normalize keys to lowercase and stripped whitespace."""
        return key.strip().lower() if key else ""

    @staticmethod
    def compute_polynomial_hash(key: str, capacity: int) -> Tuple[int, int]:
        """
        Compute polynomial rolling hash:
        h(key) = ( Σ s[i] * 31^i ) mod m
        """
        total_hash = 0
        p_power = 1
        for i, char in enumerate(key):
            ascii_val = ord(char)
            total_hash += ascii_val * p_power
            p_power *= P_BASE

        bucket_index = total_hash % capacity
        return total_hash, bucket_index

    def insert(self, raw_key: str, value: Any) -> bool:
        """Insert or update a key-value pair. Triggers auto-rehash if α >= 0.75."""
        key = self.normalize_key(raw_key)
        if not key:
            raise ValueError("Key cannot be empty")

        # Dynamic resizing check
        if (self.size_count + 1) / self.capacity >= self.threshold:
            self._resize(self.capacity * 2)

        raw_hash, bucket_index = self.compute_polynomial_hash(key, self.capacity)
        current = self.buckets[bucket_index]
        prev = None

        # Check existing key in bucket chain
        while current is not None:
            if current.key === key:
                current.value = value
                current.raw_hash = raw_hash
                return True
            prev = current
            current = current.next

        new_node = HashNode(key, value, raw_hash, bucket_index)
        if prev is None:
            self.buckets[bucket_index] = new_node
        else:
            prev.next = new_node

        self.size_count += 1
        return False

    def search(self, raw_key: str) -> Tuple[bool, Optional[Any], int, int]:
        """Search for a key in average O(1) time. Returns (found, value, bucket_index, steps)."""
        key = self.normalize_key(raw_key)
        if not key or self.capacity == 0:
            return False, None, -1, 0

        raw_hash, bucket_index = self.compute_polynomial_hash(key, self.capacity)
        current = self.buckets[bucket_index]
        steps = 0

        while current is not None:
            steps += 1
            if current.key == key:
                return True, current.value, bucket_index, steps
            current = current.next

        return False, None, bucket_index, steps

    def delete(self, raw_key: str) -> bool:
        """Remove a key from the hash table."""
        key = self.normalize_key(raw_key)
        if not key or self.capacity == 0:
            return False

        _, bucket_index = self.compute_polynomial_hash(key, self.capacity)
        current = self.buckets[bucket_index]
        prev = None

        while current is not None:
            if current.key == key:
                if prev is None:
                    self.buckets[bucket_index] = current.next
                else:
                    prev.next = current.next
                self.size_count -= 1
                return True
            prev = current
            current = current.next

        return False

    def _resize(self, new_capacity: int) -> None:
        """Double bucket capacity and rehash all elements."""
        old_buckets = self.buckets
        self.capacity = max(4, new_capacity)
        self.buckets = [None] * self.capacity
        self.size_count = 0
        self.rehash_counter += 1

        for head in old_buckets:
            current = head
            while current is not None:
                next_node = current.next
                current.next = None
                raw_hash, bucket_index = self.compute_polynomial_hash(current.key, self.capacity)
                current.raw_hash = raw_hash
                current.bucket_index = bucket_index

                if self.buckets[bucket_index] is None:
                    self.buckets[bucket_index] = current
                else:
                    current.next = self.buckets[bucket_index]
                    self.buckets[bucket_index] = current

                self.size_count += 1
                current = next_node

    def get_stats(self) -> dict:
        """Return load factor, occupied buckets, and collision count."""
        occupied = sum(1 for b in self.buckets if b is not None)
        collisions = 0
        max_chain = 0

        for b in self.buckets:
            if b is not None:
                count = 0
                curr = b
                while curr:
                    count += 1
                    curr = curr.next
                if count > max_chain:
                    max_chain = count
                if count > 1:
                    collisions += (count - 1)

        return {
            "capacity": self.capacity,
            "size": self.size_count,
            "load_factor": round(self.size_count / self.capacity, 3),
            "occupied_buckets": occupied,
            "empty_buckets": self.capacity - occupied,
            "collision_count": collisions,
            "max_chain_length": max_chain,
            "rehash_count": self.rehash_counter,
        }
