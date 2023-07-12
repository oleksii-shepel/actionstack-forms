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
  distinctUntilChanged,
  filter,
  finalize,
  from,
  fromEvent,
  map,
  mergeMap,
  observeOn,
  of,
  sampleTime,
  switchMap,
  take,
  takeWhile,
  tap
} from 'rxjs';
import {
  NGYNC_CONFIG_DEFAULT,
  NGYNC_CONFIG_TOKEN,
  deepEqual,
  getValue,
  selectValue,
  setValue
} from '.';
import {
  AutoInit,
  AutoSubmit,
  Deferred,
  FormActions,
  FormDestroyed,
  UpdateDirty,
  UpdateErrors,
  UpdateField,
  UpdateForm,
  UpdateStatus
} from './actions';
import { Queue } from './queue';
import { actionQueues, selectDirty } from './reducers';


export interface NgyncConfig {
  slice: string;
  debounceTime?: number;
  enableQueue?: boolean;
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
  enableQueue!: boolean;
  updateOn!: string;

  dir!: NgForm | FormGroupDirective;

  initialState: any = undefined;
  submittedState: any = undefined;
  destoyed = false;

  initialized$ = new BehaviorSubject<boolean>(false);

  subs = {} as any;

  blurCallback = (control: NgControl) => (value: any) => {
    if(this.updateOn === 'blur' && control.path) {
      this.store.dispatch(UpdateField({ path: this.slice, property: control.path.join('.'), value: control.value }));
    }
  }

  inputCallback = (control: NgControl) => (value : any) => {
    if(control.value !== value && control.control) {
      control.control.setValue(value);

      const state = this.submittedState ?? this.initialState;
      const savedState = control.path ? getValue(state, control.path.join('.')) : undefined;
      !(savedState === control.value) ? control.control.markAsDirty() : control.control.markAsPristine();
    }
    if(this.updateOn === 'change' && control.path) {
      this.store.dispatch(UpdateField({ path: this.slice, property: control.path.join('.'), value: value }));
    }
  }

  onInit$!: Observable<any>;
  onUpdate$!: Observable<any>;
  onControlsChanges$!: Observable<any>;
  onSubmit$!: Observable<any>;
  onReset$!: Observable<any>;
  onStatusChanges$!: Observable<any>;
  onUpdateField$!: Observable<any>;
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

    this.enableQueue = config.enableQueue;
    this.debounceTime = config.debounceTime;
    this.updateOn = config.updateOn;

    if (!this.slice) {
      throw new Error('Misuse of sync directive');
    }

    if (!this.dir) {
      throw new Error('Supported form control directive not found');
    }

    if(this.enableQueue) {
      actionQueues.set(this.slice, new Queue());
    }

    this.onInit$ = this.store.select(selectValue(this.slice)).pipe(
      take(1),
      tap(value => {

        if(value) {
          this.dir.form.patchValue(value, {emitEvent: false});
          this.dir.form.markAsPristine();

          this.store.dispatch(AutoInit({ path: this.slice, value: value }));
          this.store.dispatch(UpdateDirty({ path: this.slice, dirty: false }));

        } else {
          this.store.dispatch(AutoInit({ path: this.slice, value: this.dir.form.value }));
          this.store.dispatch(UpdateDirty({ path: this.slice, dirty: this.dir.form.dirty }));
        }

        this.dir.form.updateValueAndValidity();
        this.cdr.markForCheck();

        this.initialState = value ?? this.dir.form.value;
        this.initialized$.next(true);
      }),
    )

    this.onSubmit$ = fromEvent(this.elRef.nativeElement, 'submit').pipe(
      filter(() => this.dir.form.valid),
      mergeMap((value) => from(this.initialized$).pipe(filter(value => value), take(1), map(() => value))),
      tap(() => {

        this.submittedState = this.formValue;

        if(this.updateOn === 'submit') {
          this.store.dispatch(UpdateForm({path: this.slice, value: this.formValue}));
        }
      }),
      tap(() => ( this.store.dispatch(AutoSubmit({ path: this.slice })))),
      takeWhile(() => !this.destoyed)
    );

    this.onUpdateField$ = this.actionsSubject.pipe(
      filter((action: any) => action && action.path === this.slice && action.type === FormActions.UpdateField),
      filter((action: any) => (!this.enableQueue || action.deferred)),
      sampleTime(this.debounceTime),
      mergeMap((value) => from(this.initialized$).pipe(filter(value => value), take(1), map(() => value))),
      mergeMap(() => this.store.select(selectDirty(this.slice)).pipe(take(1), map((dirty) => dirty))),
      tap((dirty) => {

        const notEqual = !deepEqual(this.formValue, this.submittedState ?? this.initialState);

        if(dirty !== notEqual) {
          notEqual ? this.dir.form.markAsDirty() : this.dir.form.markAsPristine();
          this.store.dispatch(UpdateDirty({ path: this.slice, dirty: notEqual }));
        }
      }),
      takeWhile(() => !this.destoyed)
    );

    this.onUpdate$ = this.actionsSubject.pipe(
      filter((action: any) => action && action.path === this.slice && action.type === FormActions.UpdateForm),
      filter((action: any) => (!this.enableQueue || action.deferred)),
      tap((action) => {

        this.dir.form.patchValue(action.value, {emitEvent: false});

        const dirty = !deepEqual(action.value, this.submittedState ?? this.initialState);

        if(this.dir.form.dirty !== dirty) {
          dirty ? this.dir.form.markAsDirty() : this.dir.form.markAsPristine();
          this.store.dispatch(UpdateDirty({ path: this.slice, dirty: dirty }));
        }

        this.dir.form.updateValueAndValidity();
        this.cdr.markForCheck();
      }),
      takeWhile(() => !this.destoyed)
    );

    this.onControlsChanges$ = defer(() => this.controls.changes).pipe(
      tap(() => {
        this.controls.forEach((control: NgControl) => {
          if(control.valueAccessor) {
            control.valueAccessor.registerOnChange(this.inputCallback(control));
          }
        });
      }),
      tap(() => { this.store.dispatch(UpdateForm({ path: this.slice, value: this.formValue })); }),
      takeWhile(() => !this.destoyed)
    );

    this.onReset$ = this.actionsSubject.pipe(
      filter((action: any) => action && action.path === this.slice && action.type === FormActions.ResetForm),
      filter((action: any) => (!this.enableQueue || action.deferred)),
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
              this.store.dispatch(UpdateForm({ path: this.slice, value: this.reset()}));
              break;
          }
        }
      }),
      takeWhile(() => !this.destoyed));

    this.onStatusChanges$ = this.dir.form.statusChanges.pipe(
      mergeMap((value) => from(this.initialized$).pipe(filter(value => value), take(1), map(() => value))),
      map((value) => ({ status: value as any, errors: this.dir.form.errors as any})),
      distinctUntilChanged((a, b) => a.status === b.status && deepEqual(a.errors, b.errors)),
      tap((value) => {
        if(value.status !== 'PENDING') {
          this.store.dispatch(UpdateStatus({ path: this.slice, status: value.status }));
          this.store.dispatch(UpdateErrors({ path: this.slice, errors: value.errors }));
        }
      }),
      takeWhile(() => !this.destoyed),
    );

    this.onActionQueued$ = of(this.enableQueue).pipe(
      filter((value) => value),
      switchMap(() => actionQueues.get(this.slice)?.updated$ || of(null)),
      filter((value) => value !== null),
      observeOn(asyncScheduler),
      tap((queue) => {
        if(queue.initialized$.value) {
          while(queue.length > 0) {
            this.store.dispatch(queue.dequeue());
          }
        }
      }),
      takeWhile(() => document.contains(this.elRef.nativeElement)),
      finalize(() => {
        const queue = actionQueues.get(this.slice) as Queue<Action>;
        if(queue.initialized$.value) {
          while(queue.length > 0) {
            this.store.dispatch(queue.dequeue() as Action);
          }
          this.store.dispatch(new Deferred(FormDestroyed({ path: this.slice })));
        }
        actionQueues.delete(this.slice);
      }),
    );

    this.subs.a = this.onStatusChanges$.subscribe();
    this.subs.b = this.onUpdateField$.subscribe();
    this.subs.c = this.onInit$.subscribe();
    this.subs.d = this.onUpdate$.subscribe();
    this.subs.e = this.onSubmit$.subscribe();
    this.subs.f = this.onReset$.subscribe();
    this.subs.g = this.onActionQueued$.subscribe();
  }

  ngAfterContentInit() {
    this.subs.h = this.onControlsChanges$.subscribe();
  }

  ngOnDestroy() {
    if(!this.enableQueue) {
      this.store.dispatch(FormDestroyed({ path: this.slice }));
    }

    for (const sub of Object.keys(this.subs)) {
      this.subs[sub].unsubscribe();
    }

    this.initialized$.complete();

    this.destoyed = true;
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

  reset(): any {
    if(!this.controls) { return {}; }

    let value = {};
    for (const control of this.controls.toArray()) {
      control.reset((control.valueAccessor as any)?._elementRef?.nativeElement.defaultValue);

      if(control.path) {
        value = setValue(value, control.path.join('.'), control.value);
      }
    }

    return value;
  }
}
