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
  reset,
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

  initialState: any;
  submittedState: any;

  checkStatus$ = new BehaviorSubject<boolean>(false);
  initialized$ = new BehaviorSubject<boolean>(false);

  subs = {} as any;

  blurCallback = (control: NgControl) => (value: any) => {
    if(this.updateOn === 'blur') {
      this.store.dispatch(UpdateForm({path: this.slice, value: this.formValue}));
    }
  };

  inputCallback = (control: NgControl) => (value : any) => {
    control.control?.setValue(value);

    if(this.updateOn === 'change') {
      this.store.dispatch(UpdateForm({path: this.slice, value: this.formValue}));
    }
  };

  onInitOrUpdate$!: Observable<any>;
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
      mergeMap((value) => from(this.initialized$).pipe(filter(value => value), take(1), map(() => value))),
      tap(() => {

        if(this.updateOn === 'submit') {
          this.store.dispatch(UpdateForm({path: this.slice, value: this.formValue}));
        }

        this.submittedState = this.formValue;

        if (this.dir.form.dirty) {
          this.dir.form.markAsPristine();
          this.cdr.markForCheck();
        }
      }),
      tap(() => ( this.store.dispatch(AutoSubmit({ path: this.slice })))),
      takeWhile(() => DomObserver.mounted(this.elRef.nativeElement))
    );

    this.onInitOrUpdate$ = this.actionsSubject.pipe(
      filter((action: any) => action && [FormActions.UpdateForm, FormActions.UpdateForm, FormActionsInternal.AutoInit].includes(action.type)),
      filter((action: any) => (!actionQueues.has(this.slice) || action.deferred)),
      sampleTime(this.debounceTime),
      switchMap((action) => from(this.store.select(selectSlice(this.slice))).pipe(take(1), map((value) => ({action, slice: value})))),
      tap(({action, slice}) => {

        this.dir.form.patchValue(action?.value, {emitEvent: false});
        let equal = true;

        if(!this.initialized$.value) {
          this.initialState = action?.value;
          this.initialized$.next(true);

          this.dir.form.markAsPristine();
        } else {
          equal = deepEqual(action?.value, this.submittedState ?? this.initialState);
          if(equal) {
            this.dir.form.markAsPristine();
          } else {
            this.dir.form.markAsDirty();
          }
        }

        slice.dirty !== !equal && this.store.dispatch(UpdateDirty({ path: this.slice, dirty: !equal }));

        this.dir.form.updateValueAndValidity();
        this.checkStatus$.next(true);

        this.cdr.markForCheck();
      }),
      takeWhile(() => DomObserver.mounted(this.elRef.nativeElement))
    );

    this.onControlsChanges$ = defer(() => this.controls.changes.pipe(startWith(this.controls))).pipe(
      delay(0),
      switchMap(() => from(this.store.select(selectValue(this.slice))).pipe(take(1))),
      map((value) => value ?? this.formValue),
      tap(() => {
        this.controls.forEach((control: NgControl) => {
          if(control.valueAccessor) {
            control.valueAccessor.registerOnChange(this.inputCallback(control));
            control.valueAccessor.registerOnTouched(this.blurCallback(control));
          }
        });
      }),
      tap(value => { if(!this.initialized$.value) { this.store.dispatch(AutoInit({ path: this.slice, value: value })); } }),
      scan((acc, _) => acc + 1, 0),
      tap((value) => { if (value > 1) { this.store.dispatch(UpdateForm({ path: this.slice, value: this.formValue })); } }),
      takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)),
    );

    this.onReset$ = this.actionsSubject.pipe(
      filter((action: any) => action && action.path === this.slice && action.type === FormActions.ResetForm),
      filter((action) => (!actionQueues.has(this.slice) || action.deferred)),
      mergeMap((value) => from(this.initialized$).pipe(filter(value => value), take(1), map(() => value))),
      tap((action: any) => {
        if(action.state){
          switch(action.state) {
            case 'initial':
              this.store.dispatch(UpdateForm({ path: this.slice, value: this.initialState || {} }));
              break;
            case 'submitted':
              this.store.dispatch(UpdateForm({ path: this.slice, value: this.submittedState || {} }));
              break;
            case 'blank':
              this.store.dispatch(UpdateForm({ path: this.slice, value: reset(this.formValue)}));
              break;
          }
        }
      }),
      takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)));

    this.onStatusChanges$ = this.dir.form.statusChanges.pipe(
      startWith(undefined),
      filter((value) => value !== 'PENDING'),
      mergeMap((value) => from(this.initialized$).pipe(filter(value => value), take(1), map(() => value))),
      map((value) => ({ status: value as any, errors: this.dir.form.errors as any})),
      pairwise(),
      distinctUntilChanged(([prev, curr]: [any, any]) => prev.status === curr.status && deepEqual(prev.errors, curr.errors)),
      map(([_, curr]) => curr),
      mergeMap((value) => from(this.checkStatus$).pipe(filter(value => value), take(1), map(() => value), tap(() => this.checkStatus$.next(false)))),
      tap((value) => {
        this.store.dispatch(UpdateStatus({ path: this.slice, status: value.status }));
        this.store.dispatch(UpdateErrors({ path: this.slice, errors: value.errors }));
      }),
      takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)),
    );

    this.onActionQueued$ = defer(() => {
      actionQueues.has(this.slice) || actionQueues.set(this.slice, new Queue<Action>());
      const queue = actionQueues.get(this.slice) as Queue<Action>;
      return queue.updated$
    }).pipe(
      observeOn(asyncScheduler),
      tap((queue) => {
        if(queue.initialized$.value) {
          while(queue.length > 0) {
            this.store.dispatch(queue.dequeue());
          }
        }
      }),
      takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)),
      finalize(() => {
        const queue = actionQueues.get(this.slice) as Queue<Action>;
        if(queue.initialized$.value) {
          while(queue.length > 0) {
            this.store.dispatch(queue.dequeue() as Action);
          }
        }
        actionQueues.delete(this.slice);
      }),
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

    for (const sub of Object.keys(this.subs)) {
      this.subs[sub].unsubscribe();
    }

    this.checkStatus$.complete();
    this.initialized$.complete();
  }

  subscribe() {
    this.subs.a = this.onInitOrUpdate$.subscribe();
    this.subs.b = this.onSubmit$.subscribe();
    this.subs.c = this.onControlsChanges$.subscribe();
    this.subs.d = this.onReset$.subscribe();
    this.subs.e = this.onStatusChanges$.subscribe();
    this.subs.f = this.onActionQueued$.subscribe();
  }

  get activeControl(): NgControl | undefined {
    const activeElement = document.activeElement;
    if(activeElement) {
      return this.controls.find((control: NgControl) => {
        return (control.valueAccessor as any)?._elementRef?.nativeElement === activeElement;
      });
    } else {
      return undefined;
    }
  }

  get formValue(): any {
    if(!this.controls) { return {}; }

    let value = {};
    for (const control of this.controls.toArray()) {
      if(control.path) {
        value = setValue(value, control.path.join('.'), control.value);
      }
    }
    return value;
  }

  get formStatus(): FormControlStatus {
    return this.dir.form.status;
  }
}
