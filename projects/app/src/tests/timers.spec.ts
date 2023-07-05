import { debounce, scheduledFnMap } from '../../../app/src/app/utils/timers';

describe('timers', () => {
  it('should debounce function calls', () => {
    jest.useFakeTimers();

    const func = jest.fn();
    const debounced = debounce(func, 1000);

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
    const debounced = debounce(func, 1000);

    debounced('a', 'b', 'c');

    expect(func).not.toBeCalled();

    jest.advanceTimersByTime(3000);
    expect(func).toBeCalledWith('a', 'b', 'c');
    expect(func).toBeCalledTimes(1);
  });

  it('should debounce function if called multiple times', () => {
    jest.useFakeTimers();

    const func = jest.fn();
    scheduledFnMap.set(func, {endTime: new Date().getTime() + 1000, lastCall: new Date().getTime(), delay: 1000, timeout: null});

    debounce(func, 1000)('a', 'b', 'c');
    debounce(func, 1000)('a', 'b', 'c');
    debounce(func, 1000)('a', 'b', 'c');

    expect(func).not.toBeCalled();

    jest.advanceTimersByTime(3000);
    expect(func).toBeCalledWith('a', 'b', 'c');
    expect(func).toBeCalledTimes(1);
  });
});
