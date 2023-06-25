import { Queue } from '../lib/shared/queue';

describe('Queue', () => {
  it('should enqueue and dequeue', () => {
    let queue = new Queue<string>();
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
    let queue = new Queue<string>();
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
    let queue = new Queue<string>();
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
});
