export class CircularBuffer<T> {
  private readonly buffer: T[];
  private head = 0;
  private tail = 0;
  private count = 0;

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
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.buffer.length;

    if (this.count < this.buffer.length) {
      this.count++;
    } else {
      // Overwriting oldest element, move head forward
      this.head = (this.head + 1) % this.buffer.length;
    }
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this.count) {
      return undefined;
    }
    return this.buffer[(this.head + index) % this.buffer.length];
  }

  peekLast(): T | undefined {
    if (this.count === 0) return undefined;
    return this.buffer[(this.tail - 1 + this.buffer.length) % this.buffer.length];
  }

  get length(): number {
    return this.count;
  }
}
