



export const getValue = (obj: any, prop: string) => prop.split('.').reduce((acc, part) => acc && acc[part], obj);



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
  return (x && y && typeof x === 'object' && typeof y === 'object') ?
    (Object.keys(x).length === Object.keys(y).length) &&
      Object.keys(x).reduce<boolean>((isEqual, key) => isEqual && deepEqual(x[key], y[key]), true) : (x === y);
}



export function deepClone(objectToClone: any) {
  if (!objectToClone) return objectToClone;

  let obj = Array.isArray(objectToClone) ? [] : typeof objectToClone === 'object' ? {} : objectToClone;

  for (const key in objectToClone) {
    let value = objectToClone[key];
    (obj as any)[key] = (typeof value === "object") ? deepClone(value) : value;
  }

  return obj;
}



export function deepCloneJSON(objectToClone: any) {
  if (!objectToClone) return objectToClone;
  return JSON.parse(JSON.stringify(objectToClone));
}
