import { Directive, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { UpdateFormStatus, UpdateFormValue, UpdateFormDirty, UpdateFormErrors, UpdateForm } from '../shared/actions';

const getValue = (obj: any, prop: string) => prop.split('.').reduce((acc, part) => acc && acc[part], obj);

@Directive({ selector: 'form:not([ngNoForm]):not([formGroup])[ngStore],ng-form[ngStore],[ngForm][ngStore]' })
export class StoreDirective implements OnInit, OnDestroy {
  @Input('ngStore') path!: string;
  @Input('ngStoreDebounce') debounce = 100;
  @Input('ngStoreClearOnDestroy') clearOnDestroy: boolean = false;

  private _destroyed$ = new Subject<boolean>();
  private _updating = false;

  constructor(
    private _store: Store<any>,
    private _form: NgForm,
    private _cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if(!this.path) {
      throw new Error("Misuse of ngrxForm directive");
    }

    if(!this._form) {
      throw new Error("ngForm directive not found");
    }

    this._store
      .select(state => getValue(state, `${this.path}.model`))
      .pipe(takeUntil(this._destroyed$))
      .subscribe(model => {
        if (!this._updating) {
          this._updating = false;
          if (model) {
            this._form.form.patchValue(model);
            this._cd.markForCheck();
          }
        }
      });

    this._store
      .select(state => getValue(state, `${this.path}.dirty`))
      .pipe(takeUntil(this._destroyed$))
      .subscribe(dirty => {
        if (this._form.form.dirty !== dirty) {
          if (dirty === true) {
            this._form.form.markAsDirty();
            this._cd.markForCheck();
          } else if (dirty === false) {
            this._form.form.markAsPristine();
            this._cd.markForCheck();
          }
        }
      });

    this._store
      .select(state => getValue(state, `${this.path}.disabled`))
      .pipe(takeUntil(this._destroyed$))
      .subscribe(disabled => {
        if (this._form.form.disabled !== disabled) {
          if (disabled === true) {
            this._form.form.disable();
            this._cd.markForCheck();
          } else if (disabled === false) {
            this._form.form.enable();
            this._cd.markForCheck();
          }
        }
      });



    this._form.valueChanges!
      .pipe(debounceTime(this.debounce), takeUntil(this._destroyed$))
      .subscribe(value => {
        this._updating = true;
        this._store.dispatch(
          new UpdateFormValue({
            path: this.path,
            value
          })
        );

        this._store.dispatch(
          new UpdateFormDirty({
            path: this.path,
            dirty: this._form.dirty
          })
        );

        this._store.dispatch(
          new UpdateFormErrors({
            path: this.path,
            errors: this._form.errors
          })
        );
      });

    this._form.statusChanges!
      .pipe(debounceTime(this.debounce), takeUntil(this._destroyed$))
      .subscribe(status => {
        this._store.dispatch(
          new UpdateFormStatus({
            path: this.path,
            status
          })
        );
      });
  }

  ngOnDestroy() {
    this._destroyed$.next(true);
    this._destroyed$.complete();

    if (this.clearOnDestroy) {
      this._store.dispatch(
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
