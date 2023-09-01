import { deepEqual, findProps, getValue, setValue } from "nygma-forms";



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
