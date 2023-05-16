import {Directive, forwardRef, Host, Inject, Input, OnDestroy, OnInit, Optional, Provider, Self, SkipSelf} from '@angular/core';
import { AsyncValidator, AsyncValidatorFn, ControlContainer, ControlValueAccessor, FormArray, NG_ASYNC_VALIDATORS, NG_VALIDATORS, NG_VALUE_ACCESSOR, NgControl, NgForm, NgModelGroup, Validator, ValidatorFn } from '@angular/forms';
import { FieldGroupDirective } from './group.directive';

const formControlBinding: Provider = {
  provide: ControlContainer,
  useExisting: forwardRef(() => FieldArrayDirective)
};

@Directive({selector: '[ngFieldArray]', providers: [formControlBinding]})
export class FieldArrayDirective extends FieldGroupDirective implements OnInit, OnDestroy, NgModelGroup {
  /**
   * @description
   * Tracks the name of the `FormArray` bound to the directive. The name corresponds
   * to a key in the parent `FormGroup` or `FormArray`.
   * Accepts a name as a string or a number.
   * The name in the form of a string is useful for individual forms,
   * while the numerical form allows for form arrays to be bound
   * to indices when iterating over arrays in a `FormArray`.
   */
  @Input('ngFieldArray') override name: string = '';
  private _form!: FormArray<any>;
  private _onCollectionChange = () => { this._form?.updateValueAndValidity()};

  constructor(
      @Optional() @Host() @SkipSelf() parent: ControlContainer,
      @Optional() @Self() @Inject(NG_VALIDATORS) validators: (Validator|ValidatorFn)[],
      @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) asyncValidators: (AsyncValidator|AsyncValidatorFn)[],
      @Optional() @Self() @Inject(NG_VALUE_ACCESSOR) valueAccessors: ControlValueAccessor[]) {
    super(parent, validators, asyncValidators, valueAccessors);
    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);
    this._form = new FormArray<any>([], this._composedValidator, this._composedAsyncValidator);
  }

  viewToModelUpdate(newValue: any): void {
    throw new Error('Method not implemented.');
  }

  /**
   * A lifecycle method called when the directive's inputs are initialized. For internal use only.
   * @throws If the directive does not have a valid parent.
   * @nodoc
   */
  override ngOnInit(): void {
    if(this.formDirective instanceof NgForm) {
      this.formDirective!.addFormGroup(this);
    } else if(this.formDirective instanceof FieldGroupDirective) {
      this.formDirective!.addFormGroup(this);
    } else if(this.formDirective instanceof FieldArrayDirective) {
      this.formDirective!.addFormGroup(this);
    }
  }

  setParent(parent: ControlContainer): void {
    this._parent = parent;
  }

  _registerOnCollectionChange(fn: () => void): void {
    this._onCollectionChange = fn;
  }

  /**
   * A lifecycle method called before the directive's instance is destroyed. For internal use only.
   * @nodoc
   */
  override ngOnDestroy(): void {
    if (this.formDirective) {
      this.formDirective.removeFormGroup(this);
    }
  }

  /**
   * @description
   * The `FormArray` bound to this directive.
   */
  override get control(): any {
    return this._form;
  }

  override addControl(control: any): void {
    this._form.controls.push(control);
  }

  override removeControl(control: any): void {
    this._form.controls = this._form.controls.filter((item) => item !== control);
  }
}

