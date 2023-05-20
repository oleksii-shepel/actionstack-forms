import { AbstractControl, AbstractControlOptions, FormBuilder } from '@angular/forms';

export type ArrayToObject<T extends any[]> = {
  [key in keyof T as string]: T[key];
}

export type Extract<T, V> = { [key in keyof T]: T[key] extends V ? key : never }[keyof T]
export type SubType<Base, Condition> = Pick<Base, Extract<Base, Condition>>;

export type ModelOptions<T> = {
  [key in keyof Partial<T>]? : T[key] extends Array<any> ? ModelOptions<T[key]> : T[key] extends object ? ModelOptions<T[key]> : AbstractControlOptions;
} & {
  ["__group"]?: T extends object ? AbstractControlOptions : never;
} & {
  [key in keyof SubType<T, Array<any>> as key extends string ? `__array_${key}` : never]?: AbstractControlOptions;
};

export const fb = new FormBuilder();

export function buildForm<T>(model: T, options: ModelOptions<T> = {}, name: string =''): AbstractControl {
  if (!model) return fb.control(name, (options || {}) as AbstractControlOptions);

  let obj = Array.isArray(model) ? fb.array([], options as AbstractControlOptions) :
    typeof model === 'object' ? fb.group({}, (options["__group"] || options) as AbstractControlOptions) :
    fb.control(name, (options || {}) as AbstractControlOptions);

  for (const key in model) {
    let value = model[key];
    let control = Array.isArray(value) ? buildForm(value, (options as any)[`__array_${key}`] || {}, key) :
    typeof value === 'object' ? buildForm(value, (options as any)[key] || {}, key) :
    fb.control(value, (options[key] || {}) as AbstractControlOptions);

    (obj as any).controls[key] = control;
  }

  obj.updateValueAndValidity();
  return obj;
}

export function checkForm<T>(form: any, model: T): boolean {
  if (!form || !form.controls) return false;

  let ready = false;

  for (const key in model) {
    let control = form.controls[key];
    ready = control ? !!control : Array.isArray(model[key]) ?
     Array.isArray(control) && control.every((item: any, index: number) => {
      return (typeof item === "object") ? checkForm(item, (model[key] as any)[index]) : true;
    }) : (typeof model[key] === "object") ? checkForm(control, model[key]) : true;

    if(ready === false) break;
  }

  return ready;
}

export function deepCloneJSON(objectToClone: any) {
  if (!objectToClone) return objectToClone;
  return JSON.parse(JSON.stringify(objectToClone));
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

export function patchValue(form: any, model: any, options: any = {}) {
  if(!form || !form.controls || !model) {
    return;
  }

  for (const key in form.controls) {
    let value = model[key];
    form.controls[key].value = (typeof value === "object") ? patchValue(form.controls[key], model[key]) : model[key];
  }

  return model;
}

export function deepEqual(x: any, y: any): boolean {
  return (x && y && typeof x === 'object' && typeof y === 'object') ?
    (Object.keys(x).length === Object.keys(y).length) &&
      Object.keys(x).reduce((isEqual, key) => isEqual && deepEqual(x[key], y[key]), true) : (x === y);
}
