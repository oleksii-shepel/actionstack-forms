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
  private _onCollectionChange = () => {};
  private _onChange = () => {};

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

    this.form.setParent(this.formDirective.form);
  }

  onChange(value: any) {
    this.form.setValue(value);
    this.form.updateValueAndValidity({emitEvent: true});
    this.viewToModelUpdate(value);
  }

  onTouched() {
    this.form.markAsTouched();
  }

  viewToModelUpdate(value: any): void {
    this.viewModel = value;
    this.update.emit(value);
  }

  ngOnInit(): void {
    this._ngStore?.store.select((state: any) => getValue(state, `${this._ngStore?.path}.model`)).subscribe(
    (state: any) => {
      this.form.patchValue(getValue(state, this.path.join('.')), {emitEvent: false});
    });

    if(this.formDirective instanceof NgForm) {
      this.formDirective.form.addControl(this.name, this.form);
    } else if(this.formDirective instanceof FieldGroupDirective) {
      this.formDirective.addControl(this);
    } else if(this.formDirective instanceof FieldArrayDirective) {
      this.formDirective.addControl(this);
    }
  }

  /** @nodoc */
  ngOnDestroy() {
    if(this.formDirective instanceof NgForm) {
      this.formDirective.form.removeControl(this.name);
    } else if(this.formDirective instanceof FieldGroupDirective) {
      this.formDirective!.removeControl(this);
    } else if(this.formDirective instanceof FieldArrayDirective) {
      this.formDirective!.removeControl(this);
    }
  }

  setParent(parent: ControlContainer): void {
    this._parent = parent;
  }

  registerOnChange(fn: () => void): void {
    this._onChange = fn;
  }

  override get control(): AbstractControl<any, any> | null {
    return this.form;
  }

  override set control( value: AbstractControl<any, any> | null) {
    this.form = value as any;
  }

  get formDirective(): any {
    return this._parent;
  }

  /**
   * @description
   * Returns an array that represents the path from the top-level form to this control.
   * Each index is the string name of the control on that level.
   */
  override get path(): string[] {
    return [...this._parent.path!, this.name!.toString()];
  }

  _registerOnCollectionChange(fn: () => void): void {
    this._onCollectionChange = fn;
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
