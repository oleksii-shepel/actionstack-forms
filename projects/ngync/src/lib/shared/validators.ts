import { AbstractControl, AsyncValidator, AsyncValidatorFn, ValidationErrors, Validator, ValidatorFn } from "@angular/forms";
import { Observable, forkJoin, map, from, isObservable } from "rxjs";
/**
 * Accepts a list of validators of different possible shapes (`Validator` and `ValidatorFn`),
 * normalizes the list (converts everything to `ValidatorFn`) and merges them into a single
 * validator function.
 */
export function composeValidators(
  validators: Array<Validator | ValidatorFn>
): ValidatorFn | null {
  return validators != null
    ? compose(normalizeValidators<ValidatorFn>(validators))
    : null;
}

/**
 * Given the list of validators that may contain both functions as well as classes, return the list
 * of validator functions (convert validator classes into validator functions). This is needed to
 * have consistent structure in validators list before composing them.
 *
 * @param validators The set of validators that may contain validators both in plain function form
 *     as well as represented as a validator class.
 */
export function normalizeValidators<V>(
  validators: (V | Validator | AsyncValidator)[]
): V[] {
  return validators.map((validator) => {
    return isValidatorFn<V>(validator)
      ? validator
      : (((c: AbstractControl) => validator.validate(c)) as unknown as V);
  });
}

export function isValidatorFn<V>(
  validator: V | Validator | AsyncValidator
): validator is V {
  return !(validator as Validator).validate;
}

/**
 * Merges synchronous validators into a single validator function.
 * See `Validators.compose` for additional information.
 */
export function compose(
  validators: (ValidatorFn | null | undefined)[] | null
): ValidatorFn | null {
  if (!validators) return null;
  const presentValidators: ValidatorFn[] = validators.filter(isPresent) as any;
  if (presentValidators.length == 0) return null;

  return function (control: AbstractControl) {
    return mergeErrors(
      executeValidators<ValidatorFn>(control, presentValidators)
    );
  };
}

export function isPresent(o: any): boolean {
  return o != null;
}

export type GenericValidatorFn = (control: AbstractControl) => any;

export function executeValidators<V extends GenericValidatorFn>(
  control: AbstractControl,
  validators: V[]
): ReturnType<V>[] {
  return validators.map((validator) => validator(control));
}

export function mergeErrors(
  arrayOfErrors: (ValidationErrors | null)[]
): ValidationErrors | null {
  let res: { [key: string]: any } = {};
  arrayOfErrors.forEach((errors: ValidationErrors | null) => {
    res = errors != null ? { ...res!, ...errors } : res!;
  });

  return Object.keys(res).length === 0 ? null : res;
}

/**
 * Accepts a list of async validators of different possible shapes (`AsyncValidator` and
 * `AsyncValidatorFn`), normalizes the list (converts everything to `AsyncValidatorFn`) and merges
 * them into a single validator function.
 */
export function composeAsyncValidators(
  validators: Array<AsyncValidator | AsyncValidatorFn>
): AsyncValidatorFn | null {
  return validators != null
    ? composeAsync(normalizeValidators<AsyncValidatorFn>(validators))
    : null;
}

/**
 * Merges asynchronous validators into a single validator function.
 * See `Validators.composeAsync` for additional information.
 */
export function composeAsync(
  validators: (AsyncValidatorFn | null)[]
): AsyncValidatorFn | null {
  if (!validators) return null;
  const presentValidators: AsyncValidatorFn[] = validators.filter(
    isPresent
  ) as any;
  if (presentValidators.length == 0) return null;

  return function (control: AbstractControl) {
    const observables = executeValidators<AsyncValidatorFn>(
      control,
      presentValidators
    ).map(toObservable);
    return forkJoin(observables).pipe(map(mergeErrors));
  };
}

export function toObservable(value: any): Observable<any> {
  const obs = isPromise(value) ? from(value) : value;
  if (!isObservable(obs)) {
    let errorMessage = `Expected async validator to return Promise or Observable.`;
    // A synchronous validator will return object or null.
    if (typeof value === 'object') {
      errorMessage +=
          ' Are you using a synchronous validator where an async validator is expected?';
    }
    throw new Error(errorMessage);
  }
  return obs;
}

/**
 * Determine if the argument is shaped like a Promise
 */
export function isPromise<T = any>(obj: any): obj is Promise<T> {
  // allow any Promise/A+ compliant thenable.
  // It's up to the caller to ensure that obj.then conforms to the spec
  return !!obj && typeof obj.then === 'function';
}

/**
 * Merges raw control validators with a given directive validator and returns the combined list of
 * validators as an array.
 */
export function mergeValidators<V>(controlValidators: V|V[]|null, dirValidator: V): V[] {
  if (controlValidators === null) return [dirValidator];
  return Array.isArray(controlValidators) ? [...controlValidators, dirValidator] :
                                            [controlValidators, dirValidator];
}
