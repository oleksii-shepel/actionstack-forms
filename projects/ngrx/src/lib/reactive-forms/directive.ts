import { Directive, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { UpdateFormStatus, UpdateFormValue, UpdateFormDirty, UpdateFormErrors, UpdateForm } from '../shared/actions';
import { getValue } from '../shared';

@Directive({ selector: '[formGroup][ngStore]' })
export class ReactiveStoreDirective implements OnInit, OnDestroy {
  @Input('ngStore') path!: string;
  @Input('ngStoreDebounce') debounce = 100;
  @Input('ngStoreClearOnDestroy') clearOnDestroy: boolean = false;

  private _destroyed$ = new Subject<boolean>();
  private _updating = false;

  constructor(
    public store: Store<any>,
    private formGroupDirective: FormGroupDirective,
    private c: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if(!this.path) {
      throw new Error("Misuse of ngrxForm directive");
    }

    if(!this.formGroupDirective) {
      throw new Error("formGroup directive not found");
    }

    this.store
      .select(state => getValue(state, `${this.path}.model`))
      .pipe(takeUntil(this._destroyed$))
      .subscribe(model => {
        if (!this._updating) {
          this._updating = false;
          if (model) {
            this.formGroupDirective.form.patchValue(model);
            this.c.markForCheck();
          }
        }
      });

    this.store
      .select(state => getValue(state, `${this.path}.dirty`))
      .pipe(takeUntil(this._destroyed$))
      .subscribe(dirty => {
        if (this.formGroupDirective.form.dirty !== dirty) {
          if (dirty === true) {
            this.formGroupDirective.form.markAsDirty();
            this.c.markForCheck();
          } else if (dirty === false) {
            this.formGroupDirective.form.markAsPristine();
            this.c.markForCheck();
          }
        }
      });

    this.store
      .select(state => getValue(state, `${this.path}.disabled`))
      .pipe(takeUntil(this._destroyed$))
      .subscribe(disabled => {
        if (this.formGroupDirective.form.disabled !== disabled) {
          if (disabled === true) {
            this.formGroupDirective.form.disable();
            this.c.markForCheck();
          } else if (disabled === false) {
            this.formGroupDirective.form.enable();
            this.c.markForCheck();
          }
        }
      });



    this.formGroupDirective.valueChanges!
      .pipe(debounceTime(this.debounce), takeUntil(this._destroyed$))
      .subscribe(value => {
        this._updating = true;
        this.store.dispatch(
          new UpdateFormValue({
            path: this.path,
            value
          })
        );

        this.store.dispatch(
          new UpdateFormDirty({
            path: this.path,
            dirty: this.formGroupDirective.dirty
          })
        );

        this.store.dispatch(
          new UpdateFormErrors({
            path: this.path,
            errors: this.formGroupDirective.errors
          })
        );
      });

    this.formGroupDirective.statusChanges!
      .pipe(debounceTime(this.debounce), takeUntil(this._destroyed$))
      .subscribe(status => {
        this.store.dispatch(
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
