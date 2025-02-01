
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