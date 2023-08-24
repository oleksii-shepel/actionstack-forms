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
  tap
} from 'rxjs';
import {
  SYNC_OPTIONS_DEFAULT,
  SYNC_OPTIONS_TOKEN,
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

  dir!: NgForm | FormGroupDirective;

  destroyed = false;

  initialized$ = new BehaviorSubject<boolean>(false);

  subs = {} as any;

  blurCallback = (control: NgControl) => (value: any) => {
    if(this.updateOn === 'blur' && control.path && control.control) {
      control.control.setValue(control.value, {emitEvent: control.control.updateOn === 'blur'});
      this.store.dispatch(UpdateField({ path: this.path, property: control.path.join('.'), value: control.value }));
    }
  }

  func = this.setControlValue.bind(this);
  inputCallback = (control: NgControl) => (value: any) => {
    sampleTime(this.func, this.debounceTime)(control, value);
  }

  onInit$!: Observable<any>;
  onUpdate$!: Observable<any>;
  onControlsChanges$!: Observable<any>;
  onSubmit$!: Observable<any>;

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
      throw new Error('Misuse of sync directive');
    }

    if (!this.dir) {
      throw new Error('Supported form control directive not found');
    }

    this.onInit$ = this.store.select(selectFormState(this.path)).pipe(
      take(1),
      tap(formState => {

        if(formState) {
          this.dir.form.patchValue(formState, {emitEvent: this.dir.form.updateOn === 'change'});
          this.store.dispatch(AutoInit({ path: this.path, value: formState }));
        } else {
          this.store.dispatch(AutoInit({ path: this.path, value: this.dir.form.value }));
        }

        this.initialized$.next(true);
      }),
    )

    this.onSubmit$ = fromEvent(this.elRef.nativeElement, 'submit').pipe(
      filter(() => this.dir.form.valid),
      mergeMap((value) => from(this.initialized$).pipe(filter(value => value), take(1), map(() => value))),
      tap(() => {
        if(this.updateOn === 'submit') {
          this.dir.form.updateOn === 'submit' ? this.dir.form.updateValueAndValidity() : null;
          this.store.dispatch(UpdateForm({ path: this.path, value: this.formValue }));
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

        this.dir.form.patchValue(formState, {emitEvent: this.dir.form.updateOn === 'change'});

      }),
      takeWhile(() => !this.destroyed)
    );

    this.onControlsChanges$ = defer(() => this.controls.changes.pipe(startWith(this.controls))).pipe(
      observeOn(asyncScheduler), // to avoid collisions by control addition
      tap((controls) => {
        controls.forEach((control: NgControl) => {
          if(control.valueAccessor) {
            control.valueAccessor.registerOnChange(this.inputCallback(control));
            control.valueAccessor.registerOnTouched(this.blurCallback(control));
          }
        });
      }),
      scan((acc, _) => acc + 1, 0),
      tap((value) => { if (value > 1) { this.store.dispatch(UpdateForm({ path: this.path, value: this.formValue })); }}),
      takeWhile(() => !this.destroyed),
    );

    this.subs.a = this.onInit$.subscribe();
    this.subs.b = this.onUpdate$.subscribe();
    this.subs.c = this.onSubmit$.subscribe();
  }

  ngAfterContentInit() {
    // this subscription has to be made after ngAfterContentInit method completion
    // to avoid collisions by control updates
    asyncScheduler.schedule(() => { this.subs.d = this.onControlsChanges$.subscribe(); });
  }

  ngOnDestroy() {
    this.store.dispatch(FormDestroyed({ path: this.path }));

    for (const sub of Object.keys(this.subs)) {
      this.subs[sub].unsubscribe();
    }

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
}
