


export const getValue = (obj: any, prop?: string) => {
  if(!prop) { return obj; }
  return prop.split('.').reduce((acc, part) => acc && acc[part], obj);
}



export const setValue = (obj: any, prop: string, val: any): any => {
  const split = prop.split('.');
  const isArray = (split: string[]) => split.length >= 2 && !isNaN(+split[1]);
  const isObject = (split: string[]) => split.length > 1 || isArray(split);

  const root = Array.isArray(obj)? obj : {...obj};
  let item = root;
  while(split.length >= 1) {
    const key = split[0];
    item[key] = isArray(split) ? item[key] || [] : isObject(split) ? {...item[key]} : val;

    item = item[key];
    split.shift()
  }

  return root;
};



export const iterable = (obj: any) => {
  return { [Symbol.iterator]: function* () {
    if(Array.isArray(obj)) { for(const element of obj) { yield element; } }
    else if(!primitive(obj) && typeof obj[Symbol.iterator] === 'function') { for(const element of Array.from(obj).sort()) { yield element; } }
    else if(!!obj && typeof obj === 'object') { for(const element of Object.keys(obj).sort()) { yield obj[element]; } }
  }}
}



export function prop<T extends object>(expression: (x: { [prop in keyof T]: T[prop] }) => any) {
  const noCommentsStr = expression.toString().replace(/\/\*(.|[\r\n])*?\*\//g, '').replace(/\/\/.*/gm, '');
  const split = noCommentsStr.split('=>');
  if(split && split.length == 2) {
    const str = noCommentsStr.split('=>')[1].trim();
    return str.substring(str.indexOf('.') + 1, str.length).replace(/\]/g, '').replace(/\[/g, '.');
  } else {
    throw new Error('Invalid expression');
  }
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



export function deepCloneJSON(objectToClone: any) {
  if (!objectToClone) return objectToClone;
  return JSON.parse(JSON.stringify(objectToClone));
}



export function intersection(x: any, y: any) {
  return Object.keys(x || {}).reduce((result, key) => {
    if (key in (y || {})) {
      result[key] = x[key];
    }
    return result;
  }, {} as any);
}


export interface Difference {
  added?: any;
  removed?: any;
  changed?: any;
}



export function difference(x: any, y: any) : Difference {
  const diff = {} as Difference;

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



export function reset(target: any, source?: any): any {
  if(!source) { source = target; }
  const date = new Date();
  for(const prop of findProps(source)) {

    const value = getValue(source, prop);
    if(typeof value === 'string') {
      target = setValue(target, prop, '');
    } else if (typeof value === 'number') {
      target = setValue(target, prop, 0);
    } else if (typeof value === 'boolean') {
      target = setValue(target, prop, false);
    } else if (typeof value === 'bigint') {
      target = setValue(target, prop, BigInt(0));
    } else if(Array.isArray(value)) {
      target = setValue(target, prop, []);
    } else if(value instanceof Date) {
      target = setValue(target, prop, date);
    } else if(typeof value === 'object') {
      target = setValue(target, prop, new value.constructor());
    }
  }
  return target;
}
