import { AbstractControl, AbstractControlOptions, FormArray, FormBuilder } from '@angular/forms';


export type ArrayToObject<T extends any[]> = {
  [K in keyof T as string]: T[K];
}

export type Extract<T, V> = { [K in keyof T]: T[K] extends V ? K : never };

export type ModelOptions<T> = {
  [key in keyof Partial<T>]? : T[key] extends Array<unknown> ? ModelOptions<ArrayToObject<T[key]>> : T[key] extends object ? ModelOptions<T[key]> : AbstractControlOptions;
} & {
  ["__group"]?: T extends object ? AbstractControlOptions : never;
}

const formBuilder = new FormBuilder();

export function buildFormArray(model: any, options: any = {}, groupOptions: AbstractControlOptions): AbstractControl {
  if(Array.isArray(model)) {
    let formControls: AbstractControl[] = [];
    model.forEach((item, index) => {
      if(typeof item !== 'object') {
        formControls.push(formBuilder.control(item, (options[index] || {}) as AbstractControlOptions))
      } else if (typeof item === 'object' && !Array.isArray(item)) {
        formControls.push(buildFormGroup(item, options[index] || {}, options[index] ? options[index]["__group"] : {}))
      } else if(Array.isArray(item)) {
        formControls.push(buildFormArray(item, options[index] || {}, options[index] ? options[index]["__group"] : {}))
      }
    });

    return formBuilder.array(formControls, groupOptions)
  }
  else {
    return formBuilder.control("", []);
  }
}

export function buildFormGroup(model: any, options: any = {}, groupOptions: AbstractControlOptions = {}): AbstractControl {
  if(Array.isArray(model)) {
    return buildFormArray(model, options, groupOptions)
  }
  else if(model !== null && typeof model === 'object') {

    let formGroup = formBuilder.group({}, (options["__group"] || groupOptions) as AbstractControlOptions);

    for (let [key, value] of Object.entries(model as any)) {
      if(typeof value !== 'object') {
        formGroup.addControl(key, formBuilder.control(value, (options[key] || {}) as AbstractControlOptions));
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        formGroup.addControl(key, buildFormGroup(value, options[key] || {}, options[key]? options[key]["__group"] : {}));
      } else if(Array.isArray(value)) {
        let formArray = buildFormArray(value, options[key] || {}, options[key]? options[key]["__group"] : {}) as FormArray
        formGroup.addControl(key, formArray)
      }
    }
    return formGroup;
  } else if(typeof model === 'string' || typeof model === 'number' || typeof model === 'boolean') {
    return formBuilder.control(model, options as AbstractControlOptions);
  }

  return formBuilder.control("", options as AbstractControlOptions);
}


