import {
  Directive,
  forwardRef,
  Host,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Provider,
  Self,
  SkipSelf,
} from '@angular/core';

import {
  AbstractControl,
  AbstractControlDirective,
  AsyncValidator,
  AsyncValidatorFn,
  ControlContainer,
  ControlValueAccessor,
  DefaultValueAccessor,
  Form,
  FormGroup,
  NG_ASYNC_VALIDATORS,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  NgControl,
  NgForm,
  NgModel,
  NgModelGroup,
  Validator,
  ValidatorFn,
} from '@angular/forms';
import { selectValueAccessor } from '../shared/accessors';
import { composeAsyncValidators, composeValidators, mergeValidators } from '../shared';

const formGroupNameProvider: Provider = {
  provide: ControlContainer,
  useExisting: forwardRef(() => FieldGroupDirective),
};

@Directive({
  selector: '[ngFieldGroup]',
  providers: [
    formGroupNameProvider,
    { provide: NG_VALUE_ACCESSOR, useClass: DefaultValueAccessor, multi: true },
  ],
  exportAs: 'ngFieldGroup',
})
export class FieldGroupDirective
  extends NgModelGroup
  implements ControlContainer, NgControl, OnInit, OnDestroy
{
  @Input('ngFieldGroup') override name: string = '';

  valueAccessor: ControlValueAccessor | null;
  fg: FormGroup<any>

  _parent: ControlContainer;
  _rawValidators!: (Validator | ValidatorFn)[];
  _rawAsyncValidators!: (AsyncValidator | AsyncValidatorFn)[];
  _composedValidator!: ValidatorFn | null;
  _composedAsyncValidator!: AsyncValidatorFn | null;
  _onDisabledChange: Array<(isDisabled: boolean) => void> = [];
  _onChange: Array<Function> = [];
  _onCollectionChange = () => {};

  constructor(
    @Host() @SkipSelf() parent: ControlContainer,
    @Optional()
    @Self()
    @Inject(NG_VALIDATORS)
    validators: (Validator | ValidatorFn)[],
    @Optional()
    @Self()
    @Inject(NG_ASYNC_VALIDATORS)
    asyncValidators: (AsyncValidator | AsyncValidatorFn)[],
    @Optional()
    @Self()
    @Inject(NG_VALUE_ACCESSOR)
    valueAccessors: ControlValueAccessor[]
  ) {
    super(parent, validators, asyncValidators);

    this._parent = parent;

    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);

    this.valueAccessor = selectValueAccessor(this, valueAccessors);

    this.fg = new FormGroup({});
    this.fg.setValidators(this._composedValidator);
    this.fg.setAsyncValidators(this._composedAsyncValidator);

    this.fg.setParent(this.formDirective.form);
  }

  override ngOnInit(): void {
    this.formDirective.addControl(this);

    Object.assign(this.fg, {
      registerOnChange: (fn: (_: any) => {}) => {
        this._onChange.push(fn);
      }
    }, {
      registerOnDisabledChange: (fn: (_: boolean) => {}) => {
        this._onDisabledChange.push(fn);
      }
    })
  }

  override ngOnDestroy(): void {
    this.control.disable();
    Object.keys(this.control).forEach((controlName) => {
      this.control.removeControl(controlName);
    });

    if (this.formDirective) {
      this.formDirective.removeControl(this);
    }
  }

  viewToModelUpdate(newValue: any): void {
    throw new Error('Method not implemented.');
  }

  override get formDirective(): any {
    return this._parent;
  }

  override get path(): string[] {
    return [...this._parent.path!, this.name!.toString()];
  }

  override get control(): FormGroup<any> {
    return this.fg;
  }

  override set control(value: FormGroup<any>) {
    this.fg = value;
  }

  get directives(): Set<NgModel> {
    let container = this.formDirective;
    while(!(container instanceof NgForm)) {
      container = container.formDirective;
    }
    return container['_directives'];
  }

  addControl(control: NgModel): void {
    let controls: any = this.control.controls;
    controls[control.name] = control.control;
  }

  removeControl(control: NgModel): void {
    this.control.removeControl(control.name);
  }

  registerOnChange(fn: () => void): void {
    this.control.valueChanges.subscribe(fn);
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
