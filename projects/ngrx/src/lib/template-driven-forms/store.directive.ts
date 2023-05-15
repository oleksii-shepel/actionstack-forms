import { Directive, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { UpdateFormStatus, UpdateFormValue, UpdateFormDirty, UpdateFormErrors, UpdateForm, InitForm } from '../shared/actions';
import { getValue } from '../shared';
import { initialProfile } from 'projects/app/src/app/models/profile';

@Directive({ selector: 'form:not([ngNoForm]):not([formGroup])[ngStore],ng-form[ngStore],[ngForm][ngStore]' })
export class StoreDirective implements OnInit, OnDestroy {
  @Input('ngStore') path!: string;
  @Input('ngStoreDebounce') debounce = 100;
  @Input('ngStoreClearOnDestroy') clearOnDestroy: boolean = false;

  private _destroyed$ = new Subject<boolean>();
  private _updating = false;

  constructor(
    public store: Store<any>,
    private form: NgForm,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if(!this.path) {
      throw new Error("Misuse of ngrxForm directive");
    }

    if(!this.form) {
      throw new Error("ngForm directive not found");
    }

    this.store
      .select(state => getValue(state, `${this.path}.model`))
      .pipe(takeUntil(this._destroyed$))
      .subscribe(model => {
        if (!this._updating) {
          this._updating = false;
          if (model) {
            this.form.form.patchValue(model);
            this.cdr.markForCheck();
          }
        }
      });

    this.store
      .select(state => getValue(state, `${this.path}.dirty`))
      .pipe(takeUntil(this._destroyed$))
      .subscribe(dirty => {
        if (this.form.form.dirty !== dirty) {
          if (dirty === true) {
            this.form.form.markAsDirty();
            this.cdr.markForCheck();
          } else if (dirty === false) {
            this.form.form.markAsPristine();
            this.cdr.markForCheck();
          }
        }
      });

    this.store
      .select(state => getValue(state, `${this.path}.disabled`))
      .pipe(takeUntil(this._destroyed$))
      .subscribe(disabled => {
        if (this.form.form.disabled !== disabled) {
          if (disabled === true) {
            this.form.form.disable();
            this.cdr.markForCheck();
          } else if (disabled === false) {
            this.form.form.enable();
            this.cdr.markForCheck();
          }
        }
      });



    this.form.valueChanges!
      .pipe(debounceTime(this.debounce), takeUntil(this._destroyed$))
      .subscribe(value => {
        this._updating = true;
        this.store.dispatch(
          new UpdateFormValue({
            path: this.path,
            value: this.form.value
          })
        );

        this.store.dispatch(
          new UpdateFormDirty({
            path: this.path,
            dirty: this.form.dirty
          })
        );

        this.store.dispatch(
          new UpdateFormErrors({
            path: this.path,
            errors: this.form.errors
          })
        );
      });

    this.form.statusChanges!
      .pipe(debounceTime(this.debounce), takeUntil(this._destroyed$))
      .subscribe(status => {
        this.store.dispatch(
          new UpdateFormStatus({
            path: this.path,
            status
          })
        );
      });

    this.form.form.patchValue(initialProfile);
    this.store.dispatch(new InitForm({ value: initialProfile, path: this.path }));
  }

  ngOnDestroy() {
    this._destroyed$.next(true);
    this._destroyed$.complete();

    if (this.clearOnDestroy) {
      this.store.dispatch(
        new UpdateForm({
          path: this.path,
          value: null,
          dirty: null,
          status: null,
          errors: null
        })
      );
    }
  }
}
