import { sampleTime } from '../lib/timers';

describe('timers', () => {
  it('should debounce function calls', () => {
    jest.useFakeTimers();

    const func = jest.fn();
    const debounced = sampleTime(func, 1000);

    debounced('a');
    debounced('b');
    debounced('c');

    expect(func).not.toBeCalled();

    jest.advanceTimersByTime(3000);
    expect(func).toBeCalledWith('c');
    expect(func).toBeCalledTimes(1);
  })

  it('should debounce function calls with arguments', () => {
    jest.useFakeTimers();

    const func = jest.fn();
    const debounced = sampleTime(func, 1000);

    debounced('a', 'b', 'c');

    expect(func).not.toBeCalled();

    jest.advanceTimersByTime(3000);
    expect(func).toBeCalledWith('a', 'b', 'c');
    expect(func).toBeCalledTimes(1);
  });

  it('should debounce function if called multiple times', () => {
    jest.useFakeTimers();

    const func = jest.fn();

    sampleTime(func, 1000)('a', 'b', 'c');
    sampleTime(func, 1000)('a', 'b', 'c');
    sampleTime(func, 1000)('a', 'b', 'c');

    expect(func).not.toBeCalled();

    jest.advanceTimersByTime(3000);
    expect(func).toBeCalledWith('a', 'b', 'c');
    expect(func).toBeCalledTimes(1);
  });
});
