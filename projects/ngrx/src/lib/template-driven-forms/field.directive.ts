import { EventEmitter, Directive, forwardRef, Host, Inject, Input, OnDestroy, OnInit, Optional, Provider, Self, Output } from '@angular/core';
import { AbstractControl, AbstractControlDirective, AsyncValidator, AsyncValidatorFn, ControlContainer, ControlValueAccessor, DefaultValueAccessor, FormControl, NG_ASYNC_VALIDATORS, NG_VALIDATORS, NG_VALUE_ACCESSOR, NgControl, NgForm, SetDisabledStateOption, Validator, ValidatorFn } from '@angular/forms';
import { selectValueAccessor } from '../shared/accessors';
import { composeAsyncValidators, composeValidators } from '../shared/validators';
import { CALL_SET_DISABLED_STATE } from '../shared/controls';
import { FieldGroupDirective } from './group.directive';
import { FieldArrayDirective } from './array.directive';
import { DynamicStoreDirective } from './store.directive';
import { getValue } from '../shared';

const formControlBinding: Provider = {
  provide: NgControl,
  useExisting: forwardRef(() => FieldDirective)
};

@Directive({selector: '[ngField]:not([formControlName]):not([formControl])',
  host: {
    '(input)': 'onChange($event.target.value)',
    '(blur)': 'onTouched()'
  },
 providers: [
  formControlBinding,
  [{provide: NG_VALUE_ACCESSOR, useClass: DefaultValueAccessor, multi: true}]
], exportAs: 'ngField'})
export class FieldDirective extends AbstractControlDirective implements OnInit, OnDestroy, NgControl {
  @Input("ngField") name!: string;
  @Output('ngFieldChange') update = new EventEmitter();

  form: FormControl<string | null>;
  valueAccessor: ControlValueAccessor | null;
  viewModel: any;

  public _parent: ControlContainer;
  private _rawValidators!: (ValidatorFn | Validator)[];
  private _composedValidator!: ValidatorFn | null;
  private _composedAsyncValidator!: AsyncValidatorFn | null;
  private _rawAsyncValidators!: (AsyncValidator | AsyncValidatorFn)[];
  private _ngStore: DynamicStoreDirective | null | undefined;

  constructor(
      @Optional() @Host() parent: ControlContainer,
      @Optional() @Self() @Inject(NG_VALIDATORS) validators: (Validator|ValidatorFn)[],
      @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) asyncValidators:
          (AsyncValidator|AsyncValidatorFn)[],
      @Optional() @Self() @Inject(NG_VALUE_ACCESSOR) valueAccessors: ControlValueAccessor[],
      @Optional() @Inject(CALL_SET_DISABLED_STATE) callSetDisabledState?:
          SetDisabledStateOption,
          ) {
    super();

    this._parent = parent;
    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);
    this.valueAccessor = selectValueAccessor(this, valueAccessors);

    this.form = new FormControl('');
    this.form.setValidators(this._composedValidator);
    this.form.setAsyncValidators(this._composedAsyncValidator);
    this.form.updateValueAndValidity({emitEvent: false});
  }

  onChange(value: any) {
    this.form.setValue(value);
    this.control!.updateValueAndValidity();
  }

  onTouched() {
    this.control!.markAsTouched();
  }

  viewToModelUpdate(newValue: any): void {
    this.viewModel = newValue;
    this.update.emit(newValue);
  }

  ngOnInit(): void {
    this._ngStore?.store.select((state: any) => getValue(state, `${this._ngStore?.path}.model`)).subscribe(
    (state: any) => {
      this.form.patchValue(getValue(state, this.path.join('.')), {emitEvent: false});
    });

    if(this._parent instanceof NgForm) {
      this._parent.formDirective.addControl(this);
    } else if(this._parent instanceof FieldGroupDirective) {
      this._parent.formDirective!.addControl(this);
    } else if(this._parent instanceof FieldArrayDirective) {
      this._parent.formDirective!.addControl(this);
    }
  }

  /** @nodoc */
  ngOnDestroy() {
    if(this._parent instanceof NgForm) {
      this._parent.formDirective.removeControl(this);
    } else if(this._parent instanceof FieldGroupDirective) {
      this._parent.formDirective!.removeControl(this);
    } else if(this._parent instanceof FieldArrayDirective) {
      this._parent.formDirective!.removeControl(this);
    }
  }

  override get control(): AbstractControl<any, any> | null {
    return this.form;
  }

  override set control( value: AbstractControl<any, any> | null) {
    this.form = value as any;
  }

  /**
   * @description
   * Returns an array that represents the path from the top-level form to this control.
   * Each index is the string name of the control on that level.
   */
  override get path(): string[] {
    return [...this._parent.path!, this.name!.toString()];
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
