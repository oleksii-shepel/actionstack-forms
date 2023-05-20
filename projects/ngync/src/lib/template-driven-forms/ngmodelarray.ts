import { Input, OnInit, Directive, Provider, forwardRef } from '@angular/core';
import { AbstractControl, ControlContainer, DefaultValueAccessor, FormArray, NG_VALUE_ACCESSOR, NgModel } from "@angular/forms";
import { FieldArrayDirective } from "./array.directive";

const formControlBinding: Provider = {
  provide: ControlContainer,
  useExisting: forwardRef(() => NgModelArray),
};

@Directive({
  selector: '[ngModelArray]',
  providers: [
    formControlBinding,
    {provide: NG_VALUE_ACCESSOR, useClass: DefaultValueAccessor, multi: true},
  ],
  exportAs: 'ngModelArray',
})
export class NgModelArray extends FieldArrayDirective implements OnInit {
  @Input('ngModelArray') override name!: string;

  override ngOnInit() {
    super.ngOnInit();

    Object.assign(NgModel.prototype, {
      _checkParentType() {}
    })

    Object.assign(FormArray.prototype, {
      registerControl: (name: string, control: any): AbstractControl => {
        control.setParent(this.control);
        (this.control! as FormArray).push(control);
        control._registerOnCollectionChange((this.control as any)._onCollectionChange);
        return control;
      }
    }, {
      addControl: (name: string, control: any, options: {
        emitEvent?: boolean
      } = {}) => {
        (this.control as any).registerControl(name, control);
        (this.control as FormArray).updateValueAndValidity(options);
        (this.control as any)._onCollectionChange();
      }
    }, {
      contains: (name: string) => {
        return this.control!.hasOwnProperty(name) && (this.control as any)[name].enabled;
      }
    }, {
      removeControl: (name: string, options: {emitEvent?: boolean} = {}) => {
        if ((this.control as any)[name])
        (this.control as any)[name]._registerOnCollectionChange(() => {});
        (this.control as any).removeAt(+name);
        this.control!.updateValueAndValidity(options);
        (this.control as any)._onCollectionChange();
      }
    })
  }
}
