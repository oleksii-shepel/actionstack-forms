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
  tap,
  withLatestFrom
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
  destroyed$ = new BehaviorSubject<boolean>(false);

  onInit$!: Observable<any>;
  onUpdate$!: Observable<any>;
  onSubmit$!: Observable<any>;

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
      }),
      withLatestFrom(defer(() => this.controls.changes.pipe(startWith(this.controls))).pipe(
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
        tap((value) => { if(value === 1) { this.initialized$.next(true); this.initialized$.complete(); } else { this.store.dispatch(UpdateForm({ path: this.path, value: this.formValue, noclone: true })); }}),
      )),
      takeWhile(() => !this.destroyed$.value),
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
      takeWhile(() => !this.destroyed$.value)
    );

    this.onUpdate$ = this.actionsSubject.pipe(
      skip(1),
      filter((action: any) => action && action.path === this.path && action.type === FormActions.UpdateForm),
      mergeMap(() => this.store.select(selectFormState(this.path)).pipe(take(1), map((formState) => formState))),
      tap((formState) => {
        this.formDirective.form.patchValue(formState, {emitEvent: this.formDirective.form.updateOn === 'change'});
      }),
      takeWhile(() => !this.destroyed$.value)
    );

    this.subs.a = this.onUpdate$.subscribe();
    this.subs.b = this.onSubmit$.subscribe();
  }

  ngAfterContentInit() {
    // the subscription has to be made after the ngAfterContentInit method completion
    // to avoid collisions by callback method registration
    asyncScheduler.schedule(() => {
      this.subs.c = this.onInit$.subscribe();
    });
  }

  ngOnDestroy() {
    this.store.dispatch(FormDestroyed({ path: this.path }));

    for (const key of Object.keys(this.subs)) {
      this.subs[key].unsubscribe();
    }

    this.destroyed$.next(true);
    this.destroyed$.complete();
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
