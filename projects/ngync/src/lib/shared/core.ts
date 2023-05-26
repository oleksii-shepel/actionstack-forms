import { AfterViewInit, ChangeDetectorRef, Directive, ElementRef, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControlStatus, FormGroupDirective, NgForm } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, combineLatest, debounceTime, distinctUntilChanged, filter, first, repeat, startWith, takeUntil, takeWhile, tap } from 'rxjs';
import { DomObserver, NGYNC_CONFIG_DEFAULT, NGYNC_CONFIG_TOKEN, deepClone, deepEqual, getSlice, setValue } from '.';
import { checkForm } from '../shared';
import { ResetForm, UpdateDirty, UpdateErrors, UpdateStatus, UpdateSubmitted, UpdateValue } from './actions';

export interface SyncDirectiveOptions {
  slice: string;
  debounce?: number;
  clearOnDestroy?: boolean;
  updateOn?: 'blur' | 'change' | 'submit';
}

@Directive({
  selector: 'form:not([ngNoForm]):not([formGroup])[ngync],ng-form[ngync],[ngForm][ngync],[formGroup][ngync]'
})
export class SyncDirective implements OnInit, OnDestroy, AfterViewInit {
  @Input('ngync') slice!: string;

  debounce!: number;
  clearOnDestroy!: boolean;
  updateOn!: string;

  dir!: NgForm | FormGroupDirective;

  private _initialState: any;
  private _submittedState: any;

  private _unmounted$ = new Subject<boolean>();
  private _blur$ = new Subject<boolean>();
  private _submitted$ = new Subject<boolean>();
  private _input$ = new Subject<any>();
  private _status$ = new Subject<FormControlStatus>();
  private _initialized = false;
  private _updating = false;
  private _subs = {} as any;

  private _blurCallback = () => this._blur$.next(true);
  private _inputCallback = () =>  { this._input$.next(this.formValue); this._status$.next(this.formStatus);}

  constructor(
    public injector: Injector,
    public store: Store,
    public cdr: ChangeDetectorRef,
    public elRef: ElementRef<HTMLFormElement>,
    public actions$: Actions
  ) {

    this.dir = injector.get(FormGroupDirective, null) ?? injector.get(NgForm, null) as any;
    let config = injector.get<any>(NGYNC_CONFIG_TOKEN, NGYNC_CONFIG_DEFAULT);

    this.debounce = config.debounce;
    this.clearOnDestroy = config.clearOnDestroy;
    this.updateOn = config.updateOn;
  }

  ngOnInit() {
    if(!this.slice) {
      throw new Error("Misuse of sync directive");
    }

    if(!this.dir) {
      throw new Error("Supported form control directive not found");
    }

  this._subs.a = combineLatest([this._input$.pipe(distinctUntilChanged()), this._blur$.pipe(startWith(false)), this._submitted$.pipe(startWith(false))]).pipe(
      debounceTime(this.debounce),
      takeUntil(DomObserver.unmounted(this.elRef.nativeElement)),
      filter(() => this._initialized))
    .subscribe(values => {
      if(!this._updating) {
        this._updating = true;

        if(this.updateOn === 'change' || this.updateOn === 'blur' && values[1] === true || this.updateOn === 'submit' && values[2] === true) {
          this.store.dispatch(
            UpdateValue({
              path: this.slice,
              value: values[0]
            })
          );
        }

        this.store.dispatch(
          UpdateDirty({
            path: this.slice,
            dirty: !deepEqual(values[0], this._submittedState ?? this._initialState.model)
          })
        );

        this.store.dispatch(
          UpdateErrors({
            path: this.slice,
            errors: this.dir.errors
          })
        );

        if(values[2] === true) {
          this._submittedState = deepClone(values[0]);
          this.dir.form.markAsPristine();

        } else if(this._submittedState) {
          this.store.dispatch(
            UpdateSubmitted({
              path: this.slice,
              value: deepEqual(values[0], this._submittedState)
            })
          )
        }

        if(values[1] === true) {
          this._blur$.next(false);
        }

        if(values[2] === true) {
          this._submitted$.next(false);
        }

        this.cdr.markForCheck();
        this._updating = false;
      }
    });

  this._subs.b = combineLatest([this._status$.pipe(distinctUntilChanged()), this._blur$.pipe(startWith(false)), this._submitted$.pipe(startWith(false))]).pipe(
      debounceTime(this.debounce),
      takeUntil(DomObserver.unmounted(this.elRef.nativeElement)),
      filter(() => this._initialized))
    .subscribe(values => {
        if(!this._updating) {
          this._updating = true;

          if(this.updateOn === 'change' || this.updateOn === 'blur' && values[1] === true || this.updateOn === 'submit' && values[2] === true) {
            this.store.dispatch(
              UpdateStatus({
                path: this.slice,
                status: values[0]
              }));
          }
          this._updating = false;
        }
      });

    // check if state is present in the store and if so initialize the form
    this._subs.c = this.store.select(getSlice(this.slice)).pipe(
      first(),
      filter(state => state?.model),
      repeat({ count: 10, delay: 0 }),
      tap((state) => this.dir.form.patchValue(state.model)),
      filter((state) => checkForm(this.dir.form, state.model)),
      takeWhile(() => !this._initialized),
    ).subscribe((state) => {
      if (!this._updating) {
        this._updating = true;
        this._initialized = true;
        this.dir.form.markAsPristine();
        this.cdr.markForCheck();
        this._initialState = state;
        this._updating = false;

        if(this.dir instanceof NgForm) {
          this.formInitialized();
        }
      }
    });
  }

  ngAfterViewInit() {
    if(this.dir instanceof FormGroupDirective) {
      this.formInitialized();
    }
  }

  ngOnDestroy() {
    if (this.clearOnDestroy) {
      this.store.dispatch(ResetForm({ value: {}, path: this.slice }));
    }

    for(const element of this.nativeElements) {
      element.removeEventListener('blur', this._blurCallback);
      element.removeEventListener('input', this._inputCallback);
    }

    for(const sub of Object.keys(this._subs)) {
      this._subs[sub].unsubscribe();
    }

    this._blur$.complete();
    this._unmounted$.complete();
  }

  ngOnComponentUnmounted() {
    this._unmounted$.next(true);
    this._unmounted$.complete();
  }

  formInitialized() {
    for(const element of this.nativeElements) {
      element.addEventListener('blur', this._blurCallback);
      element.addEventListener('input', this._inputCallback);
    }
  }

  get nativeElements() {
    let directives: any = (this.dir instanceof FormGroupDirective) ?
    this.dir.directives : (this.dir as any)._directives;
    return { [Symbol.iterator]: function* () {
      for(const directive of directives) {
        let nativeElement = directive.valueAccessor?._elementRef?.nativeElement;
        if(nativeElement) {
          yield nativeElement;
        }
      }
    }}
  }

  get formValue(): any {
    let directives: any = (this.dir instanceof FormGroupDirective) ?
    this.dir.directives : (this.dir as any)._directives;
    let value = {} as any;
    for(const directive of directives) {
      let native = directive.valueAccessor?._elementRef?.nativeElement;
      if(native) { value = setValue(value, directive.path.join('.'), native.value); }
    }
    return value;
  }

  get formStatus(): FormControlStatus {
    this.dir.form.updateValueAndValidity({onlySelf: true, emitEvent: false});
    return this.dir.form.status;
  }
}
