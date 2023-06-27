import { Directive, Host, Inject, Input, OnDestroy, OnInit, Optional, Self, SkipSelf, forwardRef } from "@angular/core";
import { AsyncValidator, AsyncValidatorFn, ControlContainer, FormArray, NG_ASYNC_VALIDATORS, NG_VALIDATORS, NgForm, NgModel, Validator, ValidatorFn } from "@angular/forms";
import { composeAsyncValidators, composeValidators } from "../shared";
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



@Directive({selector: '[ngModelArray]', providers: [formArrayNameProvider]})
export class NgModelArray extends ControlContainer implements OnInit, OnDestroy {

  _parent: ControlContainer;
  @Input('ngModelArray') override name: string|number|null = null;

  _rawValidators!: (ValidatorFn | Validator)[];
  _rawAsyncValidators!: (AsyncValidatorFn | AsyncValidator)[];
  _composedValidator!: ValidatorFn | null;
  _composedAsyncValidator!: AsyncValidatorFn | null;
  form: FormArray;

  constructor(
      @Optional() @Host() @SkipSelf() parent: ControlContainer,
      @Optional() @Self() @Inject(NG_VALIDATORS) validators: (Validator|ValidatorFn)[],
      @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) asyncValidators:
          (AsyncValidator|AsyncValidatorFn)[]) {
    super();
    this._parent = parent;
    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);

    this.form = new FormArray<any>([]);
    this.form.setValidators(this._composedValidator);
    this.form.setAsyncValidators(this._composedAsyncValidator);

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

  _setValidators(validators: Array<Validator | ValidatorFn> | undefined): void {
    this._rawValidators = validators || [];
    this._composedValidator = composeValidators(this._rawValidators);
  }

  _setAsyncValidators(validators: Array<AsyncValidator | AsyncValidatorFn> | undefined): void {
    this._rawAsyncValidators = validators || [];
    this._composedAsyncValidator = composeAsyncValidators(
      this._rawAsyncValidators
    );
  }
}
