import { Input, OnInit, Directive, Provider, forwardRef } from '@angular/core';
import { ControlContainer, DefaultValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { NgModelArray } from "./ngmodelarray";

const formControlBinding: Provider = {
  provide: ControlContainer,
  useExisting: forwardRef(() => FieldArrayDirective),
};

@Directive({
  selector: '[ngFieldArray]',
  providers: [
    formControlBinding,
    {provide: NG_VALUE_ACCESSOR, useClass: DefaultValueAccessor, multi: true},
  ],
  exportAs: 'ngFieldArray',
})
export class FieldArrayDirective extends NgModelArray implements OnInit {
  @Input('ngFieldArray') override name!: string;

  override ngOnInit() {
    super.ngOnInit();
  }
}
