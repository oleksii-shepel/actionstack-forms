import { AbstractControl, AbstractControlOptions, FormArray, FormBuilder } from '@angular/forms';

export type Extract<T, V> = { [K in keyof T]: T[K] extends V ? K : never };

export type ModelOptions<T> = {
  [key in keyof Partial<T>]? : T[key] extends Array<any> ? Array<AbstractControlOptions> : T[key] extends object ? ModelOptions<T[key]> : AbstractControlOptions;
} & {
  ["__group"]?: T extends object ? ModelOptions<T> : never;
} & {
  [K in keyof Extract<T, Array<any>> as K extends string ? `__array_${K}` : never]?: T[K];
}

const formBuilder = new FormBuilder();

export function buildFormArray(model: any, options: any = {}, arrayOptions: AbstractControlOptions): AbstractControl {
  if(Array.isArray(model)) {
    let formControls: AbstractControl[] = [];
    model.forEach((item, index) => {
      if(typeof item === 'object')
      formControls.push(buildFormGroup(item, options[index] || {}))
    });

    return formBuilder.array(formControls, arrayOptions)
  }
  else {
    return formBuilder.control("", []);
  }
}

export function buildFormGroup(model: any, options: any = {}): AbstractControl {
  if(Array.isArray(model)) {
    return buildFormArray(model, options, {})
  }
  else if(model !== null && typeof model === 'object') {

    let formGroup = formBuilder.group({}, options["__group"] as AbstractControlOptions);

    for (let [key, value] of Object.entries(model as any)) {
      if(typeof value !== 'object' && !Array.isArray(value)) {
        formGroup.addControl(key, formBuilder.control(value, (options[key] || {}) as AbstractControlOptions));
      } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        formGroup.addControl(key, buildFormGroup(value, options[key] || {}))
      } else if(Array.isArray(value)) {
        let formArray = buildFormArray(value, options[key] || {}, options[`__array_${key}`] || {}) as FormArray
        formGroup.addControl(key, formArray)
      }
    }
    return formGroup;
  } else if(typeof model === 'string' || typeof model === 'number' || typeof model === 'boolean') {
    return formBuilder.control(model, options as AbstractControlOptions);
  }

  return formBuilder.control("", []);
}


