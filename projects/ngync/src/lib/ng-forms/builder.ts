import { AbstractControl, AbstractControlOptions, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { primitive } from './utils';


/**
 * ArrayToObject
 *
 * @description
 * A type that represents an array as an array object.
 */
export type ArrayToObject<T extends any[]> = {
  [key in keyof T as string]?: T[key];
}


/**
 * FormOptions
 *
 * @description
 * A type that represents the AbstractControlOptions for each control within the form.
 * Options for compound controls (i.e. FormGroup, FormArray) are represented by the __group property.
 *
 * @example
 * const model = {
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   email: '',
 *   address: {
 *     street: '123 Main St.',
 *     city: 'Anytown',
 *     state: 'CA',
 *     zip: '',
 *   },
 *   aliases: ['Johny', 'Johnny'],
 * };
 *
 * const modelOptions: FormOptions<typeof model> = {
 *   __group: {},
 *   firstName: {validators: Validators.required},
 *   lastName: {validators: Validators.required},
 *   email: {validators: Validators.email},
 *   address: {
 *     __group: {},
 *     street: {validators: Validators.required},
 *     city: {validators: Validators.required},
 *     state: {validators: Validators.required},
 *     zip: {validators: Validators.required},
 *   },
 *   aliases: {
 *     __group: {},
 *     '0': {validators: Validators.required},
 *     '1': {validators: Validators.required},
 *   },
 * };
 */
export type FormOptions<T> = T extends Array<infer U> ? ArrayToObject<FormOptions<U>[]> & {
  ["__group"]?: T extends object ? AbstractControlOptions : never;
} : T extends object ? {
  [key in keyof Partial<T>]? : FormOptions<T[key]>;
} & {
  ["__group"]?: AbstractControlOptions;
} : AbstractControlOptions;




export const fb = new FormBuilder();



export function buildForm<T>(model: T, options: FormOptions<T> = {} as any): AbstractControl {
  if (primitive(model)) return fb.control(model, options as AbstractControlOptions);

  const obj = Array.isArray(model) ? fb.array([], ((options as any)["__group"] || {}) as AbstractControlOptions) :
    typeof model === 'object' ? fb.group({}, ((options as any)["__group"] || {}) as AbstractControlOptions) :
    fb.control(model, options as AbstractControlOptions);

  if(typeof obj !== 'string') {
    for (const key in model) {
      const value = model[key];
      const control = Array.isArray(value) ? buildForm(value, (options as any)[key] || {}) :
      typeof value === 'object' ? buildForm(value, (options as any)[key] || {}) :
      fb.control(value, ((options as any)[key] || {}) as AbstractControlOptions);

      if(obj instanceof FormGroup){
        (obj as FormGroup).addControl(key, control);
      } else if(obj instanceof FormArray) {
        (obj as FormArray).push(control);
      }
    }
  }

  return obj;
}
