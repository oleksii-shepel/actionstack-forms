import { BehaviorSubject } from 'rxjs';

export class Queue<T> {
  initialized$ = new BehaviorSubject<any>(false);
  updated$ = new BehaviorSubject<any>(this);
  maxLength = 25;

  public constructor(
      private elements: Record<number, T> = {},
      private head: number = 0,
      private tail: number = 0
  ) { }

  public first(element: T): void {
    if(this.length === 0) {
      this.enqueue(element);
    } else {
      this.elements[this.head] = element;
      this.updated$.next(this);
    }
  }

  public shift(element: T): void {
    if(this.length === this.maxLength) {
      this.dequeue();
      console.warn('Queue is full, dequeuing first element');
    }

    this.head--;
    this.elements[this.head] = element;
    this.updated$.next(this);
  }

  public enqueue(element: T): void {
    if(this.length === this.maxLength) {
      this.dequeue();
      console.warn('Queue is full, dequeuing first element');
    }

    this.elements[this.tail] = element;
    this.tail++;
    this.updated$.next(this);
  }

  public dequeue(): T | undefined {
      if (this.length === 0) {
        return undefined;
      }

      const item = this.elements[this.head];
      delete this.elements[this.head];
      this.head++;

      return item;
  }

  public peek(): T | undefined {
    if (this.length === 0) {
      return undefined;
    }

    return this.elements[this.head];
  }

  public clear(): void {
    this.elements = {};
    this.head = 0;
    this.tail = 0;
  }

  public get length(): number {
      return this.tail - this.head;
  }

  public get isEmpty(): boolean {
      return this.length === 0;
  }
}
