import { EventEmitter } from '@angular/core';
import { AbstractControl, AbstractControlOptions, FormArray, FormBuilder, FormControl, FormControlStatus, FormGroup, NgControl, NgForm, NgModel } from '@angular/forms';

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

export function buildForm<T>(model: T, options: ModelOptions<T> = {}): AbstractControl {
  if (!model) return fb.control(name, (options || {}) as AbstractControlOptions);

  let obj = Array.isArray(model) ? fb.array([], options as AbstractControlOptions) :
    typeof model === 'object' ? fb.group({}, (options["__group"] || options) as AbstractControlOptions) :
    fb.control(name, (options || {}) as AbstractControlOptions);

  for (const key in model) {
    let value = model[key];
    let control = Array.isArray(value) ? buildForm(value, (options as any)[`__array_${key}`] || {}) :
    typeof value === 'object' ? buildForm(value, (options as any)[key] || {}) :
    fb.control(value, (options[key] || {}) as AbstractControlOptions);

    if(obj instanceof FormGroup){
      (obj as FormGroup).addControl(key, control);
    } else if(obj instanceof FormArray) {
      (obj as FormArray).push(control);
    }

  }

  return obj;
}

export function checkForm<T>(form: any, model: T): boolean {
  if (!form || !form.controls) return false;

  let ready = true;

  for (const key in model) {
    let value = model[key];
    let control = form.controls[key];
    ready = Array.isArray(value) ? Array.isArray(control?.controls) && control.controls.every((item: any, index: number) => {
      return !(item instanceof FormControl) ? checkForm(item, (value as any)[index]) : true;
    }) : !(control instanceof FormControl) ? checkForm(control, value) : !!control;

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

export function deepEqual(x: any, y: any): boolean {
  return (x && y && typeof x === 'object' && typeof y === 'object') ?
    (Object.keys(x).length === Object.keys(y).length) &&
      Object.keys(x).reduce((isEqual, key) => isEqual && deepEqual(x[key], y[key]), true) : (x === y);
}
