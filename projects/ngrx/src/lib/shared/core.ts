import { Directive, Input, OnInit, OnDestroy, ChangeDetectorRef, Inject } from '@angular/core';
import { FormGroupDirective, NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { UpdateFormStatus, UpdateFormValue, UpdateFormDirty, UpdateFormErrors, UpdateForm, InitForm } from './actions';
import { getValue } from '.';

@Directive({
   selector: 'sync-directive'
 })
export class SyncDirective implements OnInit, OnDestroy {
  @Input('ngStore') path!: string;
  @Input('ngStoreDebounce') debounce = 100;
  @Input('ngStoreClearOnDestroy') clearOnDestroy: boolean = false;

  private _destroyed$ = new Subject<boolean>();
  private _updating = false;

  constructor(
    @Inject('form') public form: NgForm | FormGroupDirective,
    public store: Store,
    public cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if(!this.path) {
      throw new Error("Misuse of sync directive");
    }

    if(!this.form) {
      throw new Error("Supported form control directive not found");
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
      .subscribe(_ => {
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
