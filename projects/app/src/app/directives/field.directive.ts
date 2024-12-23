import { ChangeDetectorRef, Directive, EventEmitter, Host, Inject, Input, OnDestroy, OnInit, Optional, Output, Provider, Self, forwardRef } from '@angular/core';
import { AsyncValidator, AsyncValidatorFn, ControlContainer, ControlValueAccessor, DefaultValueAccessor, FormControl, NG_ASYNC_VALIDATORS, NG_VALIDATORS, NG_VALUE_ACCESSOR, NgControl, NgModel, Validator, ValidatorFn } from '@angular/forms';
import { SyncDirective, getValue, selectFormState } from 'nygma-forms';
import { Subject, distinctUntilChanged, filter, takeUntil } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CALL_SET_DISABLED_STATE, SetDisabledStateOption, composeAsyncValidators, composeValidators, selectValueAccessor } from '../utils';
import { FieldArrayDirective } from './array.directive';
import { FieldGroupDirective } from './group.directive';

const formControlBinding: Provider = {
  provide: NgControl,
  useExisting: forwardRef(() => FieldDirective)
};

@Directive({
    selector: '[ngField]:not([formControlName]):not([formControl])',
    host: {
        '(input)': 'onChange($event.target.value)',
        '(blur)': 'onTouched()',
        '(keydown.enter)': 'onEnter()'
    },
    providers: [
        formControlBinding,
        [{ provide: NG_VALUE_ACCESSOR, useClass: DefaultValueAccessor, multi: true }]
    ], exportAs: 'ngField',
    standalone: false
})
export class FieldDirective extends NgModel implements OnInit, OnDestroy, NgControl {
  @Input("ngField") override name = '';
  @Output('ngFieldChange') override update = new EventEmitter();

  override control!: FormControl<string | null>;
  override valueAccessor: ControlValueAccessor | null;
  override viewModel: any = undefined;

  _parent: ControlContainer;
  sync: SyncDirective;
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
    super(parent, validators, asyncValidators, valueAccessors, changeDetectorRef);

    this._parent = parent;
    this.sync = ngStore;

    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);
    this.valueAccessor = selectValueAccessor(this, valueAccessors);

    this.control = new FormControl('');
    this.control.setValidators(this._composedValidator);
    this.control.setAsyncValidators(this._composedAsyncValidator);

    this.control.setParent(this.formDirective.control);

    Object.assign(this, {
      _checkForErrors: () => { Function.prototype },
      _checkParentType: () => { Function.prototype },
      _checkName: () => { Function.prototype }
    })
  }

  onChange(value: any) {
    (this.valueAccessor as DefaultValueAccessor)?.onChange(value);
    this.control.setValue(value);
    this.viewToModelUpdate(value);
  }

  onTouched() {
    (this.valueAccessor as DefaultValueAccessor)?.onTouched();
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
    this.sync?.initialized$.pipe(
      filter(value => value),
      switchMap(() => this.sync.store.select(selectFormState(this.sync.path, true))),
      distinctUntilChanged(),
      takeUntil(this._destroyed$))
    .subscribe((model: any) => {
      const value = getValue(model, this.path.join('.'));
      this.valueAccessor?.writeValue(value);
      if(value !== this.control.value) {
        this.control.setValue(value, {emitEvent: false});
      }
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
