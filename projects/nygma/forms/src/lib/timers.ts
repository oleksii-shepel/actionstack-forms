
export function waitUntil(condition: any, checkInterval = 100) {
  if(condition()) return Promise.resolve();

  return new Promise<void>(resolve => {
    const interval = setInterval(() => {
      if (!condition()) return;
      clearInterval(interval);
      resolve();
    }, checkInterval);
  });
}


export const scheduledFnMap = new Map<object, {frameEnd: number; timestamp: number; delay: number; timeout: any}>();



export function sampleTime(fn: any, period: number) {
  function scheduledFn(frameEnd: number, timestamp: number, delay: number): ((...args: any[]) => void) {
    return (...args: any[]) => {
      clearTimeout(scheduledFnMap.get(fn)?.timeout);
      const timeout = setTimeout(() => {
        clearTimeout(timeout);
        scheduledFnMap.delete(fn);
        return fn(...args);
      }, delay);

      scheduledFnMap.set(fn, {frameEnd: frameEnd, timestamp: timestamp, delay: delay, timeout: timeout});
    }
  }

  const timestamp = new Date().getTime();

  if(scheduledFnMap.has(fn)) {
    const { frameEnd } = scheduledFnMap.get(fn) as any;
    const delay = frameEnd - timestamp;

    if(delay > 0) {
      return scheduledFn(frameEnd, timestamp, delay);
    }
  }

  return scheduledFn(timestamp + period, timestamp, period);
}



