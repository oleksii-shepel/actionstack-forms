import { Queue } from '../lib/ng-forms/queue';

describe('Queue', () => {
  it('should enqueue and dequeue', () => {
    const queue = new Queue<string>();
    queue.enqueue('a');
    queue.enqueue('b');
    queue.enqueue('c');
    expect(queue.length).toBe(3);
    let first = queue.peek();
    expect(queue.dequeue()).toEqual(first);
    expect(first).toBe('a');
    first = queue.peek();
    expect(queue.dequeue()).toEqual(first);
    expect(first).toBe('b');
    first = queue.peek();
    expect(queue.dequeue()).toEqual(first);
    expect(first).toBe('c');
    expect(queue.length).toBe(0);
  })

  it('should dequeue in order after dequeue', () => {
    const queue = new Queue<string>();
    expect(queue.isEmpty).toBe(true);
    queue.enqueue('a');
    queue.enqueue('b');
    queue.enqueue('c');
    queue.dequeue();
    queue.dequeue();
    queue.dequeue();
    queue.enqueue('d');
    expect(queue.dequeue()).toBe('d');
    expect(queue.length).toBe(0);
    expect(queue.isEmpty).toBe(true);
  });

  it('should dequeue in order after dequeue and enqueue', () => {
    const queue = new Queue<string>();
    queue.enqueue('a');
    queue.enqueue('b');
    queue.enqueue('c');
    queue.dequeue();
    queue.dequeue();
    queue.dequeue();
    queue.enqueue('d');
    queue.enqueue('e');
    expect(queue.dequeue()).toBe('d');
    expect(queue.dequeue()).toBe('e');
  });

  it('should update first element', () => {
    const queue = new Queue<string>();
    queue.enqueue('a');
    queue.enqueue('b');
    queue.enqueue('c');
    queue.first('d');

    expect(queue.peek()).toBe('d');
    expect(queue.dequeue()).toBe('d');
    expect(queue.dequeue()).toBe('b');
    expect(queue.dequeue()).toBe('c');

    queue.first('a');
    expect(queue.dequeue()).toBe('a');
  })
});
