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
  NgModel,
  Validator,
  ValidatorFn,
} from '@angular/forms';
import {
  composeAsyncValidators,
  composeValidators,
  mergeValidators,
  selectValueAccessor,
} from '../shared';

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
  fa: FormArray<any>;

  _parent: ControlContainer;
  _rawValidators!: (Validator | ValidatorFn)[];
  _rawAsyncValidators!: (AsyncValidator | AsyncValidatorFn)[];
  _composedValidator!: ValidatorFn | null;
  _composedAsyncValidator!: AsyncValidatorFn | null;

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

    this.fa = new FormArray<any>([]);
    this.fa.setValidators(this._composedValidator);
    this.fa.setAsyncValidators(this._composedAsyncValidator);

    this.fa.setParent(this.formDirective.form);

    Object.assign(NgModel.prototype, {
      _checkParentType() {}
    })

    Object.assign(this.fa, {
      registerControl: (name: string, control: any): AbstractControl => {
        control.setParent(this.control);
        (this.control! as FormArray).push(control);

        control._registerOnCollectionChange((this.control as any)._onCollectionChange);
        return control;
      }
    }, {
      registerOnChange: (fn: (_: any) => {}) => {
        this.control.controls.forEach((control: any) => {
          if(control.hasOwnProperty('_onChange')) {
            (control as any)['_onChange'].push(fn);
          }
        });
      }
    }, {
      registerOnDisabledChange: (fn: (_: boolean) => {}) => {
        if(this.control.hasOwnProperty('_onDisabledChange')) {
          (this.control as any)['_onDisabledChange'].push(fn);
        }
      }
    }, {
      addControl: (name: string, control: any, options: {
        emitEvent?: boolean
      } = {}) => {
        (this.control as any).registerControl(name, control);
        (this.control as FormArray).updateValueAndValidity(options);
        (this.control as any)._onCollectionChange();
      }
    }, {
      contains: (name: string) => {
        return this.control!.hasOwnProperty(name) && (this.control as any)[name].enabled;
      }
    }, {
      removeControl: (name: string, options: {emitEvent?: boolean} = {}) => {
        if ((this.control as any)[name])
        (this.control as any)[name]._registerOnCollectionChange(() => {});
        (this.control as FormArray).removeAt(+name);
        this.control!.updateValueAndValidity(options);
        (this.control as any)._onCollectionChange();
      }
    })
  }

  ngOnInit(): void {
    this.formDirective.addControl(this);
  }

  ngOnDestroy(): void {
    this.control.disable();
    this.control.clear();
    if (this.formDirective) {
      this.formDirective.removeControl(this);
    }
  }

  viewToModelUpdate(value: any): void {
    Function.prototype
  }

  override get path(): string[] {
    return [...this._parent.path!, this.name!.toString()];
  }

  get directives(): Set<NgModel> {
    let container = this.formDirective;
    while(!(container instanceof NgForm)) {
      container = container.formDirective;
    }
    return container['_directives'];
  }

  override get control(): any {
    return this.fa;
  }

  override set control(value: FormArray<any>) {
    this.fa = value;
  }

  get formDirective(): any {
    return this._parent;
  }

  addControl(control: NgModel): void {
    if(this.control.controls.includes(control.control)) return;
    this.control.controls.push(control.control);
  }

  removeControl(control: NgModel): void {
    this.control.controls = this.control.controls.filter((item: any) => item !== control.control);
  }

  registerOnChange(fn: () => void): void {
    this.control.valueChanges.subscribe(fn);
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
