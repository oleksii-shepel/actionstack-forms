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
import { Action, ActionsSubject, Store } from '@ngrx/store';
import {
  BehaviorSubject,
  Observable,
  asyncScheduler,
  combineLatest,
  defer,
  delay,
  distinctUntilChanged,
  filter,
  finalize,
  from,
  fromEvent,
  map,
  mergeMap,
  observeOn,
  pairwise,
  sampleTime,
  scan,
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
  actionQueues,
  deepEqual,
  findProps,
  getValue,
  intersection,
  selectSlice,
  selectValue,
  setValue
} from '.';
import {
  AutoInit,
  AutoSubmit,
  FormActions,
  FormActionsInternal,
  FormDestroyed,
  UpdateDirty,
  UpdateErrors,
  UpdateForm,
  UpdateStatus
} from './actions';
import { Queue } from './queue';


export interface NgyncConfig {
  slice: string;
  debounceTime?: number;
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
  debounceTime!: number;
  updateOn!: string;

  dir!: NgForm | FormGroupDirective;

  _initialState: any;
  _submittedState: any;

  _blur$ = new BehaviorSubject<boolean>(false);
  _input$ = new BehaviorSubject<boolean>(false);
  _submitted$ = new BehaviorSubject<boolean>(false);
  _statusCheck$ = new BehaviorSubject<boolean>(false);
  _initialized$ = new BehaviorSubject<boolean>(false);

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
  onSubmit$!: Observable<any>;
  onReset$!: Observable<any>;
  onStatusChanges$!: Observable<any>;
  onActionQueued$!: Observable<any>;

  constructor(
    @Optional() @Self() @Inject(ChangeDetectorRef) public cdr: ChangeDetectorRef,
    @Optional() @Self() @Inject(ElementRef) public elRef: ElementRef,
    @Inject(Injector) public injector: Injector,
    @Inject(Store) public store: Store,
    @Inject(ActionsSubject) public actionsSubject: ActionsSubject,
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

    this.debounceTime = config.debounceTime;
    this.updateOn = config.updateOn;

    if (!this.slice) {
      throw new Error('Misuse of sync directive');
    }

    if (!this.dir) {
      throw new Error('Supported form control directive not found');
    }

    this.onSubmit$ = fromEvent(this.elRef.nativeElement, 'submit').pipe(
      filter(() => this.dir.form.valid),
      map(() => (AutoSubmit({path: this.slice}))),
      filter((action: any) => action?.path === this.slice),
      takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)),
      mergeMap((value) => from(this._initialized$).pipe(filter(value => value), take(1), map(() => value))),
      takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)),
      tap(() => {

        this.store.dispatch(AutoSubmit({ path: this.slice }));

        this._submittedState = this.formValue;

        if (this.dir.form.dirty) {
          this.dir.form.markAsPristine();
          this.cdr.markForCheck();
          this._submitted$.next(true);
        }
      })
    );

    this.onInitOrUpdate$ = this.actionsSubject.pipe(
      filter((action: any) => action?.deferred === true && action?.path === this.slice),
      filter(action => [FormActions.InitForm, FormActions.UpdateForm, FormActionsInternal.AutoInit].includes(action?.type)),
      takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)),
      switchMap((action) => from(this.store.select(selectSlice(this.slice))).pipe(take(1), map((value) => ({action, slice: value})))),
      tap(({action, slice}) => {
        this.dir.form.patchValue(intersection(action.value, this.dir.form.value));

        const formValue = this.formValue;
        let equal = true;

        if(!this._initialized$.value) {
          this._initialState = formValue;
          this._initialized$.next(true);

          this.dir.form.markAsPristine();
        } else {
          equal = deepEqual(formValue, this._submittedState ?? this._initialState);
          if(equal) {
            this.dir.form.markAsPristine();
          }
        }

        const dirty = !equal;
        slice.dirty !== dirty && this.store.dispatch(UpdateDirty({ path: this.slice, dirty: dirty }));

        this.dir.form.updateValueAndValidity();
        this._statusCheck$.next(true);

        this.cdr.markForCheck();
      })
    );

    this.onChanges$ = combineLatest([this._input$, this._blur$, this._submitted$]).pipe(
      filter(([input, blur, submitted]) => (input || blur || submitted)),
      takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)),
      mergeMap((value) => from(this._initialized$).pipe(filter(value => value), take(1), map(() => value))),
      sampleTime(this.debounceTime),
      takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)),
      tap(([input, blur, submitted]) => {

        const form = this.formValue;

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
      switchMap(() => from(this.store.select(selectValue(this.slice))).pipe(take(1))),
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
      tap(value => { if(!this._initialized$.value) { this.store.dispatch(AutoInit({ path: this.slice, value: value })); } }),
      scan((acc, _) => acc + 1, 0),
      tap((value) => { if (value > 1) { this.store.dispatch(UpdateForm({ path: this.slice, value: this.formValue })); } })
    );

    this.onReset$ = this.actionsSubject.pipe(
      filter((action: any) => action?.deferred === true && action?.path === this.slice),
      filter(action => action?.type === FormActions.ResetForm),
      takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)),
      mergeMap((value) => from(this._initialized$).pipe(filter(value => value), take(1), map(() => value))),
      takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)),
      tap((action: any) => {
        if(action.state){
          switch(action.state) {
            case 'initial':
              this.store.dispatch(UpdateForm({ path: this.slice, value: this._initialState || {} }));
              break;
            case 'submitted':
              this.store.dispatch(UpdateForm({ path: this.slice, value: this._submittedState || {} }));
              break;
            case 'blank':
              this.store.dispatch(UpdateForm({ path: this.slice, value: this.reset(this.formValue)}));
              break;
          }
        }
      }
    ));

    this.onStatusChanges$ = this.dir.form.statusChanges.pipe(
      filter((value) => value !== 'PENDING'),
      takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)),
      mergeMap((value) => from(this._initialized$).pipe(filter(value => value), take(1), map(() => value))),
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

    this.onActionQueued$ = defer(() => {
      actionQueues.has(this.slice) || actionQueues.set(this.slice, new Queue<Action>());
      const queue = actionQueues.get(this.slice)!;
      return queue.updated$
    }).pipe(
      observeOn(asyncScheduler),
      takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)),
      tap((queue) => {
        if(queue.initialized$.value) {
          while(queue.length > 0) {
            this.store.dispatch(queue.dequeue()!);
          }
        }
      }),
      finalize(() => {
        const queue = actionQueues.get(this.slice)!;
        if(queue?.initialized$.value) {
          while(queue.length > 0) {
            this.store.dispatch(queue.dequeue()!);
          }
        }
        actionQueues.delete(this.slice);
      })
    );
  }

  ngAfterContentInit() {
    const timer = setTimeout(() => {
      this.subscribe();
      clearTimeout(timer);
    }, 0);
  }

  ngOnDestroy() {
    this.store.dispatch(FormDestroyed({ path: this.slice }));

    for (const sub of Object.keys(this._subs)) {
      this._subs[sub].unsubscribe();
    }

    this._blur$.complete();
    this._input$.complete();
    this._submitted$.complete();
    this._statusCheck$.complete();
    this._initialized$.complete();
  }

  subscribe() {
    this._subs.a = this.onInitOrUpdate$.subscribe();
    this._subs.b = this.onSubmit$.subscribe();
    this._subs.c = this.onChanges$.subscribe();
    this._subs.d = this.onControlsChanges$.subscribe();
    this._subs.e = this.onReset$.subscribe();
    this._subs.f = this.onStatusChanges$.subscribe();
    this._subs.g = this.onActionQueued$.subscribe();
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
    for(const prop of findProps(source)) {
      const value = getValue(source, prop);
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
