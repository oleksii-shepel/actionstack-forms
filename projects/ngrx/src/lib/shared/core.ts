import { Directive, Input, OnInit, OnDestroy, ChangeDetectorRef, Inject } from '@angular/core';
import { FormGroupDirective, NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, debounceTime, filter, takeWhile, repeat, first, timer, take } from 'rxjs';
import { UpdateFormStatus, UpdateFormValue, UpdateFormDirty, UpdateFormErrors, InitForm, ResetForm } from './actions';
import { getValue } from '.';
import { checkFormGroup } from '../shared';

export interface SyncDirectiveOptions {
  slice: string;
  state?: any;
  debounce?: number;
  clearOnDestroy?: boolean;
}

@Directive({
   selector: 'sync-directive'
 })
export class SyncDirective implements OnInit, OnDestroy {
  @Input('ngync') options!: string | SyncDirectiveOptions;

  path!: string;
  state!: any;
  debounce!: number;
  clearOnDestroy!: boolean;

  private _destroyed$ = new Subject<boolean>();
  private _initialized$ = new Subject<boolean>();

  private _initialized = false;
  private _updating = false;

  constructor(
    @Inject('form') public form: NgForm | FormGroupDirective,
    public store: Store,
    public cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    if(typeof this.options === 'string') {
      this.path = this.options;
      this.state = undefined;
      this.debounce = 100;
      this.clearOnDestroy = false;
    } else {
      this.path = this.options.slice;
      this.state = this.options.state;
      this.debounce = this.options.debounce || 100;
      this.clearOnDestroy = this.options.clearOnDestroy || false;
    }

    if(!this.path) {
      throw new Error("Misuse of sync directive");
    }

    if(!this.form) {
      throw new Error("Supported form control directive not found");
    }

    if(!!this.state) {
      this.store.dispatch(
        new InitForm({
          path: this.path,
          value: this.state
        })
      );
    } else {
      // check if state is present in the store and if so initialize the form
      this.store.select(state => getValue(state, `${this.path}`)).pipe(
        first(),
        repeat({ delay: (count) => timer(count * this.debounce) }),
        take(5),
        takeWhile(() => !this._initialized),
      ).subscribe((state) => {
        if(checkFormGroup(this.form.form, state?.model)) {
          this._initialized = true;

          if(!!state?.model) {
            this.form.form.patchValue({... state.model});
            this.cdr.markForCheck();
          }

          this.store.dispatch(
            new InitForm({
              path: this.path,
              value: state
            })
          );
        }
      });
    }

    this.store
      .select(state => getValue(state, `${this.path}.model`))
      .pipe(takeUntil(this._destroyed$))
      .subscribe(model => {
        if (!this._updating) {
          this._updating = false;
          if (model) {
            this.form.form.patchValue({...model});
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
      .pipe(
        debounceTime(this.debounce),
        takeUntil(this._destroyed$),
        filter(() => this._initialized))
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
      .pipe(
        debounceTime(this.debounce),
        takeUntil(this._destroyed$),
        filter(() => this._initialized))
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
        new ResetForm({value: this.state })
      );
    }
  }
}
