



export const getValue = (obj: any, prop: string) => prop.split('.').reduce((acc, part) => acc && acc[part], obj);



export const setValue = (obj: any, prop: string, val: any) => {
  const split = prop.split('.');
  const isArray = (split: string[]) => split.length >= 2 && !isNaN(+split[1]);
  const isObject = (split: string[]) => split.length > 1 || isArray(split);

  if(split.length === 0) { obj = val; return obj; }
  else {
    let root = {...obj};
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
    for(let element in obj) { yield element; }
  }}
}



export function prop<T extends object>(expression: (x: { [prop in keyof T]: T[prop] }) => any) {
  let str = expression.toString().split('=>',).at(1)!.trim();
  return str.substring(str.indexOf('.') + 1, str.length);
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
        findKeys(sub, `${prop}.`);
      }
    }
  }
  findKeys(obj);
  return result;
}



export function deepEqual(x: any, y: any): boolean {
  return (x && y && typeof x === 'object' && typeof y === 'object') ?
    (Object.keys(x).length === Object.keys(y).length) &&
      Object.keys(x).reduce((isEqual, key) => isEqual && deepEqual(x[key], y[key]), true) : (x === y);
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
