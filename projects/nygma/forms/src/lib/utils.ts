


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
};


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
