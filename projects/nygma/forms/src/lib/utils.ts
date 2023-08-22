


export const getValue = (obj: any, prop?: string) => {
  if(!prop) { return obj; }
  return prop.split('.').reduce((acc, part) => acc && acc[part], obj);
}



export const setValue = (obj: any, prop: string, val: any): any => {
  if(!prop) { return val; }

  const isArray = (path: string[]) => path.length >= 2 && !isNaN(+path[1]);

  const path = prop.split('.');
  const root = Array.isArray(obj)? [...obj] : {...obj};
  if(path.length === 1) { root[prop] = val; return root; }

  let item = root; let key = path[0];
  while(path.length > 1) {
    item[key] = isArray(path) ? [...(item[key] || [])] : {...item[key]};
    item = item[key];
    path.shift(); key = path[0];
  }
  item[key] = val;
  return root;
}



export function findProps(obj: any): string[] {
  const result: string[] = [];
  if(primitive(obj) || boxed(obj) || Object.keys(obj).length === 0) { return result; }
  const findKeys = (obj: any, prefix = '') => {
    for (const prop in obj) {
      const sub = obj[prop];
      if(primitive(sub) || boxed(sub) || Object.keys(sub).length === 0 || Array.isArray(sub)) {
        result.push(`${prefix}${prop}`)
      }
      else {
        findKeys(sub, `${prefix}${prop}.`);
      }
    }
  }
  findKeys(obj);
  return result;
}




export function deepEqual(x: any, y: any): boolean {
  let equal = false;
  if(x !== null && y !== null && typeof x === 'object' && typeof y === 'object') {
    equal = x === y || x?.valueOf() === y?.valueOf();
    if(!equal) {
      if(x instanceof Map &&  y instanceof Map) {
        equal = x.size === y.size && [...x.entries()].every(([key, value]) => (y.has(key) && deepEqual(y.get(key), value)));
      } else if(x instanceof Set &&  y instanceof Set) {
        equal = x.size === y.size && [...x.entries()].every(([key,]) => y.has(key));
      } else if (Array.isArray(x) && Array.isArray(y)) {
        equal = x.length === y.length && x.reduce<boolean>((isEqual, value, index) => isEqual && deepEqual(value, y[index]), true);
      } else {
        equal = Object.keys(x).length === Object.keys(y).length && Object.keys(x).reduce<boolean>((isEqual, key) => isEqual && deepEqual(x[key], y[key]), true)
      }
    }
  } else {
    equal = x === y;
  }
  return equal;
}



export const boxed = (value: any) => value !== undefined && value !== null && value.valueOf() !== value;
export const primitive = (value: any) => value === undefined || value === null || typeof value !== 'object';



export function deepClone(objectToClone: any) {
  if (primitive(objectToClone)) return objectToClone;

  let obj = undefined;
  if (boxed(objectToClone)) {
    if (objectToClone instanceof Date) { obj = new Date(objectToClone.valueOf()); }
    else { obj = {...objectToClone.constructor(objectToClone.valueOf())}; return obj; }
  }
  else if(objectToClone instanceof Map) { obj = new Map(objectToClone); return obj; }
  else if(objectToClone instanceof Set) { obj = new Set(objectToClone); return obj; }
  else if(Array.isArray(objectToClone)) { obj = [...objectToClone]; }
  else if (typeof objectToClone === 'object') { obj = {...objectToClone}; }

  for (const key in obj) {
    const value = objectToClone[key];
    obj[key] = typeof value === 'object' ? deepClone(value) : value;
  }

  return obj;
}



export function deepFreeze(objectToFreeze: any) {
  if (primitive(objectToFreeze)) return objectToFreeze;

  let obj = undefined;
  if (boxed(objectToFreeze)) {
    if (objectToFreeze instanceof Date) { obj = new Date(objectToFreeze.valueOf()); }
    else { obj = {...objectToFreeze.constructor(objectToFreeze.valueOf())}; }
  }
  else if(objectToFreeze instanceof Map) { obj = new Map(objectToFreeze); }
  else if(objectToFreeze instanceof Set) { obj = new Set(objectToFreeze); }
  else if(Array.isArray(objectToFreeze)) { obj = [...objectToFreeze]; }
  else if (typeof objectToFreeze === 'object') { obj = {...objectToFreeze}; }

  for (const key in obj) {
    const value = objectToFreeze[key];
    obj[key] = typeof value === 'object' ? deepFreeze(value) : value;
  }

  return Object.freeze(obj);
}



export function difference(x: any, y: any) : { added?: any, removed?: any, changed?: any } {
  const diff = {} as any;

  x = x ?? {};
  y = y ?? {};

  const xProps = findProps(x);
  const yProps = findProps(y);

  const intersection = xProps.filter(value => yProps.includes(value));

  if(intersection.length > 0) {
    diff.changed = {};

    for(const prop of intersection) {
      const prevValue = getValue(x, prop);
      const currValue = getValue(y, prop);

      if(!deepEqual(prevValue, currValue)) {
        diff.changed = setValue(diff.changed, prop, currValue);
      }
    }

    if(Object.keys(diff.changed).length === 0) {
      delete diff.changed;
    }
  }

  if (xProps.length > intersection.length) {
    const removed = xProps.filter(x => !intersection.includes(x));
    diff.removed = removed.reduce((obj, prop) => {
      obj = setValue(obj, prop, getValue(x, prop));
      return obj;
    }, {});
  }

  if (yProps.length > intersection.length) {
    const added = yProps.filter(y => !intersection.includes(y));
    diff.added = added.reduce((obj, prop) => {
      obj = setValue(obj, prop, getValue(y, prop));
      return obj;
    }, {});
  }

  return diff;
}
