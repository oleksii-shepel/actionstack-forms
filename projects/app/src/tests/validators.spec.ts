import { fakeAsync, tick } from '@angular/core/testing';
import {
  AbstractControl, AsyncValidator,
  AsyncValidatorFn,
  FormControl,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import { first } from 'rxjs/operators';

import { GenericValidatorFn, composeAsyncValidators, composeValidators, executeValidators, isPromise, isValidatorFn, mergeErrors, mergeValidators, normalizeValidators, toObservable } from '../app/utils/validators';

function validator(key: string, error: any): ValidatorFn {
  return (c: AbstractControl) => {
    const r: ValidationErrors = {};
    r[key] = error;
    return r;
  };
}

class AsyncValidatorDirective implements AsyncValidator {
  constructor(private expected: string, private error: any) {}

  validate(c: any): Observable<ValidationErrors> {
    return new Observable((obs: any) => {
      const error = this.expected !== c.value ? this.error : null;
      obs.next(error);
      obs.complete();
    });
  }
}

describe('Validators', () => {
  describe('compose', () => {
    it('should return null when given null', () => {
      expect(Validators.compose(null!)).toBe(null);
    });

    it('should collect errors from all the validators', () => {
      const c = Validators.compose([
        validator('a', true),
        validator('b', true),
      ])!;
      expect(c(new FormControl(''))).toEqual({ a: true, b: true });
    });

    it('should run validators left to right', () => {
      const c = Validators.compose([validator('a', 1), validator('a', 2)])!;
      expect(c(new FormControl(''))).toEqual({ a: 2 });
    });

    it('should return null when no errors', () => {
      const c = Validators.compose([
        Validators.nullValidator,
        Validators.nullValidator,
      ])!;
      expect(c(new FormControl(''))).toBeNull();
    });

    it('should ignore nulls', () => {
      const c = Validators.compose([null!, Validators.required])!;
      expect(c(new FormControl(''))).toEqual({ required: true });
    });
  });

  describe('composeAsync', () => {
    describe('promises', () => {
      function promiseValidator(response: {
        [key: string]: any;
      }): AsyncValidatorFn {
        return (c: AbstractControl) => {
          const res = c.value != 'expected' ? response : null;
          return Promise.resolve(res);
        };
      }

      it('should return null when given null', () => {
        expect(Validators.composeAsync(null!)).toBeNull();
      });

      it('should collect errors from all the validators', fakeAsync(() => {
        const v = Validators.composeAsync([
          promiseValidator({ one: true }),
          promiseValidator({ two: true }),
        ])!;

        let errorMap: { [key: string]: any } | null = null;
        (v(new FormControl('invalid')) as Observable<ValidationErrors | null>)
          .pipe(first())
          .subscribe(
            (errors: { [key: string]: any } | null) => (errorMap = errors)
          );
        tick();

        expect(errorMap!).toEqual({ one: true, two: true });
      }));

      it('should normalize and evaluate async validator-directives correctly', fakeAsync(() => {
        const normalizedValidators = normalizeValidators<AsyncValidatorFn>([
          new AsyncValidatorDirective('expected', { one: true }),
        ]);
        const validatorFn = Validators.composeAsync(normalizedValidators)!;

        let errorMap: { [key: string]: any } | null = null;
        (
          validatorFn(
            new FormControl('invalid')
          ) as Observable<ValidationErrors | null>
        )
          .pipe(first())
          .subscribe(
            (errors: { [key: string]: any } | null) => (errorMap = errors)
          );
        tick();

        expect(errorMap!).toEqual({ one: true });
      }));

      it('should return null when no errors', fakeAsync(() => {
        const v = Validators.composeAsync([promiseValidator({ one: true })])!;

        let errorMap: { [key: string]: any } | null = undefined!;
        (v(new FormControl('expected')) as Observable<ValidationErrors | null>)
          .pipe(first())
          .subscribe(
            (errors: { [key: string]: any } | null) => (errorMap = errors)
          );
        tick();

        expect(errorMap).toBeNull();
      }));

      it('should ignore nulls', fakeAsync(() => {
        const v = Validators.composeAsync([
          promiseValidator({ one: true }),
          null!,
        ])!;

        let errorMap: { [key: string]: any } | null = null;
        (v(new FormControl('invalid')) as Observable<ValidationErrors | null>)
          .pipe(first())
          .subscribe(
            (errors: { [key: string]: any } | null) => (errorMap = errors)
          );
        tick();

        expect(errorMap!).toEqual({ one: true });
      }));
    });

    describe('observables', () => {
      function observableValidator(response: {
        [key: string]: any;
      }): AsyncValidatorFn {
        return (c: AbstractControl) => {
          const res = c.value != 'expected' ? response : null;
          return of(res);
        };
      }

      it('should return null when given null', () => {
        expect(Validators.composeAsync(null!)).toBeNull();
      });

      it('should collect errors from all the validators', () => {
        const v = Validators.composeAsync([
          observableValidator({ one: true }),
          observableValidator({ two: true }),
        ])!;

        let errorMap: { [key: string]: any } | null = null;
        (v(new FormControl('invalid')) as Observable<ValidationErrors | null>)
          .pipe(first())
          .subscribe(
            (errors: { [key: string]: any } | null) => (errorMap = errors)
          );

        expect(errorMap!).toEqual({ one: true, two: true });
      });

      it('should normalize and evaluate async validator-directives correctly', () => {
        const normalizedValidators = normalizeValidators<AsyncValidatorFn>([
          new AsyncValidatorDirective('expected', { one: true }),
        ]);
        const validatorFn = Validators.composeAsync(normalizedValidators)!;

        let errorMap: { [key: string]: any } | null = null;
        (
          validatorFn(
            new FormControl('invalid')
          ) as Observable<ValidationErrors | null>
        )
          .pipe(first())
          .subscribe(
            (errors: { [key: string]: any } | null) => (errorMap = errors)
          )!;

        expect(errorMap!).toEqual({ one: true });
      });

      it('should return null when no errors', () => {
        const v = Validators.composeAsync([
          observableValidator({ one: true }),
        ])!;

        let errorMap: { [key: string]: any } | null = undefined!;
        (v(new FormControl('expected')) as Observable<ValidationErrors | null>)
          .pipe(first())
          .subscribe(
            (errors: { [key: string]: any } | null) => (errorMap = errors)
          );

        expect(errorMap).toBeNull();
      });

      it('should ignore nulls', () => {
        const v = Validators.composeAsync([
          observableValidator({ one: true }),
          null!,
        ])!;

        let errorMap: { [key: string]: any } | null = null;
        (v(new FormControl('invalid')) as Observable<ValidationErrors | null>)
          .pipe(first())
          .subscribe(
            (errors: { [key: string]: any } | null) => (errorMap = errors)
          );

        expect(errorMap!).toEqual({ one: true });
      });
    });
  });
  describe('composeValidators', () => {
    it('should compose functions', () => {
      const dummy1 = () => ({'dummy1': true});
      const dummy2 = () => ({'dummy2': true});
      const v = composeValidators([dummy1, dummy2])!;
      expect(v(new FormControl(''))).toEqual({'dummy1': true, 'dummy2': true});
    });
    it('should compose functions and validators', () => {
      const dummy1 = () => ({'dummy1': true});
      const v = composeValidators([dummy1, Validators.required])!;
      expect(v(new FormControl(''))).toEqual({'dummy1': true, 'required': true});
    });
  });
  describe('composeAsyncValidators', () => {
    it('should compose functions', fakeAsync(() => {
      const dummy1 = () => Promise.resolve({'dummy1': true});
      const dummy2 = () => Promise.resolve({'dummy2': true});
      const v = composeAsyncValidators([dummy1, dummy2])!;
      let errorMap: ValidationErrors|null = null;
      (v(new FormControl('')) as Observable<ValidationErrors|null>)
          .pipe(first())
          .subscribe((errors: ValidationErrors|null) => errorMap = errors);
      tick();
      expect(errorMap).toEqual({'dummy1': true, 'dummy2': true});
    }));
    it('should compose functions and validators', fakeAsync(() => {
      const dummy1 = () => Promise.resolve({'dummy1': true});
      const v = composeAsyncValidators([dummy1])!;
      let errorMap: ValidationErrors|null = null;
      (v(new FormControl('')) as Observable<ValidationErrors|null>)
          .pipe(first())
          .subscribe((errors: ValidationErrors|null) => errorMap = errors);
      tick();
      expect(errorMap).toEqual({'dummy1': true});
    }));
  });
  describe('isValidatorFn', () => {
    it('should return true for a validator function', () => {
      const dummy1 = {validate: () => {}};
      expect(isValidatorFn(dummy1)).toBe(false);
    });
    it('should return true for a validator function', () => {
      const dummy1 = () => {};
      expect(isValidatorFn(dummy1)).toBe(true);
    });
  });
  describe('executeValidators', () => {
    it('should execute a validator function', () => {
      const dummy1: GenericValidatorFn = (control: AbstractControl) => ({'dummy1': true});
      expect(executeValidators(new FormControl(''), [dummy1])).toEqual([{'dummy1': true}]);
    });
    it('should execute a validator', () => {
      expect(executeValidators(new FormControl(''), [Validators.required])).toEqual([{'required': true}]);
    });
  });
  describe('mergeErrors', () => {
    it('should merge errors', () => {
      expect(mergeErrors([{'dummy1': true}, {'dummy2': true}])).toEqual({'dummy1': true, 'dummy2': true});
    });
  });
  describe('toObservable', () => {
    it('should convert a promise to an observable', fakeAsync(() => {
      const promise = Promise.resolve({'dummy1': true});
      let errorMap: ValidationErrors|null = null;
      toObservable(promise).subscribe((errors: ValidationErrors|null) => errorMap = errors);
      tick();
      expect(errorMap).toEqual({'dummy1': true});
    }));
    it('should interpret observable as observable', fakeAsync(() => {
      let errorMap: ValidationErrors|null = null;
      toObservable(of({'dummy1': true})).subscribe((errors: ValidationErrors|null) => errorMap = errors);
      tick();
      expect(errorMap).toEqual({'dummy1': true});
    }));
  });
  describe('isPromise', () => {
    it('should return true for a promise', () => {
      expect(isPromise(Promise.resolve())).toBe(true);
    });
    it('should return false for a non-promise', () => {
      expect(isPromise({'dummy1': true})).toBe(false);
    });
  });
  describe('mergeValidators', () => {
    it('should merge validators', () => {
      const dummy1 = () => ({'dummy1': true});
      const dummy2 = () => ({'dummy2': true});
      const v = mergeValidators([dummy1, dummy2], Validators.required)!;
      expect(executeValidators(new FormControl(''), v).reduce((prev, curr) => prev = Object.assign(prev as any, curr), {})).toEqual({'dummy1': true, 'dummy2': true, required: true});
    });
    it('should merge validators and validator', () => {
      const dummy1 = () => ({'dummy1': true});
      const dummy2 = () => ({'dummy2': true});
      const v = mergeValidators([dummy1, Validators.required], dummy2)!;
      expect(executeValidators(new FormControl(''), v).reduce((prev, curr) => prev = Object.assign(prev as any, curr), {})).toEqual({'dummy1': true, 'required': true, 'dummy2': true});
    });
  });
});
