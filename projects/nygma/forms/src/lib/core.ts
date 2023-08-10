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
  defer,
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
  UpdateField,
  UpdateForm,
} from './actions';
import { selectFormState } from './reducers';


export interface NygmaConfig {
  slice: string;
  debounceTime?: number;
  resetOnDestroy?: boolean;
  updateOn?: 'change' | 'blur' | 'submit';
}


@Directive({
  selector:
    `form:not([ngNoForm]):not([formGroup])[sync],ng-form[sync],[ngForm][sync],[formGroup][sync]`,
  exportAs: 'sync',
})
export class SyncDirective implements OnInit, OnDestroy, AfterContentInit {
  @Input('sync') config!: string | NygmaConfig;
  @ContentChildren(NgControl, {descendants: true}) controls!: QueryList<NgControl>;

  split!: string;
  debounceTime!: number;
  updateOn!: string;
  resetOnDestroy!: boolean;

  dir!: NgForm | FormGroupDirective;

  referenceState: any = undefined;
  destroyed = false;

  eventListeners = new Map<NgControl, any>();
  initialized$ = new BehaviorSubject<boolean>(false);

  subs = {} as any;

  blurCallback = (control: NgControl) => (event: Event) => {
    if(this.updateOn === 'blur' && control.path && control.control) {
      control.control.setValue(control.value, {emitEvent: control.control.updateOn === 'blur'});
      this.store.dispatch(UpdateField({ split: `${this.split}::${control.path.join('.')}`, value: control.value }));
    }
  }

  inputCallback = (control: NgControl) => (event : Event) => {
    const value = (event.target as any)?.value;
    if(control.control) {
      control.control.setValue(value, {emitEvent: control.control.updateOn === 'change'});

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
    this.resetOnDestroy = config.resetOnDestroy;

    if (!this.split) {
      throw new Error('Misuse of sync directive');
    }

    if (!this.dir) {
      throw new Error('Supported form control directive not found');
    }

    this.onInit$ = this.store.select(selectFormState(this.split)).pipe(
      take(1),
      tap(formState => {

        if(formState) {
          this.dir.form.patchValue(formState, {emitEvent: this.dir.form.updateOn === 'change'});
          this.store.dispatch(AutoInit({ split: this.split, value: formState }));
        } else {
          this.store.dispatch(AutoInit({ split: this.split, value: this.dir.form.value }));
        }

        this.dir.form.markAsPristine();
        this.referenceState = formState ?? this.dir.form.value;
        this.initialized$.next(true);
      }),
    )

    this.onSubmit$ = fromEvent(this.elRef.nativeElement, 'submit').pipe(
      filter(() => this.dir.form.valid),
      mergeMap((value) => from(this.initialized$).pipe(filter(value => value), take(1), map(() => value))),
      tap(() => {

        this.referenceState = this.formValue;

        if(this.updateOn === 'submit') {
          this.dir.form.updateOn === 'submit' ? this.dir.form.updateValueAndValidity() : null;
          this.store.dispatch(UpdateForm({ split: this.split, value: this.referenceState }));
        }
      }),
      tap(() => ( this.store.dispatch(AutoSubmit({ split: this.split })))),
      takeWhile(() => !this.destroyed)
    );

    this.onUpdateField$ = this.actionsSubject.pipe(
      filter((action: any) => action && action.split?.startsWith(this.split) && action.type === FormActions.UpdateField),
      sampleTime(this.debounceTime),
      mergeMap((value) => from(this.initialized$).pipe(filter(value => value), take(1), map(() => value))),
      mergeMap(() => this.store.select(selectFormState(this.split)).pipe(take(1), map((formState) => formState))),
      tap((formState) => {

        const notEqual = !deepEqual(formState, this.referenceState);

        if(this.dir.form.dirty !== notEqual) {
          notEqual ? this.dir.form.markAsDirty() : this.dir.form.markAsPristine();
        }
      }),
      takeWhile(() => !this.destroyed)
    );

    this.onUpdate$ = this.actionsSubject.pipe(
      skip(1),
      filter((action: any) => action && action.split === this.split && action.type === FormActions.UpdateForm),
      mergeMap(() => this.store.select(selectFormState(this.split)).pipe(take(1), map((formState) => formState))),
      tap((formState) => {

        this.dir.form.patchValue(formState, {emitEvent: this.dir.form.updateOn === 'change'});
        const dirty = !deepEqual(formState, this.referenceState);

        if(this.dir.form.dirty !== dirty) {
          dirty ? this.dir.form.markAsDirty() : this.dir.form.markAsPristine();
        }
      }),
      takeWhile(() => !this.destroyed)
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
      takeWhile(() => !this.destroyed),
    );

    this.subs.a = this.onUpdateField$.subscribe();
    this.subs.b = this.onInit$.subscribe();
    this.subs.c = this.onUpdate$.subscribe();
    this.subs.d = this.onSubmit$.subscribe();
  }

  ngAfterContentInit() {
    this.subs.e = this.onControlsChanges$.subscribe();
  }

  ngOnDestroy() {
    this.store.dispatch(FormDestroyed({ split: this.split }));

    for (const sub of Object.keys(this.subs)) {
      this.subs[sub].unsubscribe();
    }

    this.initialized$.complete();

    if(this.resetOnDestroy) {
      this.store.dispatch(UpdateForm({ split: this.split, value: this.referenceState }));
    }

    this.destroyed = true;
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
