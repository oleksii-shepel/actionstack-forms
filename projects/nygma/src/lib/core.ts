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
  defer,
  distinctUntilChanged,
  filter,
  from,
  fromEvent,
  map,
  mergeMap,
  sampleTime,
  skip,
  startWith,
  take,
  takeWhile,
  tap
} from 'rxjs';
import {
  NYGMA_CONFIG_DEFAULT,
  NYGMA_CONFIG_TOKEN,
  deepEqual,
  getValue,
  setValue
} from '.';
import {
  AutoInit,
  AutoSubmit,
  FormActions,
  FormDestroyed,
  UpdateDirty,
  UpdateErrors,
  UpdateField,
  UpdateForm,
  UpdateReference,
  UpdateStatus
} from './actions';
import { selectFormCast } from './reducers';


export interface NygmaConfig {
  slice: string;
  debounceTime?: number;
  enableQueue?: boolean;
  updateOn?: 'change' | 'blur' | 'submit';
}


@Directive({
  selector:
    `form:not([ngNoForm]):not([formGroup])[nygma],ng-form[nygma],[ngForm][nygma],[formGroup][nygma]`,
  exportAs: 'nygma',
})
export class SyncDirective implements OnInit, OnDestroy, AfterContentInit {
  @Input('nygma') config!: string | NygmaConfig;
  @ContentChildren(NgControl, {descendants: true}) controls!: QueryList<NgControl>;

  split!: string;
  debounceTime!: number;
  updateOn!: string;

  dir!: NgForm | FormGroupDirective;

  initialState: any = undefined;
  referenceState: any = undefined;
  submittedState: any = undefined;
  destoyed = false;

  eventListeners = new Map<NgControl, any>();
  initialized$ = new BehaviorSubject<boolean>(false);

  subs = {} as any;

  blurCallback = (control: NgControl) => (event: Event) => {
    if(this.updateOn === 'blur' && control.path) {
      this.store.dispatch(UpdateField({ split: `${this.split}::${control.path.join('.')}`, value: control.value }));
    }
  }

  inputCallback = (control: NgControl) => (event : Event) => {
    const value = (event.target as any)?.value;
    if(control.value !== value && control.control) {
      control.control.setValue(value);

      const savedState = control.path ? getValue(this.referenceState, control.path.join('.')) : undefined;
      !(savedState === control.value) ? control.control.markAsDirty() : control.control.markAsPristine();
    }
    if(this.updateOn === 'change' && control.path) {
      this.store.dispatch(UpdateField({ split: `${this.split}::${control.path.join('.')}`, value: value }));
    }
  }

  onInit$!: Observable<any>;
  onUpdate$!: Observable<any>;
  onControlsChanges$!: Observable<any>;
  onSubmit$!: Observable<any>;
  onReset$!: Observable<any>;
  onStatusChanges$!: Observable<any>;
  onUpdateField$!: Observable<any>;

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

    let config = this.injector.get<any>(NYGMA_CONFIG_TOKEN, {});
    config = Object.assign(NYGMA_CONFIG_DEFAULT, config);

    if(typeof this.config === 'string') {
      this.split = this.config;
    } else {
      config = Object.assign(config, this.config);
      this.split = config.slice;
    }

    this.debounceTime = config.debounceTime;
    this.updateOn = config.updateOn;

    if (!this.split) {
      throw new Error('Misuse of sync directive');
    }

    if (!this.dir) {
      throw new Error('Supported form control directive not found');
    }

    this.onInit$ = this.store.select(selectFormCast(this.split)).pipe(
      take(1),
      tap(formCast => {

        if(formCast.value) {
          this.dir.form.patchValue(formCast.value, {emitEvent: false});
          formCast.dirty? this.dir.form.markAsDirty() : this.dir.form.markAsPristine();

          this.store.dispatch(AutoInit({ split: this.split, value: formCast.value }));
          this.store.dispatch(UpdateDirty({ split: this.split, dirty: formCast.dirty }));

        } else {
          this.store.dispatch(AutoInit({ split: this.split, value: this.dir.form.value }));
          this.store.dispatch(UpdateDirty({ split: this.split, dirty: this.dir.form.dirty }));
        }

        this.dir.form.updateValueAndValidity();
        this.cdr.markForCheck();

        this.initialState = formCast.value ?? this.dir.form.value;

        if(!formCast.reference) {
          this.referenceState = this.initialState;
          this.store.dispatch(UpdateReference({ split: this.split, value: this.referenceState }));
        }

        this.initialized$.next(true);
      }),
    )

    this.onSubmit$ = fromEvent(this.elRef.nativeElement, 'submit').pipe(
      filter(() => this.dir.form.valid),
      mergeMap((value) => from(this.initialized$).pipe(filter(value => value), take(1), map(() => value))),
      tap(() => {

        this.submittedState = this.formValue;
        this.referenceState = this.submittedState;

        if(this.updateOn === 'submit') {
          this.store.dispatch(UpdateReference({ split: this.split, value: this.referenceState }));
          this.store.dispatch(UpdateForm({ split: this.split, value: this.submittedState }));
        }
      }),
      tap(() => ( this.store.dispatch(AutoSubmit({ split: this.split })))),
      takeWhile(() => !this.destoyed)
    );

    this.onUpdateField$ = this.actionsSubject.pipe(
      filter((action: any) => action && action.split?.startsWith(this.split) && action.type === FormActions.UpdateField),
      sampleTime(this.debounceTime),
      mergeMap((value) => from(this.initialized$).pipe(filter(value => value), take(1), map(() => value))),
      mergeMap(() => this.store.select(selectFormCast(this.split)).pipe(take(1), map((formCast) => formCast))),
      tap((formCast) => {

        const notEqual = !deepEqual(formCast.value, formCast.reference);

        if(formCast.dirty !== notEqual) {
          notEqual ? this.dir.form.markAsDirty() : this.dir.form.markAsPristine();
          this.store.dispatch(UpdateDirty({ split: this.split, dirty: notEqual }));
        }
      }),
      takeWhile(() => !this.destoyed)
    );

    this.onUpdate$ = this.actionsSubject.pipe(
      skip(1),
      filter((action: any) => action && action.split === this.split && action.type === FormActions.UpdateForm),
      mergeMap(() => this.store.select(selectFormCast(this.split)).pipe(take(1), map((formCast) => formCast))),
      tap((formCast) => {

        this.dir.form.patchValue(formCast.value, {emitEvent: false});
        const dirty = !deepEqual(formCast.value, formCast.reference);

        if(this.dir.form.dirty !== dirty) {
          dirty ? this.dir.form.markAsDirty() : this.dir.form.markAsPristine();
          this.store.dispatch(UpdateDirty({ split: this.split, dirty: dirty }));
        }

        this.dir.form.updateValueAndValidity();
        this.cdr.markForCheck();
      }),
      takeWhile(() => !this.destoyed)
    );

    this.onControlsChanges$ = defer(() => this.controls.changes.pipe(startWith(this.controls))).pipe(
      tap(() => {
        this.controls.forEach((control: NgControl) => {
          const nativeElement = (control.valueAccessor as any)?._elementRef?.nativeElement;
          if(nativeElement) {
            let listeners = this.eventListeners.get(control);
            if(listeners) {
              nativeElement.removeEventListener('input', listeners['input']);
              nativeElement.removeEventListener('blur', listeners['blur']);
            }

            listeners = {'input': this.inputCallback(control), 'blur': this.blurCallback(control)};
            nativeElement.addEventListener('input', listeners['input']);
            nativeElement.addEventListener('blur', listeners['blur']);
            this.eventListeners.set(control, listeners);
          }
        });
      }),
      skip(1),
      tap(() => { this.store.dispatch(UpdateForm({ split: this.split, value: this.formValue })); }),
      takeWhile(() => !this.destoyed),
    );

    this.onReset$ = this.actionsSubject.pipe(
      filter((action: any) => action && action.split === this.split && action.type === FormActions.ResetForm),
      mergeMap((value) => from(this.initialized$).pipe(filter(value => value), take(1), map(() => value))),
      tap((action: any) => {
        if(action.state){
          switch(action.state) {
            case 'initial':
              this.store.dispatch(UpdateForm({ split: this.split, value: this.initialState || {} }));
              break;
            case 'submitted':
              this.store.dispatch(UpdateForm({ split: this.split, value: this.submittedState || {} }));
              break;
            case 'blank':
              this.store.dispatch(UpdateForm({ split: this.split, value: this.reset() }));
              break;
          }
        }
      }),
      takeWhile(() => !this.destoyed)
    );

    this.onStatusChanges$ = this.dir.form.statusChanges.pipe(
      mergeMap((value) => from(this.initialized$).pipe(filter(value => value), take(1), map(() => value))),
      map((value) => ({ status: value as any, errors: this.dir.form.errors as any})),
      distinctUntilChanged((a, b) => a.status === b.status && deepEqual(a.errors, b.errors)),
      tap((value) => {
        if(value.status !== 'PENDING') {
          this.store.dispatch(UpdateStatus({ split: this.split, status: value.status }));
          this.store.dispatch(UpdateErrors({ split: this.split, errors: value.errors }));
        }
      }),
      takeWhile(() => !this.destoyed),
    );

    this.subs.a = this.onStatusChanges$.subscribe();
    this.subs.b = this.onUpdateField$.subscribe();
    this.subs.c = this.onInit$.subscribe();
    this.subs.d = this.onUpdate$.subscribe();
    this.subs.e = this.onSubmit$.subscribe();
    this.subs.f = this.onReset$.subscribe();
  }

  ngAfterContentInit() {
    this.subs.g = this.onControlsChanges$.subscribe();
  }

  ngOnDestroy() {
    this.store.dispatch(FormDestroyed({ split: this.split }));

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