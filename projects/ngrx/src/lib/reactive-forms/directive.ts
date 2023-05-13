import { Directive, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { UpdateFormStatus, UpdateFormValue, UpdateFormDirty, UpdateFormErrors, UpdateForm } from '../shared/actions';

const getValue = (obj: any, prop: string) => prop.split('.').reduce((acc, part) => acc && acc[part], obj);

@Directive({ selector: '[formGroup][ngStore]' })
export class ReactiveStoreDirective implements OnInit, OnDestroy {
  @Input('ngStore') path!: string;
  @Input('ngStoreDebounce') debounce = 100;
  @Input('ngStoreClearOnDestroy') clearOnDestroy: boolean = false;

  private _destroyed$ = new Subject<boolean>();
  private _updating = false;

  constructor(
    private _store: Store<any>,
    private _formGroupDirective: FormGroupDirective,
    private _cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if(!this.path) {
      throw new Error("Misuse of ngrxForm directive");
    }

    if(!this._formGroupDirective) {
      throw new Error("formGroup directive not found");
    }

    this._store
      .select(state => getValue(state, `${this.path}.model`))
      .pipe(takeUntil(this._destroyed$))
      .subscribe(model => {
        if (!this._updating) {
          this._updating = false;
          if (model) {
            this._formGroupDirective.form.patchValue(model);
            this._cd.markForCheck();
          }
        }
      });

    this._store
      .select(state => getValue(state, `${this.path}.dirty`))
      .pipe(takeUntil(this._destroyed$))
      .subscribe(dirty => {
        if (this._formGroupDirective.form.dirty !== dirty) {
          if (dirty === true) {
            this._formGroupDirective.form.markAsDirty();
            this._cd.markForCheck();
          } else if (dirty === false) {
            this._formGroupDirective.form.markAsPristine();
            this._cd.markForCheck();
          }
        }
      });

    this._store
      .select(state => getValue(state, `${this.path}.disabled`))
      .pipe(takeUntil(this._destroyed$))
      .subscribe(disabled => {
        if (this._formGroupDirective.form.disabled !== disabled) {
          if (disabled === true) {
            this._formGroupDirective.form.disable();
            this._cd.markForCheck();
          } else if (disabled === false) {
            this._formGroupDirective.form.enable();
            this._cd.markForCheck();
          }
        }
      });



    this._formGroupDirective.valueChanges!
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
            dirty: this._formGroupDirective.dirty
          })
        );

        this._store.dispatch(
          new UpdateFormErrors({
            path: this.path,
            errors: this._formGroupDirective.errors
          })
        );
      });

    this._formGroupDirective.statusChanges!
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
