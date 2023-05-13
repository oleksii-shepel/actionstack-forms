import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  Host,
  Inject,
  InjectionToken,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  Renderer2,
  Self,
  SimpleChanges,
} from '@angular/core';
import { DefaultValueAccessor, FormControl } from '@angular/forms';

import {
  AbstractControlDirective,
  AsyncValidator,
  AsyncValidatorFn,
  ControlContainer,
  ControlValueAccessor,
  NG_ASYNC_VALIDATORS,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  Validator,
  ValidatorFn
} from '@angular/forms';
import { composeAsyncValidators, composeValidators } from './validators';
import { selectValueAccessor } from './accessors';

/**
 * Token to provide to allow SetDisabledState to always be called when a CVA is added, regardless of
 * whether the control is disabled or enabled.
 *
 * @see `FormsModule.withConfig`
 */
export const CALL_SET_DISABLED_STATE = new InjectionToken(
  'CallSetDisabledState',
  { providedIn: 'root', factory: () => setDisabledStateDefault }
);

/**
 * The type for CALL_SET_DISABLED_STATE. If `always`, then ControlValueAccessor will always call
 * `setDisabledState` when attached, which is the most correct behavior. Otherwise, it will only be
 * called when disabled, which is the legacy behavior for compatibility.
 *
 * @publicApi
 * @see `FormsModule.withConfig`
 */
export type SetDisabledStateOption = 'whenDisabledForLegacyCode' | 'always';

/**
 * Whether to use the fixed setDisabledState behavior by default.
 */
export const setDisabledStateDefault: SetDisabledStateOption = 'always';


@Directive({
  selector: '[ngField]:not([formControlName]):not([formControl])',
  exportAs: 'ngField',
})
export class NgField
  extends AbstractControlDirective
  implements OnChanges, OnDestroy
{
  @Input('ngField') field!: string;
  private _parent: ControlContainer;
  private _rawValidators: (Validator | ValidatorFn)[];
  private _rawAsyncValidators: (AsyncValidator | AsyncValidatorFn)[];
  private _valueAccessor: any;
  private _composedValidator: ValidatorFn | null;
  private _composedAsyncValidator: AsyncValidatorFn | null;
  public override readonly control: FormControl = new FormControl();

  constructor(
    @Optional() @Host() parent: ControlContainer,
    @Optional() @Self() @Inject(NG_VALIDATORS) validators: (Validator | ValidatorFn)[],
    @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) asyncValidators: (AsyncValidator | AsyncValidatorFn)[],
    @Optional() @Self() @Inject(NG_VALUE_ACCESSOR) valueAccessors: ControlValueAccessor[],
    @Optional() @Inject(ChangeDetectorRef) _changeDetectorRef?: ChangeDetectorRef | null,
    @Optional() @Inject(CALL_SET_DISABLED_STATE) callSetDisabledState?: SetDisabledStateOption
  ) {
    super();
    this._parent = parent;
    this._rawValidators = validators || [];
    this._composedValidator = composeValidators(this._rawValidators);
    this._rawAsyncValidators = asyncValidators || [];
    this._composedAsyncValidator = composeAsyncValidators(
      this._rawAsyncValidators
    );
    this._valueAccessor = selectValueAccessor(this, valueAccessors);
  }

  /** @nodoc */
  ngOnDestroy(): void {
    this.formDirective && this.formDirective.removeControl(this);
  }

  /**
   * @description
   * The top-level directive for this control if present, otherwise null.
   */
  get formDirective(): any {
    return this._parent ? this._parent.formDirective : null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    Function.prototype
  }
}
