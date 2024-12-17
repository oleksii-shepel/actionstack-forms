import { Directive, Host, Inject, Input, OnDestroy, OnInit, Optional, Self, SkipSelf, forwardRef } from "@angular/core";
import { AbstractControl, AsyncValidator, AsyncValidatorFn, ControlContainer, FormArray, NG_ASYNC_VALIDATORS, NG_VALIDATORS, NgForm, NgModel, Validator, ValidatorFn } from "@angular/forms";
import { FormGroupMixin } from "./mixin";



export const formArrayNameProvider: any = {
  provide: ControlContainer,
  useExisting: forwardRef(() => NgModelArray)
};



export const moduleFactory = () => {
  return new Promise((resolve) => {

    Object.assign(NgModel.prototype, {
      _checkParentType() { Function.prototype }
    });

    resolve(true);
  });
}



@Directive({
    selector: '[ngModelArray]', providers: [formArrayNameProvider],
    standalone: false
})
export class NgModelArray extends ControlContainer implements OnInit, OnDestroy {

  _parent: ControlContainer;
  @Input('ngModelArray') override name: string|number|null = null;

  form: FormArray;

  constructor(
      @Optional() @Host() @SkipSelf() parent: ControlContainer,
      @Optional() @Self() @Inject(NG_VALIDATORS) validators: (Validator|ValidatorFn)[],
      @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) asyncValidators:
          (AsyncValidator|AsyncValidatorFn)[]) {
    super();
    this._parent = parent;

    this.form = new FormArray<any>([]);

    this.form.setValidators(this.normalizeValidators(validators));
    this.form.setAsyncValidators(this.normalizeValidators(asyncValidators));

    Object.assign(this.form, FormGroupMixin(this.form));
  }

  ngOnInit(): void {
    const self: any = this._parent.formDirective;
    const container = self._findContainer(this.path);
    const array = this.form;
    container?.registerControl(this.name, array);
    array.updateValueAndValidity({emitEvent: false});
  }

  ngOnDestroy(): void {
    const self: any = this._parent.formDirective;
    const container = self._findContainer(this.path);
    container?.removeControl(this.name);
  }

  override get control(): FormArray {
    const self: any = this._parent.formDirective;
    return self.form.get(this.path) as FormArray;
  }

  override get formDirective(): any {
    return (this._parent as any).formDirective;
  }

  override get path(): string[] {
    if(this._parent.path == null || this.name == null) {
      throw new Error('Control path or name is null');
    }
    return [...this._parent.path, this.name.toString()];
  }

  get ngForm(): any {
    let directive: any = this._parent.formDirective;
    while(!(directive instanceof NgForm)) {
      directive = directive.formDirective;
    }
    return directive;
  }

  addControl(control: NgModel): void {
    const controls: any = this.control.controls;
    if(!controls.includes(control.control)) {
      const self: any = this._parent.formDirective;
      const container = self._findContainer(control.path);
      container?.addControl(control.name, control.control);
      this.ngForm._directives.add(control);
    }
  }

  removeControl(control: NgModel): void {
    const self: any = this._parent.formDirective;
    const container = self._findContainer(control.path);
    container?.removeControl(control.name, control.control);
  }

  normalizeValidators(validators: (any | Validator | AsyncValidator)[]): any[] {
    return (validators || []).map((validator) => {
      return !(validator as Validator).validate
        ? validator
        : (((c: AbstractControl) => (validator as Validator).validate(c)));
    });
  }
}
