import { Directive, forwardRef, Host, Inject, Input, OnDestroy, OnInit, Optional, Self, SkipSelf } from '@angular/core';
import { AbstractFormGroupDirective, AsyncValidator, AsyncValidatorFn, ControlContainer, FormGroup, NG_ASYNC_VALIDATORS, NG_VALIDATORS, NgForm, NgModel, Validator, ValidatorFn } from '@angular/forms';
import { composeAsyncValidators, composeValidators } from '../utils';

export const modelGroupProvider: any = {
  provide: ControlContainer,
  useExisting: forwardRef(() => FieldGroupDirective)
};

@Directive({selector: '[ngFieldGroup]', providers: [modelGroupProvider], exportAs: 'ngFieldGroup'})
export class FieldGroupDirective extends AbstractFormGroupDirective implements OnInit, OnDestroy {

  @Input('ngFieldGroup') override name = '';
  _rawValidators!: (Validator | ValidatorFn)[];
  _rawAsyncValidators!: (AsyncValidator | AsyncValidatorFn)[];
  _composedValidator!: ValidatorFn | null;
  _composedAsyncValidator!: AsyncValidatorFn | null;
  _parent: ControlContainer;
  form: FormGroup<any>;

  constructor(
      @Host() @SkipSelf() parent: ControlContainer,
      @Optional() @Self() @Inject(NG_VALIDATORS) validators: (Validator|ValidatorFn)[],
      @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) asyncValidators:
          (AsyncValidator|AsyncValidatorFn)[]) {
    super();
    this._parent = parent;
    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);

    this.form = new FormGroup({});
    this.form.setValidators(this._composedValidator);
    this.form.setAsyncValidators(this._composedAsyncValidator);

  }

  _checkParentType(): void {
  }

  override ngOnInit(): void {
    const self: any = this._parent.formDirective;
    const container = self._findContainer(this.path);
    const group = this.form;
    container?.registerControl(this.name, group);
    // group.updateValueAndValidity({emitEvent: false});
  }

  override ngOnDestroy(): void {
    const self: any = this._parent.formDirective;
    const container = self._findContainer(this.path);
    container?.removeControl(this.name);
  }

  override get control(): FormGroup {
    const self: any = this._parent.formDirective;
    return self.form.get(this.path) as FormGroup;
  }

  override get formDirective(): any {
    return (this._parent as any).formDirective;
  }

  override get path(): string[] {
    return [...this._parent.path!, this.name!.toString()];
  }

  get ngForm(): any {
    let directive: any = this._parent.formDirective;
    while(!(directive instanceof NgForm)) {
      directive = directive.formDirective;
    }
    return directive;
  }

  addControl(control: NgModel): void {
    const self: any = this._parent.formDirective;
    const container = self._findContainer(control.path);
    container?.addControl(control.name, control.control);
    this.ngForm._directives.add(control);
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
