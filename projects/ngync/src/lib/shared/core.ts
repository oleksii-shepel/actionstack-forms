import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  Injector,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormControlStatus, FormGroupDirective, NgForm } from '@angular/forms';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  first,
  map,
  repeat,
  takeWhile,
  tap,
} from 'rxjs';
import {
  DomObserver,
  NGYNC_CONFIG_DEFAULT,
  NGYNC_CONFIG_TOKEN,
  checkForm,
  deepEqual,
  getSlice,
  setValue,
} from '.';
import {
  ResetForm,
  SubmittedUpdated,
  UpdateDirty,
  UpdateErrors,
  UpdateStatus,
  UpdateSubmitted,
  UpdateValue,
} from './actions';

@Directive({
  selector:
    'form:not([ngNoForm]):not([formGroup])[ngync],ng-form[ngync],[ngForm][ngync],[formGroup][ngync]',
  exportAs: 'ngync',
})
export class SyncDirective implements OnInit, OnDestroy, AfterViewInit {
  @Input('ngync') slice!: string;

  debounce!: number;
  clearOnDestroy!: boolean;
  updateOn!: string;

  dir: NgForm | FormGroupDirective;
  cdr: ChangeDetectorRef;
  elRef: ElementRef<any>;

  _initialState: any;
  _submittedState: any;

  _unmounted$ = new BehaviorSubject<boolean>(false);
  _blur$ = new BehaviorSubject<boolean>(false);
  _submitted$ = new BehaviorSubject<boolean>(false);
  _input$ = new BehaviorSubject<boolean>(false);
  _initialized = false;
  _updating = false;
  _subs = {} as any;

  _blurCallback = () => this._blur$.next(true);
  _inputCallback = () => {
    this._input$.next(true);
  };

  constructor(
    public injector: Injector,
    public store: Store,
    public actions$: Actions
  ) {
    this.dir =
      injector.get(FormGroupDirective, null) ??
      (injector.get(NgForm, null) as any);
    this.cdr = injector.get(ChangeDetectorRef);
    this.elRef = injector.get(ElementRef<HTMLFormElement>);

    let config = injector.get<any>(NGYNC_CONFIG_TOKEN, NGYNC_CONFIG_DEFAULT);

    this.debounce = config.debounce;
    this.clearOnDestroy = config.clearOnDestroy;
    this.updateOn = config.updateOn;
  }

  ngOnInit() {
    if (!this.slice) {
      throw new Error('Misuse of this directive');
    }

    if (!this.dir) {
      throw new Error('Supported form control directive not found');
    }

    this._subs.a = createEffect(() =>
      this.actions$.pipe(
        ofType(UpdateSubmitted),
        map((state) => !!state),
        takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)),
        tap((state) => this._submitted$.next(state)),
        map((state) => SubmittedUpdated())
      )
    ).subscribe();

    this._subs.b = combineLatest([this._input$, this._blur$, this._submitted$])
      .pipe(
        takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)),
        filter(() => this._initialized),
        tap((values) => {
          if (!this._updating) {
            this._updating = true;
            let formValue = this.formValue;
            let equal = deepEqual(formValue, this._submittedState?.model);
            if (
              this.updateOn === 'change' ||
              (this.updateOn === 'blur' && values[1] === true) ||
              (this.updateOn === 'submit' && values[2] === true)
            ) {
              this.store.dispatch(
                UpdateValue({
                  path: this.slice,
                  value: formValue,
                })
              );

              this.store.dispatch(
                UpdateDirty({
                  path: this.slice,
                  dirty: !equal,
                })
              );

              this.store.dispatch(
                UpdateErrors({
                  path: this.slice,
                  errors: this.dir.errors,
                })
              );

              this.store.dispatch(
                UpdateStatus({
                  path: this.slice,
                  status: this.dir.status,
                })
              );

              this.dir.form.updateValueAndValidity();
              this.cdr.markForCheck();
            }

            if (
              this.updateOn === 'change' ||
              (this.updateOn === 'blur' && values[1] === true)
            ) {
              if (equal) {
                this.dir.form.markAsPristine();
                this.dir.form.updateValueAndValidity();
                this.cdr.markForCheck();
              }

              this.store.dispatch(
                UpdateSubmitted({
                  path: this.slice,
                  value: equal,
                })
              );
            }

            if (values[1] === true) {
              this._blur$.next(false);
            }

            if (values[2] === true) {
              this._submittedState = {
                model: formValue,
                errors: this.dir.errors,
                dirty: !equal,
                status: this.dir.status,
                submitted: true,
              };
              this._submitted$.next(false);
            }

            this.cdr.markForCheck();
            this._updating = false;
          }
        })
      )
      .subscribe();

    this._subs.c = this.store
      .select(getSlice(this.slice))
      .pipe(
        first(),
        filter((state) => state?.model),
        repeat({ count: 10, delay: 0 }),
        tap((state) => this.dir.form.patchValue(state.model)),
        filter((state) => checkForm(this.dir.form, state.model)),
        takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)),
        takeWhile(() => !this._initialized)
      )
      .subscribe((state) => {
        if (!this._updating) {
          this._updating = true;
          this._initialized = true;
          this.dir.form.markAsPristine();
          this.cdr.markForCheck();
          this._initialState = state;
          this._updating = false;

          if (this.dir instanceof NgForm) {
            this.formInitialized();
          }
        }
      });
  }
  ngAfterViewInit() {
    if (this.dir instanceof FormGroupDirective) {
      this.formInitialized();
    }
  }

  ngOnDestroy() {
    if (this.clearOnDestroy) {
      this.store.dispatch(ResetForm({ value: {}, path: this.slice }));
    }

    for (const element of this.nativeElements) {
      element.removeEventListener('blur', this._blurCallback);
      element.removeEventListener('input', this._inputCallback);
    }

    for (const sub of Object.keys(this._subs)) {
      this._subs[sub].unsubscribe();
    }

    this._blur$.complete();
    this._input$.complete();
    this._submitted$.complete();
  }

  ngOnComponentUnmounted() {
    this._unmounted$.next(true);
    this._unmounted$.complete();
  }

  formInitialized() {
    for (const element of this.nativeElements) {
      element.addEventListener('blur', this._blurCallback);
      element.addEventListener('input', this._inputCallback);
    }
  }

  get nativeElements() {
    let directives: any =
      this.dir instanceof FormGroupDirective
        ? this.dir.directives
        : (this.dir as any)._directives;
    return {
      [Symbol.iterator]: function* () {
        for (const directive of directives) {
          let nativeElement =
            directive.valueAccessor?._elementRef?.nativeElement;
          if (nativeElement) {
            yield nativeElement;
          }
        }
      },
    };
  }

  get formValue(): any {
    let directives: any =
      this.dir instanceof FormGroupDirective
        ? this.dir.directives
        : (this.dir as any)._directives;
    let value = {} as any;
    for (const directive of directives) {
      let native = directive.valueAccessor?._elementRef?.nativeElement;
      if (native) {
        value = setValue(value, directive.path.join('.'), native.value);
      }
    }
    return value;
  }

  get formStatus(): FormControlStatus {
    this.dir.form.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    return this.dir.form.status;
  }
}
