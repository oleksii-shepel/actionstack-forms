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
  }
}
