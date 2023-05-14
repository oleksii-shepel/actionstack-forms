import {Directive, forwardRef, Host, Inject, Input, OnChanges, OnDestroy, OnInit, Optional, Provider, Self, SimpleChanges} from '@angular/core';
import { AsyncValidator, AsyncValidatorFn, ControlContainer, FormArray, FormArrayName, FormControlDirective, NG_ASYNC_VALIDATORS, NG_VALIDATORS, NgControl, NgForm, SetDisabledStateOption, Validator, ValidatorFn } from '@angular/forms';
import { composeAsyncValidators, composeValidators } from '../shared/validators';
import { CALL_SET_DISABLED_STATE } from '../shared/controls';

const formControlBinding: Provider = {
  provide: NgControl,
  useExisting: forwardRef(() => ArrayDirective)
};

@Directive({selector: '[ngFieldArray]', providers: [formControlBinding], exportAs: 'ngFieldArray'})
export class ArrayDirective extends FormArrayName implements OnInit, OnChanges, OnDestroy {
  @Input("ngFieldArray") override name!: string;

  private _formArray!: FormArray;
  private _rawValidators!: (ValidatorFn | Validator)[];
  private _composedValidator!: ValidatorFn | null;
  private _composedAsyncValidator!: AsyncValidatorFn | null;
  private _rawAsyncValidators!: (AsyncValidator | AsyncValidatorFn)[];

  constructor(
      @Optional() @Host() private _parent: ControlContainer,
      @Optional() @Self() @Inject(NG_VALIDATORS) validators: (Validator|ValidatorFn)[],
      @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) asyncValidators:
          (AsyncValidator|AsyncValidatorFn)[],
      @Optional() @Inject(CALL_SET_DISABLED_STATE) callSetDisabledState?:
          SetDisabledStateOption) {
    super(_parent, validators, asyncValidators);
    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);

    this._formArray = new FormArray<any>([]);
    this._formArray.setValidators(this._composedValidator);
    this._formArray.setAsyncValidators(this._composedAsyncValidator);
  }

  override ngOnInit(): void {
    super.ngOnInit();

    (this._parent as NgForm).form.addControl(this.name!.toString(), this._formArray);
    console.log(this._parent);
  }

  /** @nodoc */
  ngOnChanges(changes: SimpleChanges): void {
    FormControlDirective.prototype.ngOnChanges.call(this, changes);
  }

  /** @nodoc */
  override ngOnDestroy() {
    (this._parent as NgForm).form.removeControl(this.name!.toString());
    FormControlDirective.prototype.ngOnDestroy.call(this);
  }

  /**
   * @description
   * Returns an array that represents the path from the top-level form to this control.
   * Each index is the string name of the control on that level.
   */
  override get path(): string[] {
    return [];
  }

  /**
   * Sets synchronous validators for this directive.
   * @internal
   */
  private _setValidators(validators: Array<Validator|ValidatorFn>|undefined): void {
    this._rawValidators = validators || [];
    this._composedValidator = composeValidators(this._rawValidators);
  }

  /**
   * Sets asynchronous validators for this directive.
   * @internal
   */
  private _setAsyncValidators(validators: Array<AsyncValidator|AsyncValidatorFn>|undefined): void {
    this._rawAsyncValidators = validators || [];
    this._composedAsyncValidator = composeAsyncValidators(this._rawAsyncValidators);
  }
}
