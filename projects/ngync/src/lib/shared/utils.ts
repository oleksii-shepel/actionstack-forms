


export const getValue = (obj: any, prop?: string) => {
  if(!prop) { return obj; }
  return prop.split('.').reduce((acc, part) => acc && acc[part], obj);
}



export const setValue = (obj: any, prop: string, val: any): any => {
  const split = prop.split('.');
  const isArray = (split: string[]) => split.length >= 2 && !isNaN(+split[1]);
  const isObject = (split: string[]) => split.length > 1 || isArray(split);

  let root = Array.isArray(obj)? [...obj]: {...obj};
  let item = root;
  while(split.length >= 1) {
    const key = split[0];
    item[key] = isArray(split) ? [...(item[key] || [])] : isObject(split) ? {...item[key]} : val;

    item = item[key];
    split.shift()
  }

  return root;
};



export const iterable = (obj: any) => {
  return { [Symbol.iterator]: function* () {
    if(Array.isArray(obj)) { for(let element of obj) { yield element; } }
    else if(!primitive(obj) && typeof obj[Symbol.iterator] === 'function') { for(let element of Array.from(obj).sort()) { yield element; } }
    else if(!!obj && typeof obj === 'object') { for(let element of Object.keys(obj).sort()) { yield obj[element]; } }
  }}
}



export function prop<T extends object>(expression: (x: { [prop in keyof T]: T[prop] }) => any) {
  let noCommentsStr = expression.toString().replace(/\/\*(.|[\r\n])*?\*\//g, '').replace(/\/\/.*/gm, '');
  let split = noCommentsStr.split('=>');
  if(split && split.length == 2) {
    let str = noCommentsStr.split('=>')[1].trim();
    return str.substring(str.indexOf('.') + 1, str.length).replace(/\]/g, '').replace(/\[/g, '.');
  } else {
    throw new Error('Invalid expression');
  }
}



export function findProps(obj: any): string[] {
  var result: string[] = [];
  if(primitive(obj) || boxed(obj) || Object.keys(obj).length === 0) { return result; }
  const findKeys = (obj: any, prefix: string = '') => {
    for (let prop in obj) {
      let sub = obj[prop];
      if(primitive(sub) || boxed(sub) || Object.keys(sub).length === 0) {
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
  if(x && y && typeof x === 'object' && typeof y === 'object') {
    equal = x === y;
    if(!equal) {
      if(x instanceof Map &&  y instanceof Map) {
        equal = x.size === y.size && [...x.entries()].every(([key, value]) => (y.has(key) && deepEqual(y.get(key), value)));
      } else if(x instanceof Set &&  y instanceof Set) {
        equal = x.size === y.size && [...x.entries()].every(([key, value]) => y.has(key));
      } else {
        equal = Object.keys(x).length === Object.keys(y).length && Object.keys(x).reduce<boolean>((isEqual, key) => isEqual && deepEqual(x[key], y[key]), true)
      }
    }
  } else {
    equal = x === y || x?.valueOf() === y?.valueOf();
  }
  return equal;
}



export const boxed = (value: any) => !!value && value.valueOf() !== value;
export const primitive = (value: any) => typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || typeof value === 'symbol' || typeof value === 'bigint' || typeof value === 'undefined' || value === null;



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
    let value = objectToClone[key];
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
  let diff = {} as Difference;

  x = x ?? {};
  y = y ?? {};

  let xProps = findProps(x);
  let yProps = findProps(y);

  let xIntersection = xProps.filter(value => yProps.includes(value));
  let yIntersection = yProps.filter(value => xProps.includes(value));

  if(yIntersection.length === xIntersection.length && yIntersection.length > 0) {
    diff.changed = {};

    for(let prop of yIntersection) {
      let prevValue = getValue(x, prop);
      let currValue = getValue(y, prop);
      if(prevValue !== currValue) {
        diff.changed = setValue(diff.changed, prop, currValue);
      }
    }

    if(Object.keys(diff.changed).length === 0) {
      delete diff.changed;
    }
  }

  if (xProps.length > xIntersection.length) {
    let removed = xProps.filter(x => !xIntersection.includes(x));
    diff.removed = removed.reduce((obj, prop) => {
      obj = setValue(obj, prop, getValue(x, prop));
      return obj;
    }, {});
  }

  if (yProps.length > yIntersection.length) {
    let added = yProps.filter(y => !yIntersection.includes(y));
    diff.added = added.reduce((obj, prop) => {
      obj = setValue(obj, prop, getValue(y, prop));
      return obj;
    }, {});
  }

  return diff;
}
