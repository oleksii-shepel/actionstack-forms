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
  Validator,
  ValidatorFn,
} from '@angular/forms';
import { selectValueAccessor } from '../shared/accessors';
import { composeAsyncValidators, composeValidators } from '../shared';
import { FieldArrayDirective } from './array.directive';
import { DynamicStoreDirective } from './store.directive';

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
  extends AbstractControlDirective
  implements ControlContainer, NgControl, OnInit, OnDestroy
{
  @Input('ngFieldGroup') name: string = '';

  valueAccessor: ControlValueAccessor | null;
  form: FormGroup<{}>;

  _parent: ControlContainer;
  _rawValidators!: (Validator | ValidatorFn)[];
  _rawAsyncValidators!: (AsyncValidator | AsyncValidatorFn)[];
  _composedValidator!: ValidatorFn | null;
  _composedAsyncValidator!: AsyncValidatorFn | null;
  _onDisabledChange = (_: boolean) => {};
  _onChange = (_: any) => {};
  _onCollectionChange = () => {};

  constructor(
    @Host() @SkipSelf() parent: ControlContainer,
    @Optional() @Host() ngStore: DynamicStoreDirective,
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
    super();

    this._parent = parent;

    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);
    this.valueAccessor = selectValueAccessor(this, valueAccessors);

    this.form = new FormGroup({});
    this.form.setValidators(this._composedValidator);
    this.form.setAsyncValidators(this._composedAsyncValidator);

    this.form.setParent(this.formDirective.form);
  }

  ngOnDestroy(): void {
    Object.keys(this.form).forEach((controlName) => {
      this.form.removeControl(controlName);
    });

    if (this.formDirective) {
      this.formDirective.removeControl(this);
    }
  }

  ngOnInit(): void {
    if (this.formDirective instanceof NgForm) {
      this.formDirective.form.addControl(this.name, this.form);
    } else if (this.formDirective instanceof FieldGroupDirective) {
      this.formDirective.addControl(this);
    } else if (this.formDirective instanceof FieldArrayDirective) {
      this.formDirective.addControl(this);
    }
  }

  viewToModelUpdate(newValue: any): void {
    throw new Error('Method not implemented.');
  }

  override get control(): AbstractControl<any, any> | null {
    return this.form;
  }

  override set control(control: AbstractControl<any, any> | null) {
    this.form = control as FormGroup<any>;
  }

  get formDirective(): any {
    return this._parent;
  }

  override get path(): string[] {
    return [...this._parent.path!, this.name!.toString()];
  }

  addControl(control: any): void {
    let controls: any = this.form.controls;
    controls[control.name] = control.form;
  }

  removeControl(control: any): void {
    this.form.removeControl(control.name);
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
