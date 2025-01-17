

export class CircularBuffer<T> {
  private readonly buffer: T[];
  private head = 0;
  private tail = 0;
  private size = 0;

  constructor(private readonly capacity: number) {
    this.buffer = new Array(capacity);
  }

  push(item: T): void {
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;
    
    if (this.size < this.capacity) {
      this.size++;
    } else {
      this.head = (this.head + 1) % this.capacity;
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    let current = this.head;
    let count = 0;
    
    while (count < this.size) {
      yield this.buffer[current];
      current = (current + 1) % this.capacity;
      count++;
    }
  }
}

export class CircularBuffer<T> {
  private readonly buffer: T[];
  private head = 0;
  private tail = 0;
  private size = 0;

  constructor(capacity: number) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new Error('Capacity must be a positive integer');
    }
    this.buffer = new Array(capacity);
  }

  push(item: T): void {
    if (item === undefined || item === null) {
      throw new Error('Cannot push undefined or null items');
    }
  }
}