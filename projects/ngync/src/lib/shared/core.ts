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
  distinctUntilChanged,
  distinctUntilKeyChanged,
  filter,
  from,
  fromEvent,
  map,
  merge,
  mergeMap,
  pairwise,
  sampleTime,
  startWith,
  switchMap,
  take,
  takeWhile,
  tap
} from 'rxjs';
import {
  DomObserver,
  NGYNC_CONFIG_DEFAULT,
  NGYNC_CONFIG_TOKEN,
  deepEqual,
  findProps,
  getModel,
  getValue,
  intersection,
  setValue
} from '.';
import {
  AutoInit,
  AutoSubmit,
  FormActions,
  FormActionsInternal,
  UpdateDirty,
  UpdateErrors,
  UpdateForm,
  UpdateStatus,
  UpdateSubmitted
} from './actions';


export interface NgyncConfig {
  slice: string;
  debounce?: number;
  updateOn?: 'change' | 'blur' | 'submit';
}


@Directive({
  selector:
    `form:not([ngNoForm]):not([formGroup])[ngync],ng-form[ngync],[ngForm][ngync],[formGroup][ngync]`,
  exportAs: 'ngync',
})
export class SyncDirective implements OnInit, OnDestroy, AfterContentInit {
  @Input('ngync') config!: string | NgyncConfig;
  @ContentChildren(NgControl, {descendants: true}) controls!: QueryList<NgControl>;

  slice!: string;
  debounce!: number;
  resetOnDestroy!: string;
  updateOn!: string;

  dir!: NgForm | FormGroupDirective;

  _initialState: any;
  _submittedState: any;

  _blur$ = new BehaviorSubject<boolean>(false);
  _input$ = new BehaviorSubject<boolean>(false);
  _submitted$ = new BehaviorSubject<boolean>(false);
  _statusCheck$ = new BehaviorSubject<boolean>(false);

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
  onChanges$!: Observable<any>;
  onControlsChanges$!: Observable<any>;
  onSubmitOrAutoSubmit$!: Observable<any>;
  onReset$!: Observable<any>;
  onStatusChanges$!: Observable<any>;
  onAction$: any;

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

    if (!this.slice) {
      throw new Error('Misuse of sync directive');
    }

    if (!this.dir) {
      throw new Error('Supported form control directive not found');
    }

    let onSubmit$ = this.actionsSubject.pipe(
      filter((action: any) => action?.path === this.slice),
      filter((action) => action.type === FormActions.UpdateSubmitted),
      filter(value => !!value),
      map((action: any) => (UpdateSubmitted({path: this.slice, value: action.value}))),
    );

    let submit = this.elRef.nativeElement.querySelector('button[type="submit"],input[type="submit"]')
    let onAutoSubmit$ = fromEvent(submit, 'click').pipe(
      delay(0),
      filter(() => this.dir.form.valid),
      map(() => (AutoSubmit({path: this.slice})))
    )

    this.onSubmitOrAutoSubmit$ = merge(onSubmit$, onAutoSubmit$).pipe(
      filter((action: any) => action?.path === this.slice),
      filter(() => this._initialized),
      distinctUntilKeyChanged('value'),
      takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)),
      tap((action) => { if(action.type === AutoSubmit.type) { this.store.dispatch(AutoSubmit({ path: this.slice })); } }),
      tap((action) => {

        if(action.value === true) {
          this._submittedState = this.formValue;

          if (this.dir.form.dirty) {
            this.dir.form.markAsPristine();
            this.cdr.markForCheck();
            this._submitted$.next(true);
          }
        } else {
          this._submitted$.next(false);
        }
      })
    );

    this.onInitOrUpdate$ = this.actionsSubject.pipe(
      filter((action: any) => action?.path === this.slice),
      tap((action) => { if (action.type === FormActions.InitForm) { this._initDispatched = true; } }),
      filter((action) => action.type === FormActionsInternal.AutoInit || action.type === FormActions.InitForm || action.type === FormActions.UpdateForm),
      takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)),
      tap((action: any) => {

        this.dir.form.patchValue(intersection(action.value, this.dir.form.value));

        let formValue = this.formValue;
        let equal = true;

        if(action.type === FormActions.InitForm || action.type === FormActionsInternal.AutoInit) {
          this._initialState = formValue;
          this._initialized = true;

          this.dir.form.markAsPristine();
        } else {
          equal = deepEqual(formValue, this._submittedState ?? this._initialState);
          if(equal) {
            this.dir.form.markAsPristine();
          }
        }

        this.store.dispatch(UpdateSubmitted({ path: this.slice, value: this._submittedState ? equal : false }));
        this.store.dispatch(UpdateDirty({ path: this.slice, dirty: !equal }));

        this.dir.form.updateValueAndValidity();
        this._statusCheck$.next(true);

        this.cdr.markForCheck();
      })
    );

    this.onChanges$ = combineLatest([this._input$, this._blur$, this._submitted$]).pipe(
      filter(([input, blur, submitted]) => (input || blur || submitted)),
      filter(() => this._initialized),
      takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)),
      sampleTime(this.debounce),
      tap(([input, blur, submitted]) => {

        let form = this.formValue;

        if (submitted === true || this.updateOn === 'change' && input === true || this.updateOn === 'blur' && blur === true) {
          this.store.dispatch(UpdateForm({ path: this.slice, value: form }));
        }

        if(input === true) {
          this._input$.next(false);
        }

        if(blur === true) {
          this._blur$.next(false);
        }

        if(submitted === true) {
          this._submitted$.next(false);
        }

      })
    );

    this.onControlsChanges$ = defer(() => this.controls.changes.pipe(startWith(this.controls))).pipe(
      delay(0),
      takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)),
      switchMap(() => from(this.store.select(getModel(this.slice))).pipe(take(1))),
      map((value) => value ?? this.formValue),
      tap(() => {
        this.controls.forEach((control: NgControl) => {
          if(control.valueAccessor) {
            control.valueAccessor.registerOnChange(this._inputCallback(control));
            control.valueAccessor.registerOnTouched(this._blurCallback(control));
          }
        });
      }),
      takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)),
      tap(value => !this._initialized && !this._initDispatched ? this.store.dispatch(AutoInit({ path: this.slice, value: value })) : this._input$.next(true)),
    );

    this.onReset$ = this.actionsSubject.pipe(
      filter((action: any) => action?.path === this.slice),
      filter((action: any) => action.type === FormActions.ResetForm),
      takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)),
      tap((action: any) => {
        if(action.value){
          switch(action.value) {
            case 'initial':
              this.store.dispatch(UpdateForm({ path: this.slice, value: this._initialState || {} }));
              break;
            case 'submitted':
              this.store.dispatch(UpdateForm({ path: this.slice, value: this._submittedState || {} }));
              break;
            case 'empty':
              this.store.dispatch(UpdateForm({ path: this.slice, value: this.reset(this.formValue)}));
              break;
          }
        }
      }
    ));

    this.onStatusChanges$ = this.dir.form.statusChanges.pipe(
      takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)),
      filter((value) => value !== 'PENDING'),
      map((value) => ({ status: value, errors: this.dir.form.errors})),
      pairwise(),
      distinctUntilChanged(([prev, curr]: [any, any]) => prev.status === curr.status && deepEqual(prev.errors, curr.errors)),
      map(([_, curr]) => curr),
      mergeMap((value) => from(this._statusCheck$).pipe(filter(value => value), take(1), map(() => value), tap(() => this._statusCheck$.next(false)))),
      takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)),
      tap((value) => {
        this.store.dispatch(UpdateStatus({ path: this.slice, status: value.status }));
        this.store.dispatch(UpdateErrors({ path: this.slice, errors: value.errors }));
      })
    );
  }

  ngAfterContentInit() {
    let timer = setTimeout(() => {
      this.subscribe();
      clearTimeout(timer);
    }, 0);
  }

  ngOnDestroy() {
    for (const sub of Object.keys(this._subs)) {
      this._subs[sub].unsubscribe();
    }

    this._blur$.complete();
    this._input$.complete();
    this._submitted$.complete();
  }

  subscribe() {
    this._subs.a = this.onInitOrUpdate$.subscribe();
    this._subs.b = this.onSubmitOrAutoSubmit$.subscribe();

    this._subs.c = this.onChanges$.subscribe();
    this._subs.d = this.onControlsChanges$.subscribe();
    this._subs.e = this.onReset$.subscribe();
    this._subs.f = this.onStatusChanges$.subscribe();
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
    return this.dir.form.status;
  }

  reset(target: any, source?: any): any {
    if(!source) { source = target; }
    for(let prop of findProps(source)) {
      let value = getValue(source, prop);
      if(typeof value === 'string') {
        target = setValue(target, prop, '');
      } else if (typeof value === 'number') {
        target = setValue(target, prop, 0);
      } else if (typeof value === 'boolean') {
        target = setValue(target, prop, false);
      } else if (typeof value === 'bigint') {
        target = setValue(target, prop, BigInt(0));
      }
    }
    return target;
  }
}
