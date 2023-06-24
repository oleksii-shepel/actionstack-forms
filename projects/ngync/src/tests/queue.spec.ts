import { Queue } from '../lib/shared/queue';

describe('Queue', () => {
  it('should enqueue and dequeue', () => {
    let queue = new Queue<string>();
    queue.enqueue('a');
    queue.enqueue('b');
    queue.enqueue('c');
    expect(queue.dequeue()).toBe('a');
    expect(queue.dequeue()).toBe('b');
    expect(queue.dequeue()).toBe('c');
  })

  it('should dequeue in order', () => {
    let queue = new Queue<string>();
    queue.enqueue('a');
    queue.enqueue('b');
    queue.enqueue('c');
    expect(queue.dequeue()).toBe('a');
    expect(queue.dequeue()).toBe('b');
    expect(queue.dequeue()).toBe('c');
  });

  it('should dequeue in order after enqueue', () => {
    let queue = new Queue<string>();
    queue.enqueue('a');
    queue.enqueue('b');
    queue.enqueue('c');
    queue.enqueue('d');
    expect(queue.dequeue()).toBe('a');
    expect(queue.dequeue()).toBe('b');
    expect(queue.dequeue()).toBe('c');
    expect(queue.dequeue()).toBe('d');
  });

  it('should dequeue in order after dequeue', () => {
    let queue = new Queue<string>();
    queue.enqueue('a');
    queue.enqueue('b');
    queue.enqueue('c');
    queue.dequeue();
    queue.dequeue();
    queue.dequeue();
    queue.enqueue('d');
    expect(queue.dequeue()).toBe('d');
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
