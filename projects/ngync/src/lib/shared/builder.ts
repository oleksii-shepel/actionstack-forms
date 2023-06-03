import { AbstractControl, AbstractControlOptions, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ModelOptions } from '.';



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
