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
  FormArray,
  NG_ASYNC_VALIDATORS,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  NgControl,
  NgForm,
  Validator,
  ValidatorFn,
} from '@angular/forms';
import { FieldGroupDirective } from './group.directive';
import {
  composeAsyncValidators,
  composeValidators,
  selectValueAccessor,
} from '../shared';
import { DynamicStoreDirective } from './store.directive';

const formControlBinding: Provider = {
  provide: ControlContainer,
  useExisting: forwardRef(() => FieldArrayDirective),
};

@Directive({
  selector: '[ngFieldArray]',
  providers: [
    formControlBinding,
    {provide: NG_VALUE_ACCESSOR, useClass: DefaultValueAccessor, multi: true},
  ],
  exportAs: 'ngFieldArray',
})
export class FieldArrayDirective
  extends AbstractControlDirective
  implements ControlContainer, NgControl, OnInit, OnDestroy
{
  /**
   * @description
   * Tracks the name of the `NgModelGroup` bound to the directive. The name corresponds
   * to a key in the parent `NgForm`.
   */
  @Input('ngFieldArray') name: string = '';
  valueAccessor: ControlValueAccessor | null;
  form: FormArray<any>;

  _parent: ControlContainer;
  _rawValidators!: (Validator | ValidatorFn)[];
  _rawAsyncValidators!: (AsyncValidator | AsyncValidatorFn)[];
  _composedValidator!: ValidatorFn | null;
  _composedAsyncValidator!: AsyncValidatorFn | null;
  _onDisabledChange = (_: boolean) => {};
  _onChange = (_: any) => {};
  _onCollectionChange = (_: any) => {};

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
    super();

    this._parent = parent;

    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);
    this.valueAccessor = selectValueAccessor(this, valueAccessors);

    this.form = new FormArray<any>([]);
    this.form.setValidators(this._composedValidator);
    this.form.setAsyncValidators(this._composedAsyncValidator);

    this.form.setParent(this.formDirective.form);
  }

  ngOnInit(): void {
    if(this.formDirective instanceof NgForm) {
      this.formDirective.form.addControl(this.name, this.form);
    } else if(this.formDirective instanceof FieldGroupDirective) {
      this.formDirective.addControl(this);
    } else if(this.formDirective instanceof FieldArrayDirective) {
      this.formDirective.addControl(this);
    }
  }

  ngOnDestroy(): void {
    this.form.clear();
    if (this.formDirective) {
      this.formDirective.removeControl(this);
    }
  }

  viewToModelUpdate(value: any): void {
    throw new Error('Method not implemented.');
  }

  /**
   * @description
   * Returns an array that represents the path from the top-level form to this control.
   * Each index is the string name of the control on that level.
   */
  override get path(): string[] {
    return [...this._parent.path!, this.name!.toString()];
  }

  override get control(): AbstractControl<any, any> | null {
    return this.form;
  }

  override set control(control: AbstractControl<any, any> | null) {
    this.form = control as FormArray<any>;
  }

  get formDirective(): any {
    return this._parent;
  }

  addControl(control: any): void {
    this.form.controls.push(control.form);
  }

  removeControl(control: any): void {
    this.form.controls = this.form.controls.filter((item) => item !== control.form);
  }

  registerOnChange(fn: () => void): void {
    this.form.valueChanges.subscribe(fn);
  }

  /**
   * Sets synchronous validators for this directive.
   * @internal
   */
  _setValidators(validators: Array<Validator | ValidatorFn> | undefined): void {
    this._rawValidators = validators || [];
    this._composedValidator = composeValidators(this._rawValidators);
  }

  /**
   * Sets asynchronous validators for this directive.
   * @internal
   */
  _setAsyncValidators(
    validators: Array<AsyncValidator | AsyncValidatorFn> | undefined
  ): void {
    this._rawAsyncValidators = validators || [];
    this._composedAsyncValidator = composeAsyncValidators(
      this._rawAsyncValidators
    );
  }
}
