
export function waitUntil(condition: () => boolean, cancelled = () => false, checkInterval = 100) {
  if(condition()) return Promise.resolve(true);
  if(cancelled()) return Promise.resolve(false);

  return new Promise<boolean>(resolve => {
    const interval = setInterval(() => {
      if (!condition()) return;
      clearInterval(interval);
      if(cancelled()) { resolve(false); }
      else { resolve(true);}
    }, checkInterval);
  });
}


const fnMap = new Map<object, {frameEnd: number; timestamp: number; delay: number; timeout: any}>();



export function sampleTime(fn: any, period: number, cancelled = () => false) {
  function scheduledFn(frameEnd: number, timestamp: number, delay: number): ((...args: any[]) => void) {
    return (...args: any[]) => {
      clearTimeout(fnMap.get(fn)?.timeout);
      if(cancelled()) return;
      const timeout = setTimeout(() => {
        clearTimeout(timeout);
        fnMap.delete(fn);
        if(cancelled()) return;
        return fn(...args);
      }, delay);

      fnMap.set(fn, {frameEnd: frameEnd, timestamp: timestamp, delay: delay, timeout: timeout});
    }
  }

  const timestamp = new Date().getTime();

  if(fnMap.has(fn)) {
    const { frameEnd } = fnMap.get(fn) as any;
    const delay = frameEnd - timestamp;

    if(delay > 0) {
      return scheduledFn(frameEnd, timestamp, delay);
    }
  }

  return scheduledFn(timestamp + period, timestamp, period);
}



