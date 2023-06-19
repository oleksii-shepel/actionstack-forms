



export const getValue = (obj: any, prop?: string) => {
  if(!prop) { return obj; }
  return prop.split('.').reduce((acc, part) => acc && acc[part], obj);
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
  let noCommentsStr = expression.toString().replace(/\/\*(.|[\r\n])*?\*\//g, '').replace(/\/\/.*/gm, '');
  let str = noCommentsStr.split('=>',).at(1)!.trim();
  return str.substring(str.indexOf('.') + 1, str.length).replace(/\]/g, '').replace(/\[/g, '.');
}



export function findProps(obj: any): string[] {
  var result: string[] = [];
  const findKeys = (obj: any, prefix: string = '') => {
    for (let prop in obj) {
      let sub = obj[prop]
      if(!sub || typeof(sub) !== 'object' || Object.keys(sub).length === 0) {
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



export function deepEqual(x: any, y: any): boolean {
  let equal = false;
  if(x && y && typeof x === 'object' && typeof y === 'object') {
    equal = Object.keys(x).length === Object.keys(y).length;
    if(equal) {
      equal = Object.keys(x).reduce<boolean>((isEqual, key) => isEqual && deepEqual(x[key], y[key]), true)
    }
  } else {
    equal = x === y || x?.valueOf() === y?.valueOf();
  }
  return equal;
}



export const boxed = (value: any) => typeof value === 'object' && !!value && value.valueOf() !== value;
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
