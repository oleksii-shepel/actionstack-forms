import { Input, OnInit, Directive, Provider, forwardRef } from '@angular/core';
import { ControlContainer, DefaultValueAccessor, NG_VALUE_ACCESSOR, NgModel } from "@angular/forms";
import { NgModelArray } from "./ngmodelarray";

const formControlBinding: Provider = {
  provide: ControlContainer,
  useExisting: forwardRef(() => FieldArrayDirective),
};

@Directive({
  selector: '[ngFieldArray]',
  providers: [
    formControlBinding,
  ],
  exportAs: 'ngFieldArray',
})
export class FieldArrayDirective extends NgModelArray implements OnInit {
  @Input('ngFieldArray') override name!: string;

  override ngOnInit() {
    super.ngOnInit();
  }
}
