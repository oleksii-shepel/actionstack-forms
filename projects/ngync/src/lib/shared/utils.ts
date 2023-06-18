



export const getValue = (obj: any, prop: string) => {
  return prop.split('.').reduce((acc, part) => {
    if (acc !== undefined && acc !== null && acc[part] !== undefined && acc[part] !== null) {
      return acc[part];
    } else { return undefined; }
  }, obj);
}



export const setValue = (obj: any, prop: string, val: any) => {
  const split = prop.split('.');
  const isArray = (split: string[]) => split.length >= 2 && !isNaN(+split[1]);
  const isObject = (split: string[]) => split.length > 1 || isArray(split);

  if(split.length === 0) { obj = val; return obj; }
  else {
    let root = Array.isArray(obj)? [...obj]: {...obj};
    let item = root;
    while(split.length >= 1) {
      const key = split.at(0)!;
      item[key] = isArray(split) ? [...(item[key] || [])] : isObject(split) ? {...item[key]} : val;

      item = item[key];
      split.shift()
    }

    return root;
  }
};



export const iterable = (obj: any) => {
  return { [Symbol.iterator]: function* () {
    if(Array.isArray(obj)) { for(let element of obj) { yield element; } }
    else { for(let element of Object.keys(obj).sort()) { yield obj[element]; } }
  }}
}



export function prop<T extends object>(expression: (x: { [prop in keyof T]: T[prop] }) => any) {
  let str = expression.toString().split('=>',).at(1)!.trim();
  return str.substring(str.indexOf('.') + 1, str.length).replace(/\]/g, '').replace(/\[/g, '.');
}



export function findProps(obj: any): string[] {
  var result: string[] = [];
  const findKeys = (obj: any, prefix: string = '') => {
    for (let prop in obj) {
      let sub = obj[prop]
      if(typeof(sub) !== 'object') {
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



export function unassign(target: any, source: any[]) {
  for(let prop in source) {
    delete target[prop];

  }
  return target;
}



export function reset(target: any, source: any[]): any {
  for(let prop of findProps(source)) {
    let value = getValue(source, prop);
    if(typeof value === 'string') {
      target = setValue(target, prop, '');
    } else if (typeof value === 'number') {
      target = setValue(target, prop, 0);
    } else if (typeof value === 'boolean') {
      target = setValue(target, prop, false);
    }
  }
  return target;
}



export function deepEqual(x: any, y: any): boolean {
  let equal = false;
  if(x && y && typeof x === 'object' && typeof y === 'object') {
    equal = Object.keys(x).length === Object.keys(y).length;
    if(equal) {
      equal = Object.keys(x).reduce<boolean>((isEqual, key) => isEqual && deepEqual(x[key], y[key]), true)
    }
  } else {
    equal = x.valueOf() === y.valueOf();
  }
  return equal;
}



export const boxed = (value: any) => typeof value === 'object' && value.valueOf;
export const primitive = (value: any) => typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || typeof value === 'symbol' || typeof value === 'bigint' || typeof value === 'undefined' || value === null;



export function deepClone(objectToClone: any) {
  if (!objectToClone) return objectToClone;

  let obj = undefined;
  if(Array.isArray(objectToClone)) { obj = []; }
  else if (boxed(objectToClone)) {
    if (objectToClone instanceof Date) { obj = new Date(objectToClone.valueOf()); }
    else { obj = {...objectToClone.constructor(objectToClone.valueOf())}; }
  }
  else if(typeof objectToClone === 'object') {
    obj = {};
  } else {
    obj = objectToClone;
  }

  if(objectToClone && typeof objectToClone !== 'string') {
    for (const key in objectToClone) {
      let value = objectToClone[key];
      obj[key] = typeof value === 'object' ? deepClone(value) : value;
    }
  }

  return obj;
}



export function deepCloneJSON(objectToClone: any) {
  if (!objectToClone) return objectToClone;
  return JSON.parse(JSON.stringify(objectToClone));
}



export function intersection(x: any, y: any) {
  return Object.keys(x).reduce((result, key) => {
    if (key in y) {
      result[key] = x[key];
    }
    return result;
  }, {} as any);
}
