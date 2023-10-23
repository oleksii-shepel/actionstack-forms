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
import { FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { ActionsSubject, Store } from '@ngrx/store';
import {
  BehaviorSubject,
  Observable,
  asyncScheduler,
  defer,
  filter,
  finalize,
  from,
  fromEvent,
  map,
  mergeMap,
  observeOn,
  scan,
  skip,
  startWith,
  take,
  takeWhile,
  tap
} from 'rxjs';
import {
  SYNC_OPTIONS_DEFAULT,
  SYNC_OPTIONS_TOKEN,
  deepClone,
  sampleTime,
  setValue
} from '.';
import {
  AutoInit,
  AutoSubmit,
  FormActions,
  FormDestroyed,
  UpdateField,
  UpdateForm
} from './actions';
import { selectFormState } from './reducers';



export interface SyncOptions {
  slice: string;
  debounceTime?: number;
  updateOn?: 'change' | 'blur' | 'submit';
}



enum InitStep {
  Reset = 0,
  Init_0 = 1,
  Init_1 = 2,
  Init_2 = 4 ,
  Init_3 = 8,
  Init_4 = 16,
  Init_5 = 32,
  Complete = 63
}



@Directive({
  selector:
    `form:not([ngNoForm]):not([formGroup])[sync],ng-form[sync],[ngForm][sync],[formGroup][sync]`,
  exportAs: 'sync',
})
export class SyncDirective implements OnInit, OnDestroy, AfterContentInit {
  @Input('sync') config!: string | SyncOptions;
  @ContentChildren(NgControl, {descendants: true}) controls!: QueryList<NgControl>;

  path!: string;
  debounceTime!: number;
  updateOn!: string;

  formDirective!: NgForm | FormGroupDirective;

  initialized$ = new BehaviorSubject<boolean>(false);
  destroyed = false;

  onInit$!: Observable<any>;
  onUpdate$!: Observable<any>;
  onControlsChanges$!: Observable<any>;
  onSubmit$!: Observable<any>;

  private initSteps$ = new BehaviorSubject<InitStep>(InitStep.Reset) as any;
  private subs = {} as any;

  private blurCallback = (control: NgControl) => (value: any) => {
    if(this.updateOn === 'blur' && control.path && control.control) {
      control.control.setValue(control.value, {emitEvent: control.control.updateOn === 'blur'});
      this.store.dispatch(UpdateField({ path: this.path, property: control.path.join('.'), value: control.value }));
    }
  }

  private func = this.setControlValue.bind(this);
  private inputCallback = (control: NgControl) => (value: any) => {
    sampleTime(this.func, this.debounceTime)(control, value);
  }

  constructor(
    @Optional() @Self() @Inject(ChangeDetectorRef) public cdr: ChangeDetectorRef,
    @Optional() @Self() @Inject(ElementRef) public elRef: ElementRef,
    @Inject(Injector) public injector: Injector,
    @Inject(Store) public store: Store,
    @Inject(ActionsSubject) public actionsSubject: ActionsSubject,
  ) {
    this.initSteps$ = Object.assign(this.initSteps$, {
      reset: () => this.initSteps$.next(InitStep.Reset),
      completed: () => this.initSteps$.value === InitStep.Complete,
      register: (value: number) => { this.initSteps$.next((this.initSteps$.value | value) as any); }
    });
  }

  ngOnInit() {
    this.formDirective = this.injector.get(FormGroupDirective, null) ?? (this.injector.get(NgForm, null) as any);

    let config = this.injector.get<any>(SYNC_OPTIONS_TOKEN, {});
    config = Object.assign(SYNC_OPTIONS_DEFAULT, config);

    if(typeof this.config === 'string') {
      this.path = this.config;
    } else {
      config = Object.assign(config, this.config);
      this.path = config.slice;
    }

    this.debounceTime = config.debounceTime;
    this.updateOn = config.updateOn;

    if (!this.path) {
      throw new Error('The path property is not provided for the directive');
    }

    if (!this.formDirective) {
      throw new Error('Form group directive not found');
    }

    this.subs.internal_a = this.initSteps$.pipe(finalize(() => this.initSteps$.completed() ? this.initialized$.next(true) : this.initialized$.error('Error during initialization'))).subscribe();

    this.onInit$ = this.store.select(selectFormState(this.path, true)).pipe(
      take(1),
      tap(formState => {

        if(formState) {
          formState = deepClone(formState);
          this.formDirective.form.patchValue(formState, {emitEvent: this.formDirective.form.updateOn === 'change'});
        } else {
          formState = deepClone(this.formDirective.form.value);
        }

        this.store.dispatch(AutoInit({ path: this.path, value: formState, noclone: true }));
        this.initSteps$.register(InitStep.Init_0);
      }),
    )

    this.onSubmit$ = fromEvent(this.elRef.nativeElement, 'submit').pipe(
      filter(() => this.formDirective.form.valid),
      mergeMap((value) => from(this.initialized$).pipe(filter(value => value), take(1), map(() => value))),
      tap(() => {
        if(this.updateOn === 'submit') {
          this.formDirective.form.updateOn === 'submit' && this.formDirective.form.updateValueAndValidity();
          this.store.dispatch(UpdateForm({ path: this.path, value: this.formValue, noclone: true }));
        }
      }),
      tap(() => ( this.store.dispatch(AutoSubmit({ path: this.path })))),
      takeWhile(() => !this.destroyed)
    );

    this.onUpdate$ = this.actionsSubject.pipe(
      skip(1),
      filter((action: any) => action && action.path === this.path && action.type === FormActions.UpdateForm),
      mergeMap(() => this.store.select(selectFormState(this.path)).pipe(take(1), map((formState) => formState))),
      tap((formState) => {
        this.formDirective.form.patchValue(formState, {emitEvent: this.formDirective.form.updateOn === 'change'});
      }),
      takeWhile(() => !this.destroyed)
    );

    this.onControlsChanges$ = defer(() => this.controls.changes.pipe(startWith(this.controls))).pipe(
      observeOn(asyncScheduler), // to avoid collisions by callback method registration
      tap((controls) => {
        controls.forEach((control: NgControl) => {
          if(control.valueAccessor) {
            control.valueAccessor.registerOnChange(this.inputCallback(control));
            control.valueAccessor.registerOnTouched(this.blurCallback(control));
          }
        });
      }),
      scan((acc, _) => acc + 1, 0),
      tap((value) => { if(value === 1) { this.initSteps$.register(InitStep.Init_5); } else { this.store.dispatch(UpdateForm({ path: this.path, value: this.formValue, noclone: true })); }}),
      takeWhile(() => !this.destroyed),
    );

    this.subs.a = this.onInit$.subscribe();
    this.initSteps$.register(InitStep.Init_1);
    this.subs.b = this.onUpdate$.subscribe();
    this.initSteps$.register(InitStep.Init_2);
    this.subs.c = this.onSubmit$.subscribe();
    this.initSteps$.register(InitStep.Init_3);
  }

  ngAfterContentInit() {
    // the subscription has to be made after the ngAfterContentInit method completion
    // to avoid collisions by callback method registration
    asyncScheduler.schedule(() => {
      this.subs.d = this.onControlsChanges$.subscribe();
      this.initSteps$.register(InitStep.Init_4)
    });
  }

  ngOnDestroy() {
    this.store.dispatch(FormDestroyed({ path: this.path }));

    for (const sub of Object.keys(this.subs)) {
      this.subs[sub].unsubscribe();
    }

    this.initSteps$.complete();
    this.initialized$.complete();
    this.destroyed = true;
  }

  setControlValue(control: NgControl, value: any) {
    if(control.value !== value && control.control) {
      control.control.setValue(value, {emitEvent: control.control.updateOn === 'change'});
    }
    if(this.updateOn === 'change' && control.path) {
      this.store.dispatch(UpdateField({ path: this.path, property: control.path.join('.'), value: value }));
    }
  }

  get formValue(): any {
    if(!this.controls) { return {}; }

    let value = {} as any;
    for (const control of this.controls.toArray()) {
      if(control.path) {
        value = setValue(value, control.path.join('.'), control.value);
      }
    }
    return value;
  }
}
