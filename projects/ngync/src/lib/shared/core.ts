import {
  AfterContentInit,
  ChangeDetectorRef,
  ContentChildren,
  Directive,
  ElementRef,
  Inject,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  QueryList,
  Self
} from '@angular/core';
import { FormControlStatus, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { ActionsSubject, Store } from '@ngrx/store';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  defer,
  delay,
  distinctUntilKeyChanged,
  filter,
  from,
  fromEvent,
  map,
  merge,
  mergeMap,
  repeat,
  sampleTime,
  skip,
  startWith,
  take,
  takeWhile,
  tap
} from 'rxjs';
import {
  DomObserver,
  NGYNC_CONFIG_DEFAULT,
  NGYNC_CONFIG_TOKEN,
  checkForm,
  deepEqual,
  getSlice,
  setValue
} from '.';
import {
  AutoInit,
  AutoSubmit,
  FormActions,
  ResetForm,
  UpdateDirty,
  UpdateErrors,
  UpdateStatus,
  UpdateSubmitted,
  UpdateValue
} from './actions';


export interface NgyncConfig {
  slice: string;
  debounce?: number;
  resetOnDestroy?: 'no-changes' | 'initial' | 'submitted' | 'empty';
  updateOn?: 'change' | 'blur' | 'submit';
  autoSubmit?: boolean;
}


@Directive({
  selector:
    'form:not([ngNoForm]):not([formGroup])[ngync],ng-form[ngync],[ngForm][ngync],[formGroup][ngync]',
  exportAs: 'ngync',
})
export class SyncDirective implements OnInit, OnDestroy, AfterContentInit {
  @Input('ngync') config!: string | NgyncConfig;
  @ContentChildren(NgControl, {descendants: true}) controls!: QueryList<NgControl>;

  slice!: string;
  debounce!: number;
  resetOnDestroy!: string;
  updateOn!: string;
  autoSubmit!: boolean;

  dir!: NgForm | FormGroupDirective;

  _initialState: any;
  _submittedState: any;

  _blur$ = new BehaviorSubject<boolean>(false);
  _input$ = new BehaviorSubject<boolean>(false);
  _submitted$ = new BehaviorSubject<boolean>(false);
  _updating$ = new BehaviorSubject<boolean>(false);

  _initialized = false;
  _initDispatched = false;

  _subs = {} as any;

  _blurCallback = (control: NgControl) => (value : any) => {
    this._blur$.next(true);
  };

  _inputCallback = (control: NgControl) => (value : any) => {
    control.control!.setValue(value);
    this._input$.next(true)
  };

  onInitOrUpdate$!: Observable<any>;
  onChange$!: Observable<any>;
  onAutoInit$!: Observable<any>;
  onControlsChanges$!: Observable<any>;
  onSubmitOrAutoSubmit$!: Observable<any>;

  constructor(
    @Optional() @Self() @Inject(ChangeDetectorRef) public cdr: ChangeDetectorRef,
    @Optional() @Self() @Inject(ElementRef) public elRef: ElementRef,
    @Inject(Injector) public injector: Injector,
    @Inject(Store) public store: Store,
    public actionsSubject: ActionsSubject
  ) {
  }

  ngOnInit() {
    this.dir = this.injector.get(FormGroupDirective, null) ?? (this.injector.get(NgForm, null) as any);

    let config = this.injector.get<any>(NGYNC_CONFIG_TOKEN, {});
    config = Object.assign(NGYNC_CONFIG_DEFAULT, config);

    if(typeof this.config === 'string') {
      this.slice = this.config;
    } else {
      config = Object.assign(config, this.config);
      this.slice = config.slice;
    }

    this.debounce = config.debounce;
    this.resetOnDestroy = config.resetOnDestroy;
    this.updateOn = config.updateOn;
    this.autoSubmit = config.autoSubmit;

    if (!this.slice) {
      throw new Error('Misuse of sync directive');
    }

    if (!this.dir) {
      throw new Error('Supported form control directive not found');
    }

    let onSubmit$ = this.actionsSubject.pipe(
      filter((action) => action.type === FormActions.UpdateSubmitted),
      filter(value => !!value),
      map((action: any) => ({value: action.value, type: action.type})),
    );

    let submit = this.elRef.nativeElement.querySelector('button[type="submit"],input[type="submit"]')
    let onAutoSubmit$ = fromEvent(submit, 'click').pipe(
      filter(() => this.autoSubmit && this.dir.form.valid),
      map(() => ({value: true, type: AutoSubmit.type}))
    )

    this.onSubmitOrAutoSubmit$ = merge(onSubmit$, onAutoSubmit$).pipe(
      filter(() => this._initialized),
      distinctUntilKeyChanged('value'),
      mergeMap((value) => from(this._updating$).pipe(filter((value)=> !value), take(1), map(() => value))),
      takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)),
      tap((action) => { if(action.type === AutoSubmit.type) { this.store.dispatch(AutoSubmit({ path: this.slice })); } }),
      tap((action) => {
        this._updating$.next(true);

        if(action.value === true) {
          this._submittedState = this.formValue;

          if (this.dir.form.dirty) {
            this.dir.form.markAsPristine();
            this.dir.form.updateValueAndValidity();
            this.cdr.markForCheck();
            this._submitted$.next(true);
          }
        } else {
          this._submitted$.next(false);
        }

        this._updating$.next(false);
      })
    );

    this.onInitOrUpdate$ = this.actionsSubject.pipe(
      tap((action) => { if(action.type === FormActions.InitForm) { this._initDispatched = true; }}),
      filter((action) => action.type === FormActions.InitForm || action.type === FormActions.UpdateValue),
      mergeMap((value) => from(this._updating$).pipe(filter((value)=> !value), take(1), map(() => value))),
      sampleTime(this.debounce),
      takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)),
      tap((action: any) => {

        this._updating$.next(true);

        this.dir.form.patchValue(action.value);
        this.dir.form.updateValueAndValidity();
        this.dir.form.markAsDirty();

        let formValue = this.formValue;

        if(action.type === FormActions.InitForm) {
          this._initialState = formValue;
          this._initialized = true;
        } else {
          let equal = deepEqual(formValue, this._submittedState);
          if(equal) {
            this.dir.form.markAsPristine();
            this.dir.form.updateValueAndValidity();
            this.cdr.markForCheck();
          }

          this.store.dispatch(UpdateSubmitted({ path: this.slice, value: equal }));
          this.store.dispatch(UpdateDirty({ path: this.slice, dirty: !equal }));
          this.store.dispatch(UpdateErrors({ path: this.slice, errors: this.dir.errors }));
          this.store.dispatch(UpdateStatus({ path: this.slice, status: this.dir.status }));
        }

        this.cdr.markForCheck();
        this._updating$.next(false);
      })
    );

    this.onChange$ = combineLatest([this._input$, this._blur$, this._submitted$, this._updating$]).pipe(
      filter(([input, blur, submitted, updating]) => !updating && (input || blur || submitted)),
      filter(() => this._initialized),
      sampleTime(this.debounce),
      mergeMap((value) => from(this._updating$).pipe(filter((value)=> !value), take(1), map(() => value))),
      takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)),
      tap(() => this._updating$.next(true)),
      tap(([input, blur, submitted]) => {

        let form = this.formValue;

        if (submitted === true || this.updateOn === 'change' && input === true || this.updateOn === 'blur' && blur === true) {
          this.store.dispatch(UpdateValue({ path: this.slice, value: form }));
        }
      }),
      tap(([input, blur, submitted, _]) => {

        if(input === true) {
          this._input$.next(false);
        }

        if(blur === true) {
          this._blur$.next(false);
        }

        if(submitted === true) {
          this._submitted$.next(false);
        }

        this._updating$.next(false);

      })
    );

    this.onAutoInit$ = this.store.select(getSlice(this.slice)).pipe(
      delay(0), take(1),
      repeat({ count: 10 }),
      tap((state) => { if(state?.model) { this.dir.form.patchValue(state.model); }}),
      filter((state) => {return (state?.model) ? checkForm(this.dir.form, state.model): true;}),
      mergeMap((value) => from(this._updating$).pipe(filter((value)=> !value), take(1), map(() => value))),
      filter(() => !this._initDispatched && !this._initialized),
      takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)),
      tap((state) => {
        this._updating$.next(true);
        let formValue = this.formValue;
        if(formValue) {

          this.dir.form.markAsPristine();
          this.cdr.markForCheck();

          this._initialized = true;
          this._initialState = formValue;

          this.store.dispatch(AutoInit({path: this.slice, value: formValue}));
        }
        this._updating$.next(false);
      })
    );

    this.onControlsChanges$ = defer(() => this.controls.changes.pipe(startWith(this.controls))).pipe(
      takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)),
      tap((controls) => {
        controls.forEach((control: NgControl) => {
          if(control.valueAccessor) {
            control.valueAccessor.registerOnChange(this._inputCallback(control));
            control.valueAccessor.registerOnTouched(this._blurCallback(control));
          }
        });
      }),
      skip(1),
      tap(() => this._input$.next(true))
    );
  }

  ngAfterContentInit() {
    let timer = setTimeout(() => {
      this.subscribe();
      clearTimeout(timer);
    }, 0);
  }

  ngOnDestroy() {
    if (this.resetOnDestroy !== 'no-changes') {
      switch(this.resetOnDestroy) {
        case 'initial':
          this.store.dispatch(ResetForm({ path: this.slice, value: this._initialState || {} }));
          break;
        case 'submitted':
          this.store.dispatch(ResetForm({ path: this.slice, value: this._submittedState || {} }));
          break;
        case 'empty':
          this.store.dispatch(ResetForm({ path: this.slice, value: {} }));
          break;
      }
    }

    for (const sub of Object.keys(this._subs)) {
      this._subs[sub].unsubscribe();
    }

    this._blur$.complete();
    this._input$.complete();
    this._submitted$.complete();
    this._updating$.complete();
  }

  subscribe() {
    this._subs.a = this.onInitOrUpdate$.subscribe();
    this._subs.b = this.onSubmitOrAutoSubmit$.subscribe();

    this._subs.d = this.onChange$.subscribe();
    this._subs.e = this.onAutoInit$.subscribe();

    this._subs.f = this.onControlsChanges$.subscribe();
  }

  get initialized(): boolean {
    if(!this.controls) { return false; }

    let value = true;
    for (const control of this.controls.toArray()) {
      if(typeof control.value === 'undefined' || control.value === null) {
        value = false;
        break;
      }
    }
    return value;
  }

  get formValue(): any {
    if(!this.controls) { return {}; }

    let value = {};
    for (const control of this.controls.toArray()) {
      value = setValue(value, control.path!.join('.'), control.value);
    }
    return value;
  }

  get formStatus(): FormControlStatus {
    this.dir.form.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    return this.dir.form.status;
  }
}
