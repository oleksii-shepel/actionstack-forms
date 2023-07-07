import { Directive, Input, OnInit, Provider, forwardRef } from '@angular/core';
import { ControlContainer } from "@angular/forms";
import { NgModelArray } from "../utils";

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
  @Input('ngFieldArray') override name = '';

  override ngOnInit() {
    super.ngOnInit();
  }
}
