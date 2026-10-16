export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  group: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  isSample?: boolean;
}

export interface HashNode<T> {
  key: string;
  value: T;
  rawHash: number;
  bucketIndex: number;
  next: HashNode<T> | null;
}

export interface BucketInspection<T = any> {
  index: number;
  nodes: Array<{
    key: string;
    value: T;
    rawHash: number;
  }>;
  chainLength: number;
  isOccupied: boolean;
}

export interface HashTableStats {
  capacity: number;
  size: number;
  loadFactor: number;
  occupiedBuckets: number;
  emptyBuckets: number;
  collisionBucketsCount: number; // buckets with chainLength > 1
  totalCollisions: number; // total overflow nodes beyond the head
  maxChainLength: number;
  averageChainLength: number;
  rehashCount: number;
  threshold: number; // 0.75
}

export interface CharComputation {
  index: number;
  char: string;
  ascii: number;
  pExponent: number;
  pFactor: string; // string representation of 31^i
  termValue: string; // s[i] * 31^i
}

export interface HashComputationDetails {
  key: string;
  capacity: number;
  p: number; // 31
  terms: CharComputation[];
  rawHashBigInt: string;
  rawHashNumber: number;
  bucketIndex: number;
}

export interface HashTraceStep {
  stepNumber: number;
  title: string;
  description: string;
  formula?: string;
  details: Record<string, any>;
}

export interface BenchmarkResult {
  methodName: string;
  algorithmType: 'Linear Search (Array)' | 'Binary Search Tree (BST)' | 'Custom Hash Table (O(1))';
  theoreticalComplexity: string;
  datasetSize: number;
  searchCount: number;
  totalTimeMs: number;
  averageTimeUs: number; // microseconds
  medianTimeUs: number;
  minTimeUs: number;
  maxTimeUs: number;
  averageComparisons: number;
  latencyReductionPercent?: number; // relative to linear search
}
