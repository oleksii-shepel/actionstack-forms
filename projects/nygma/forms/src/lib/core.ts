import { Action, Store, effect } from '@actioncrew/actionstack';
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
import {
  BehaviorSubject,
  Observable,
  asyncScheduler,
  defer,
  filter,
  fromEvent,
  map,
  mergeMap,
  observeOn,
  scan,
  startWith,
  take,
  takeWhile,
  tap
} from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {
  SYNC_OPTIONS_DEFAULT,
  SYNC_OPTIONS_TOKEN,
  deepClone,
  deepEqual,
  sampleTime,
  setValue
} from '.';
import {
  FormActions,
  autoInit,
  autoSubmit,
  formDestroyed,
  updateControl,
  updateForm
} from './actions';
import { selectFormState } from './reducers';



export interface SyncOptions {
  slice: string;
  debounceTime?: number;
  updateOn?: 'change' | 'blur' | 'submit';
  priority: 'store' | 'model';
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
  priority!: string;

  formDirective!: NgForm | FormGroupDirective;

  initialized$ = new BehaviorSubject<boolean>(false);
  destroyed$ = new BehaviorSubject<boolean>(false);

  onInit$!: Observable<any>;
  onUpdate$!: Observable<any>;
  onSubmit$!: Observable<any>;

  private subs = {} as any;

  private blurCallback = (control: NgControl) => (value: any) => {
    if(this.updateOn === 'blur' && control.path && control.control) {
      control.control.setValue(control.value, {emitEvent: control.control.updateOn === 'blur'});
      this.store.dispatch(updateControl({ path: this.path, property: control.path.join('.'), value: control.value }));
    }
  }

  private func = this.setControlValue.bind(this);
  private inputCallback = (control: NgControl) => (value: any) => {
    sampleTime(this.func, this.debounceTime, () => this.destroyed$.value)(control, value);
  }

  constructor(
    @Optional() @Self() @Inject(ChangeDetectorRef) public cdr: ChangeDetectorRef,
    @Optional() @Self() @Inject(ElementRef) public elRef: ElementRef,
    @Inject(Injector) public injector: Injector,
    @Inject(Store) public store: Store
  ) {
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
    this.priority = config.priority;

    if (!this.path) {
      throw new Error('The path property is not provided for the directive');
    }

    if (!this.formDirective) {
      throw new Error('Form group directive not found');
    }

    this.onInit$ = this.store.select(selectFormState(this.path, true)).pipe(
      take(1),
      tap((formState) => { this.priority === 'store' && this.formDirective.form.patchValue(formState, {emitEvent: this.formDirective.form.updateOn === 'change'}); }),
      switchMap((formState) => defer(() => this.controls.changes.pipe(startWith(this.controls))).pipe(
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
        tap((value) => {
          if(value === 1) {
            formState = this.priority === 'model' ? deepClone(this.formDirective.form.value) : formState;
            this.store.dispatch(autoInit({path: this.path, value: formState, noclone: true}));
            this.initialized$.next(true); this.initialized$.complete();
          } else {
            this.store.dispatch(updateForm({ path: this.path, value: this.formValue, noclone: true })); }
          }),
      )),
      takeWhile(() => !this.destroyed$.value),
    )

    this.onSubmit$ = fromEvent(this.elRef.nativeElement, 'submit').pipe(
      filter(() => this.formDirective.form.valid),
      mergeMap(() => this.store.select(selectFormState(this.path)).pipe(take(1), map((formState) => formState))),
      tap((formState) => {
        if(this.updateOn === 'submit') {
          const formValue = this.formValue;
          this.formDirective.form.updateOn === "submit" && this.formDirective.form.updateValueAndValidity(),
          deepEqual(formState, formValue) || this.store.dispatch(updateForm({ path: this.path, value: formValue, noclone: true }));
        }
      }),
      tap(() => ( this.store.dispatch(autoSubmit({ path: this.path })))),
      takeWhile(() => !this.destroyed$.value)
    );

    const updateEffect$ = effect(FormActions.UpdateForm, (action: Action<any>, state: any, dependencies: any) => {
      return this.store.select(selectFormState(this.path)).pipe(take(1), map((formState) => formState), tap((formState) => {
        this.formDirective.form.patchValue(formState, {emitEvent: this.formDirective.form.updateOn === 'change'});
      }),
      takeWhile(() => !this.destroyed$.value))
    });

    this.onUpdate$ = this.store.extend(updateEffect$());

    this.subs.a = this.onInit$.subscribe();
    this.subs.b = this.onSubmit$.subscribe();
    this.subs.c = this.onUpdate$.subscribe();

  }

  ngAfterContentInit() {
    // the subscription has to be made after the ngAfterContentInit method completion
    // to avoid collisions by callback method registration
    asyncScheduler.schedule(() => {
      this.subs.d = this.onInit$.subscribe();
    });
  }

  ngOnDestroy() {
    this.store.dispatch(formDestroyed({ path: this.path, value: this.formValue }));

    this.destroyed$.next(true);
    this.destroyed$.complete();

    for (const key of Object.keys(this.subs)) {
      this.subs[key].unsubscribe();
    }
  }

  setControlValue(control: NgControl, value: any) {
    if(control.value !== value && control.control) {
      control.control.setValue(value, {emitEvent: control.control.updateOn === 'change'});
    }
    if(this.updateOn === 'change' && control.path) {
      this.store.dispatch(updateControl({ path: this.path, property: control.path.join('.'), value: value }));
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
