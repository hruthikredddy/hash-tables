export class BSTNode<T> {
  public key: string;
  public value: T;
  public left: BSTNode<T> | null;
  public right: BSTNode<T> | null;

  constructor(key: string, value: T) {
    this.key = key;
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

export class BinarySearchTree<T = any> {
  private root: BSTNode<T> | null = null;
  private nodeCount = 0;

  public insert(key: string, value: T): void {
    const newNode = new BSTNode(key, value);
    if (this.root === null) {
      this.root = newNode;
      this.nodeCount++;
      return;
    }

    let current = this.root;
    while (true) {
      if (key === current.key) {
        current.value = value;
        return;
      } else if (key < current.key) {
        if (current.left === null) {
          current.left = newNode;
          this.nodeCount++;
          return;
        }
        current = current.left;
      } else {
        if (current.right === null) {
          current.right = newNode;
          this.nodeCount++;
          return;
        }
        current = current.right;
      }
    }
  }

  public search(key: string): { found: boolean; value?: T; comparisons: number } {
    let current = this.root;
    let comparisons = 0;

    while (current !== null) {
      comparisons++;
      if (key === current.key) {
        return { found: true, value: current.value, comparisons };
      } else if (key < current.key) {
        current = current.left;
      } else {
        current = current.right;
      }
    }

    return { found: false, comparisons };
  }

  public size(): number {
    return this.nodeCount;
  }

  public clear(): void {
    this.root = null;
    this.nodeCount = 0;
  }
}
