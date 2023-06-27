import { AbstractControl, FormArray } from "@angular/forms";

export const FormGroupMixin = (self: FormArray) => ({
  registerControl: (name: string, control: any): AbstractControl => {
    control.setParent(self);
    self.push(control);

    control._registerOnCollectionChange((self as any)._onCollectionChange);
    return control;
  },

  registerOnChange: (fn: (_: any) => void) => {
    self.controls.forEach((control: any) => {
      if(Object.prototype.hasOwnProperty.call(control, '_onChange')) {
        (control as any)['_onChange'].push(fn);
      }
    });
  },

  registerOnDisabledChange: (fn: (_: boolean) => void) => {
    if(Object.prototype.hasOwnProperty.call(self, '_onDisabledChange')) {
      (self as any)['_onDisabledChange'].push(fn);
    }
  },

  addControl: (name: string, control: any, options: {
    emitEvent?: boolean
  } = {}) => {
    (self as any).registerControl(name, control);
    self.updateValueAndValidity(options);
    (self as any)._onCollectionChange();
  },

  contains: (name: string) => {
    return self && self.controls && Object.prototype.hasOwnProperty.call(self.controls, name) && (self.controls as any)[name].enabled;
  },

  removeControl: (name: string, options: {emitEvent?: boolean} = {}) => {
    if ((self as any)[name])
    (self as any)[name]._registerOnCollectionChange(() => { Function.prototype });
    self.removeAt(+name);
    self.updateValueAndValidity(options);
    (self as any)._onCollectionChange();
  }
})
