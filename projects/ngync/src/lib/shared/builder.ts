import { AbstractControl, AbstractControlOptions, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ModelOptions } from '.';



export const fb = new FormBuilder();



export function buildForm<T>(model: T, options: ModelOptions<T> = {} as any): AbstractControl {
  if (!model) return fb.control('', options as AbstractControlOptions);

  let obj = Array.isArray(model) ? fb.array([], ((options as any)["__group"] || {}) as AbstractControlOptions) :
    typeof model === 'object' ? fb.group({}, ((options as any)["__group"] || {}) as AbstractControlOptions) :
    fb.control(model, options as AbstractControlOptions);

  if(typeof obj !== 'string') {
    for (const key in model) {
      let value = model[key];
      let control = Array.isArray(value) ? buildForm(value, (options as any)[key] || {}) :
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


export function checkForm<T>(form: any, model: T): boolean {
  if (!form || !form.controls) return false;

  let ready = true;

  if(typeof model !== 'string') {
    for (const key in model) {
      let value = model[key];
      let control = form.controls[key];
      ready = Array.isArray(value) ? Array.isArray(control?.controls) && control.controls.every((item: any, index: number) => {
        return !(item instanceof FormControl) ? checkForm(item, (value as any)[index]) : true;
      }) : !(control instanceof FormControl) ? checkForm(control, value) : !!control;

      if(ready === false) break;
    }
    return ready;
  } else {
    throw new Error('Model must be an object or array');
  }
}

