import { ChangeDetectorRef, Directive, EventEmitter, Host, Inject, Input, OnDestroy, OnInit, Optional, Output, Provider, Self, forwardRef } from '@angular/core';
import { AsyncValidator, AsyncValidatorFn, ControlContainer, ControlValueAccessor, DefaultValueAccessor, FormControl, NG_ASYNC_VALIDATORS, NG_VALIDATORS, NG_VALUE_ACCESSOR, NgControl, NgModel, SetDisabledStateOption, Validator, ValidatorFn } from '@angular/forms';
import { CALL_SET_DISABLED_STATE, SyncDirective, composeAsyncValidators, composeValidators, getSlice, getValue, selectValueAccessor } from 'ngync';
import { Subject, distinctUntilChanged, map, takeUntil } from 'rxjs';
import { FieldArrayDirective } from './array.directive';
import { FieldGroupDirective } from './group.directive';

const formControlBinding: Provider = {
  provide: NgControl,
  useExisting: forwardRef(() => FieldDirective)
};

@Directive({selector: '[ngField]:not([formControlName]):not([formControl])',
  host: {
    '(input)': 'onChange($event.target.value)',
    '(blur)': 'onTouched()',
    '(keydown.enter)': 'onEnter()'
  },
 providers: [
  formControlBinding,
  [{provide: NG_VALUE_ACCESSOR, useClass: DefaultValueAccessor, multi: true}]
], exportAs: 'ngField'})
export class FieldDirective extends NgModel implements OnInit, OnDestroy, NgControl {
  @Input("ngField") override name!: string;
  @Output('ngFieldChange') override update = new EventEmitter();

  override control: FormControl<string | null>;
  override valueAccessor: ControlValueAccessor | null;
  override viewModel: any;

  _parent: ControlContainer;
  _ngStore: SyncDirective;
  _rawValidators!: (ValidatorFn | Validator)[];
  _rawAsyncValidators!: (AsyncValidator | AsyncValidatorFn)[];
  _composedValidator!: ValidatorFn | null;
  _composedAsyncValidator!: AsyncValidatorFn | null;

  private _destroyed$ = new Subject<boolean>();

  constructor(
      @Optional() @Host() parent: ControlContainer,
      @Optional() @Host() ngStore: SyncDirective,
      @Optional() @Self() @Inject(NG_VALIDATORS) validators: (Validator|ValidatorFn)[],
      @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) asyncValidators:
          (AsyncValidator|AsyncValidatorFn)[],
      @Optional() @Self() @Inject(NG_VALUE_ACCESSOR) valueAccessors: ControlValueAccessor[],
      @Optional() @Inject(ChangeDetectorRef) changeDetectorRef?: ChangeDetectorRef|null,
      @Optional() @Inject(CALL_SET_DISABLED_STATE) callSetDisabledState?:
          SetDisabledStateOption,
          ) {
    super(parent, validators, asyncValidators, valueAccessors, changeDetectorRef, callSetDisabledState);

    this._parent = parent;
    this._ngStore = ngStore;

    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);
    this.valueAccessor = selectValueAccessor(this, valueAccessors);

    this.control = new FormControl('');
    this.control.setValidators(this._composedValidator);
    this.control.setAsyncValidators(this._composedAsyncValidator);

    this.control.setParent(this.formDirective.control);
  }

  onChange(value: any) {
    this.control.setValue(value);
    this.control.updateValueAndValidity();
    this.viewToModelUpdate(value);
  }

  onTouched() {
    this.control.markAsTouched();
  }

  onEnter() {
    Function.prototype
  }

  override viewToModelUpdate(value: any): void {
    this.viewModel = value;
    this.update.emit(value);
  }

  ngOnInit(): void {
    this._ngStore?.store.select((state: any) => state).pipe(
      distinctUntilChanged(),
      takeUntil(this._destroyed$),
      map(state => getSlice(this._ngStore.slice)(state).model))
    .subscribe((model: any) => {
      let value = getValue(model, this.path.join('.'));
      this.valueAccessor?.writeValue(value);
      this.control.setValue(value);
    });

    this.formDirective.addControl(this);
  }

  /** @nodoc */
  override ngOnDestroy() {
    this.formDirective.removeControl(this);

    this._destroyed$.next(true);
    this._destroyed$.complete();
  }

  setParent(parent: ControlContainer): void {
    this._parent = parent;
  }

  registerOnChange(fn: () => void): void {
    if(this.control.hasOwnProperty('_onChange')) {
      (this.control as any)['_onChange'].push(fn);
    }
  }

  override get formDirective(): FieldGroupDirective | FieldArrayDirective {
    return this._parent as any;
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
    if(this.control.hasOwnProperty('_onCollectionChange')) {
      (this.control as any)['_onCollectionChange'] = fn;
    }
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
