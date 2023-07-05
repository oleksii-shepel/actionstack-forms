


export const scheduledFnMap = new Map<object, {endTime: number; lastCall: number; delay: number; timeout: any}>();



export function debounce(fn: any, time: number) {
  function scheduledFn(endTime: number, lastCall: number, delay: number): ((...args: any[]) => void) {
    return (...args: any[]) => {
      clearTimeout(scheduledFnMap.get(fn)?.timeout);
      const timeout = setTimeout(() => {
        clearTimeout(timeout);
        scheduledFnMap.delete(fn);
        return fn(...args);
      }, delay);

      scheduledFnMap.set(fn, {endTime: endTime, lastCall: lastCall, delay: delay, timeout: timeout});
    }
  }

  if(scheduledFnMap.has(fn)) {
    const {endTime, timeout} = scheduledFnMap.get(fn) as any;
    const lastCall = new Date().getTime();
    const delay = endTime - lastCall;

    if(delay > 0) {
      return scheduledFn(endTime, lastCall, delay);
    } else {
      return scheduledFn(new Date().getTime() + time, new Date().getTime(), time);
    }
  } else {
   return scheduledFn(new Date().getTime() + time, new Date().getTime(), time);
  }
}



