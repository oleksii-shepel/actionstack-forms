import { AbstractControl, AbstractControlOptions, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ModelOptions, primitive } from '.';



export const fb = new FormBuilder();



export function buildForm<T>(model: T, options: ModelOptions<T> = {} as any): AbstractControl {
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
