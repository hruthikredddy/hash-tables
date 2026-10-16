import type {
  BucketInspection,
  CharComputation,
  HashComputationDetails,
  HashNode,
  HashTableStats,
  HashTraceStep,
} from '../types/contact';

export const P_BASE = 31;
export const DEFAULT_INITIAL_CAPACITY = 16;
export const LOAD_FACTOR_THRESHOLD = 0.75;

/**
 * Key normalization helper
 */
export function normalizeKey(key: string): string {
  if (!key) return '';
  return key.trim().toLowerCase();
}

/**
 * Normalize phone numbers to canonical digits
 */
export function normalizePhone(phone: string): string {
  if (!phone) return '';
  return phone.replace(/[^0-9+]/g, '').trim();
}

/**
 * Pure polynomial rolling hash computation matching the presentation formula:
 * h(key) = ( Σ s[i] * p^i ) mod m
 * Where s[i] is ASCII value, p = 31, m is table capacity.
 */
export function computePolynomialHash(
  rawKey: string,
  capacity: number
): HashComputationDetails {
  const key = rawKey;
  const terms: CharComputation[] = [];
  const pBig = BigInt(P_BASE);

  let totalHashBig = 0n;
  let pPower = 1n;

  for (let i = 0; i < key.length; i++) {
    const char = key[i];
    const ascii = char.charCodeAt(0);
    const termVal = BigInt(ascii) * pPower;
    totalHashBig += termVal;

    terms.push({
      index: i,
      char,
      ascii,
      pExponent: i,
      pFactor: pPower.toString(),
      termValue: termVal.toString(),
    });

    // Advance power for next iteration
    pPower *= pBig;
  }

  const capBig = BigInt(Math.max(1, capacity));
  const bucketIndexBig = totalHashBig >= 0n ? totalHashBig % capBig : ((totalHashBig % capBig) + capBig) % capBig;
  const bucketIndex = Number(bucketIndexBig);

  // Safe number representation if within bounds
  const rawHashNumber = totalHashBig <= BigInt(Number.MAX_SAFE_INTEGER)
    ? Number(totalHashBig)
    : Number(totalHashBig % 1000000007n);

  return {
    key,
    capacity,
    p: P_BASE,
    terms,
    rawHashBigInt: totalHashBig.toString(),
    rawHashNumber,
    bucketIndex,
  };
}

/**
 * Custom Hash Table with Polynomial Rolling Hash and Separate Chaining
 */
export class CustomHashTable<T = any> {
  private capacity: number;
  private sizeCount: number;
  private buckets: (HashNode<T> | null)[];
  private rehashCounter: number;
  private readonly threshold: number;

  constructor(initialCapacity = DEFAULT_INITIAL_CAPACITY, threshold = LOAD_FACTOR_THRESHOLD) {
    this.capacity = Math.max(4, initialCapacity);
    this.threshold = threshold;
    this.sizeCount = 0;
    this.rehashCounter = 0;
    this.buckets = new Array(this.capacity).fill(null);
  }

  public getCapacity(): number {
    return this.capacity;
  }

  public size(): number {
    return this.sizeCount;
  }

  public getLoadFactor(): number {
    return this.sizeCount / this.capacity;
  }

  public getThreshold(): number {
    return this.threshold;
  }

  public getRehashCount(): number {
    return this.rehashCounter;
  }

  /**
   * Insert or update a key-value pair
   */
  public insert(
    rawKey: string,
    value: T
  ): {
    replaced: boolean;
    collided: boolean;
    rehashed: boolean;
    oldCapacity?: number;
    newCapacity?: number;
    bucketIndex: number;
    chainLength: number;
  } {
    const key = normalizeKey(rawKey);
    if (!key) {
      throw new Error('Key cannot be empty');
    }

    // Check if auto-rehashing is needed before insertion
    let rehashed = false;
    let oldCap: number | undefined;
    let newCap: number | undefined;

    // Projected load factor if we add 1 new item
    const projectedLoad = (this.sizeCount + 1) / this.capacity;
    if (projectedLoad >= this.threshold) {
      oldCap = this.capacity;
      this.resize(this.capacity * 2);
      newCap = this.capacity;
      rehashed = true;
    }

    const { rawHashNumber, bucketIndex } = computePolynomialHash(key, this.capacity);
    let current = this.buckets[bucketIndex];
    let collided = false;
    let replaced = false;
    let chainLength = 0;

    // Check if key already exists in the chain
    let prev: HashNode<T> | null = null;
    while (current !== null) {
      chainLength++;
      if (current.key === key) {
        // Update existing node
        current.value = value;
        current.rawHash = rawHashNumber;
        replaced = true;
        return {
          replaced: true,
          collided: false,
          rehashed,
          oldCapacity: oldCap,
          newCapacity: newCap,
          bucketIndex,
          chainLength,
        };
      }
      prev = current;
      current = current.next;
    }

    // New node to be added
    const newNode: HashNode<T> = {
      key,
      value,
      rawHash: rawHashNumber,
      bucketIndex,
      next: null,
    };

    if (prev === null) {
      // First item in this bucket
      this.buckets[bucketIndex] = newNode;
      chainLength = 1;
      collided = false;
    } else {
      // Collision occurred! Append to end of chain (or prepend)
      prev.next = newNode;
      chainLength++;
      collided = true;
    }

    this.sizeCount++;

    return {
      replaced,
      collided,
      rehashed,
      oldCapacity: oldCap,
      newCapacity: newCap,
      bucketIndex,
      chainLength,
    };
  }

  /**
   * Search for a key in average O(1) time
   */
  public search(rawKey: string): {
    found: boolean;
    value?: T;
    bucketIndex: number;
    chainSteps: number;
    rawHash: number;
  } {
    const key = normalizeKey(rawKey);
    if (!key || this.capacity === 0) {
      return { found: false, bucketIndex: -1, chainSteps: 0, rawHash: 0 };
    }

    const { rawHashNumber, bucketIndex } = computePolynomialHash(key, this.capacity);
    let current = this.buckets[bucketIndex];
    let chainSteps = 0;

    while (current !== null) {
      chainSteps++;
      if (current.key === key) {
        return {
          found: true,
          value: current.value,
          bucketIndex,
          chainSteps,
          rawHash: rawHashNumber,
        };
      }
      current = current.next;
    }

    return {
      found: false,
      bucketIndex,
      chainSteps,
      rawHash: rawHashNumber,
    };
  }

  /**
   * Delete a key from the hash table
   */
  public delete(rawKey: string): {
    deleted: boolean;
    bucketIndex: number;
    chainSteps: number;
  } {
    const key = normalizeKey(rawKey);
    if (!key || this.capacity === 0) {
      return { deleted: false, bucketIndex: -1, chainSteps: 0 };
    }

    const { bucketIndex } = computePolynomialHash(key, this.capacity);
    let current = this.buckets[bucketIndex];
    let prev: HashNode<T> | null = null;
    let chainSteps = 0;

    while (current !== null) {
      chainSteps++;
      if (current.key === key) {
        if (prev === null) {
          // Remove head of chain
          this.buckets[bucketIndex] = current.next;
        } else {
          // Unlink node
          prev.next = current.next;
        }
        this.sizeCount--;
        return { deleted: true, bucketIndex, chainSteps };
      }
      prev = current;
      current = current.next;
    }

    return { deleted: false, bucketIndex, chainSteps };
  }

  /**
   * Dynamic resizing and rehashing of all elements
   */
  public resize(newCapacity: number): void {
    const targetCapacity = Math.max(4, newCapacity);
    const oldBuckets = this.buckets;

    this.capacity = targetCapacity;
    this.buckets = new Array(targetCapacity).fill(null);
    this.sizeCount = 0;
    this.rehashCounter++;

    // Rehash every existing element into the new bucket array
    for (const head of oldBuckets) {
      let current = head;
      while (current !== null) {
        const nextNode = current.next;
        current.next = null;

        // Recompute hash index with new capacity
        const { rawHashNumber, bucketIndex } = computePolynomialHash(current.key, this.capacity);
        current.rawHash = rawHashNumber;
        current.bucketIndex = bucketIndex;

        // Insert into new bucket
        if (this.buckets[bucketIndex] === null) {
          this.buckets[bucketIndex] = current;
        } else {
          // Prepend or append to chain
          current.next = this.buckets[bucketIndex];
          this.buckets[bucketIndex] = current;
        }

        this.sizeCount++;
        current = nextNode;
      }
    }
  }

  /**
   * Reset the hash table
   */
  public clear(): void {
    this.capacity = DEFAULT_INITIAL_CAPACITY;
    this.buckets = new Array(this.capacity).fill(null);
    this.sizeCount = 0;
    this.rehashCounter = 0;
  }

  /**
   * Return all stored values
   */
  public getAll(): T[] {
    const values: T[] = [];
    for (const head of this.buckets) {
      let current = head;
      while (current !== null) {
        values.push(current.value);
        current = current.next;
      }
    }
    return values;
  }

  /**
   * Compute comprehensive hash table statistics
   */
  public getStats(): HashTableStats {
    let occupied = 0;
    let collisionBuckets = 0;
    let totalCollisions = 0;
    let maxChain = 0;
    let totalChainLengths = 0;

    for (let i = 0; i < this.capacity; i++) {
      const head = this.buckets[i];
      if (head !== null) {
        occupied++;
        let len = 0;
        let curr: HashNode<T> | null = head;
        while (curr !== null) {
          len++;
          curr = curr.next;
        }
        totalChainLengths += len;
        if (len > maxChain) maxChain = len;
        if (len > 1) {
          collisionBuckets++;
          totalCollisions += (len - 1);
        }
      }
    }

    return {
      capacity: this.capacity,
      size: this.sizeCount,
      loadFactor: Number((this.sizeCount / this.capacity).toFixed(3)),
      occupiedBuckets: occupied,
      emptyBuckets: this.capacity - occupied,
      collisionBucketsCount: collisionBuckets,
      totalCollisions,
      maxChainLength: maxChain,
      averageChainLength: occupied > 0 ? Number((totalChainLengths / occupied).toFixed(2)) : 0,
      rehashCount: this.rehashCounter,
      threshold: this.threshold,
    };
  }

  /**
   * Inspect all buckets for visualization and debugging
   */
  public inspectBuckets(): BucketInspection<T>[] {
    const result: BucketInspection<T>[] = [];

    for (let i = 0; i < this.capacity; i++) {
      const head = this.buckets[i];
      const nodes: Array<{ key: string; value: T; rawHash: number }> = [];
      let current = head;

      while (current !== null) {
        nodes.push({
          key: current.key,
          value: current.value,
          rawHash: current.rawHash,
        });
        current = current.next;
      }

      result.push({
        index: i,
        nodes,
        chainLength: nodes.length,
        isOccupied: nodes.length > 0,
      });
    }

    return result;
  }

  /**
   * Step-by-step lookup trace for educational visualization
   */
  public traceLookup(rawKey: string): {
    found: boolean;
    value?: T;
    computation: HashComputationDetails;
    steps: HashTraceStep[];
    chainTraversed: Array<{ key: string; isMatch: boolean; nodeIndex: number }>;
  } {
    const key = normalizeKey(rawKey);
    const computation = computePolynomialHash(key, this.capacity);
    const steps: HashTraceStep[] = [];
    const chainTraversed: Array<{ key: string; isMatch: boolean; nodeIndex: number }> = [];

    // Step 1: Input & Normalization
    steps.push({
      stepNumber: 1,
      title: 'Normalize Key & ASCII Extraction',
      description: `Input key "${rawKey}" normalized to "${key}". Extracted ASCII character codes.`,
      formula: `ASCII codes: ${computation.terms.map(t => `'${t.char}'=${t.ascii}`).join(', ')}`,
      details: {
        rawKey,
        normalizedKey: key,
        asciiCodes: computation.terms.map(t => ({ char: t.char, ascii: t.ascii })),
      },
    });

    // Step 2: Polynomial Rolling Hash Calculation
    const formulaStr = computation.terms.length <= 4
      ? computation.terms.map(t => `${t.ascii} × 31^${t.pExponent}`).join(' + ')
      : `${computation.terms[0].ascii}×31^0 + ${computation.terms[1].ascii}×31^1 + ... + ${computation.terms[computation.terms.length - 1].ascii}×31^${computation.terms.length - 1}`;

    steps.push({
      stepNumber: 2,
      title: 'Polynomial Hash Summation',
      description: `Compute polynomial sum: h(key) = Σ s[i] · 31^i.`,
      formula: `h = ${formulaStr} = ${computation.rawHashBigInt}`,
      details: {
        primeBase: 31,
        totalRawHash: computation.rawHashBigInt,
        termBreakdown: computation.terms,
      },
    });

    // Step 3: Modulo Table Capacity
    steps.push({
      stepNumber: 3,
      title: 'Modulo Operation (Bucket Mapping)',
      description: `Map the large hash code into valid bucket index range [0, ${this.capacity - 1}] via modulo m=${this.capacity}.`,
      formula: `Bucket Index = ${computation.rawHashBigInt} mod ${this.capacity} = [${computation.bucketIndex}]`,
      details: {
        capacity: this.capacity,
        bucketIndex: computation.bucketIndex,
      },
    });

    // Step 4: Direct Access & Chain Traversal
    const bucket = this.buckets[computation.bucketIndex];
    let found = false;
    let foundValue: T | undefined;

    if (bucket === null) {
      steps.push({
        stepNumber: 4,
        title: 'Direct Bucket Inspection — Empty',
        description: `Direct jump to Bucket [${computation.bucketIndex}]. The bucket is empty (null). Key does not exist.`,
        details: {
          bucketIndex: computation.bucketIndex,
          bucketState: 'empty',
        },
      });
    } else {
      let curr: HashNode<T> | null = bucket;
      let nodeIdx = 0;
      let matchFound = false;

      while (curr !== null) {
        const isMatch = curr.key === key;
        chainTraversed.push({
          key: curr.key,
          isMatch,
          nodeIndex: nodeIdx,
        });

        if (isMatch) {
          matchFound = true;
          found = true;
          foundValue = curr.value;
          break;
        }

        curr = curr.next;
        nodeIdx++;
      }

      steps.push({
        stepNumber: 4,
        title: matchFound ? 'Direct Access & Match Found' : 'Chain Traversal — Key Not in Chain',
        description: matchFound
          ? `Direct jump to Bucket [${computation.bucketIndex}]. Found matching key "${key}" after ${nodeIdx + 1} comparison(s) in separate chain.`
          : `Jumped to Bucket [${computation.bucketIndex}]. Traversed ${chainTraversed.length} collision node(s), but key "${key}" was not found.`,
        formula: matchFound ? `O(1) Direct Lookup Success` : `Chain End Reached`,
        details: {
          bucketIndex: computation.bucketIndex,
          comparisons: chainTraversed.length,
          matchedNodeIndex: matchFound ? nodeIdx : null,
          chainLength: chainTraversed.length,
        },
      });
    }

    return {
      found,
      value: foundValue,
      computation,
      steps,
      chainTraversed,
    };
  }
}
