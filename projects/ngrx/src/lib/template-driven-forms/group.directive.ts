/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

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

import { AbstractFormGroupDirective, AsyncValidator, AsyncValidatorFn, ControlContainer, ControlValueAccessor, NG_ASYNC_VALIDATORS, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator, ValidatorFn } from '@angular/forms';
import { selectValueAccessor } from '../shared/accessors';
import { composeAsyncValidators, composeValidators } from '../shared';

const formGroupNameProvider: Provider = {
  provide: ControlContainer,
  useExisting: forwardRef(() => FieldGroupDirective),
};

/**
 * @description
 *
 * Syncs a nested `FormGroup` or `FormRecord` to a DOM element.
 *
 * This directive can only be used with a parent `FormGroupDirective`.
 *
 * It accepts the string name of the nested `FormGroup` or `FormRecord` to link, and
 * looks for a `FormGroup` or `FormRecord` registered with that name in the parent
 * `FormGroup` instance you passed into `FormGroupDirective`.
 *
 * Use nested form groups to validate a sub-group of a
 * form separately from the rest or to group the values of certain
 * controls into their own nested object.
 *
 * @see [Reactive Forms Guide](guide/reactive-forms)
 *
 * @usageNotes
 *
 * ### Access the group by name
 *
 * The following example uses the `AbstractControl.get` method to access the
 * associated `FormGroup`
 *
 * ```ts
 *   this.form.get('name');
 * ```
 *
 * ### Access individual controls in the group
 *
 * The following example uses the `AbstractControl.get` method to access
 * individual controls within the group using dot syntax.
 *
 * ```ts
 *   this.form.get('name.first');
 * ```
 *
 * ### Register a nested `FormGroup`.
 *
 * The following example registers a nested *name* `FormGroup` within an existing `FormGroup`,
 * and provides methods to retrieve the nested `FormGroup` and individual controls.
 *
 * {@example forms/ts/nestedFormGroup/nested_form_group_example.ts region='Component'}
 *
 * @ngModule ReactiveFormsModule
 * @publicApi
 */

@Directive({selector: '[ngFieldGroup]', providers: [
    formGroupNameProvider,
  ],
   exportAs: 'ngFieldGroup'})
export class FieldGroupDirective extends AbstractFormGroupDirective implements OnInit, OnDestroy {
  /**
   * @description
   * Tracks the name of the `NgModelGroup` bound to the directive. The name corresponds
   * to a key in the parent `NgForm`.
   */
  @Input('ngFieldGroup') override name: string = '';
  _parent: ControlContainer;
  _rawValidators!: (Validator | ValidatorFn)[];
  _rawAsyncValidators!: (AsyncValidator | AsyncValidatorFn)[];
  _composedValidator!: ValidatorFn | null;
  _composedAsyncValidator!: AsyncValidatorFn | null;
  valueAccessor: ControlValueAccessor | null;

  constructor(
      @Host() @SkipSelf() parent: ControlContainer,
      @Optional() @Self() @Inject(NG_VALIDATORS) validators: (Validator|ValidatorFn)[],
      @Optional() @Self() @Inject(NG_ASYNC_VALIDATORS) asyncValidators: (AsyncValidator|AsyncValidatorFn)[],
      @Optional() @Self() @Inject(NG_VALUE_ACCESSOR) valueAccessors: ControlValueAccessor[]) {
    super();
    this._parent = parent;
    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);
    this.valueAccessor = selectValueAccessor(this, valueAccessors);
  }

  addControl(control: any): void {
    this.formDirective!.addControl(control);
  }

  removeControl(control: any): void {
    this.formDirective!.removeControl(control);}

  /**
   * Sets synchronous validators for this directive.
   * @internal
   */
  _setValidators(validators: Array<Validator|ValidatorFn>|undefined): void {
    this._rawValidators = validators || [];
    this._composedValidator = composeValidators(this._rawValidators);
  }

  /**
   * Sets asynchronous validators for this directive.
   * @internal
   */
  _setAsyncValidators(validators: Array<AsyncValidator|AsyncValidatorFn>|undefined): void {
    this._rawAsyncValidators = validators || [];
    this._composedAsyncValidator = composeAsyncValidators(this._rawAsyncValidators);
  }
}
