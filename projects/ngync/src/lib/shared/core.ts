import { ChangeDetectorRef, Directive, ElementRef, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroupDirective, NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, filter, first, repeat, takeWhile, tap } from 'rxjs';
import { DomObserver, getValue } from '.';
import { checkForm } from '../shared';
import { ResetForm, UpdateFormDirty, UpdateFormErrors, UpdateFormStatus, UpdateFormValue } from './actions';

export interface SyncDirectiveOptions {
  slice: string;
  debounce?: number;
  clearOnDestroy?: boolean;
}

@Directive({
  selector: 'form:not([ngNoForm]):not([formGroup])[ngync],ng-form[ngync],[ngForm][ngync],[formGroup][ngync]'
})
export class SyncDirective implements OnInit, OnDestroy {
  @Input('ngync') options!: string | SyncDirectiveOptions;

  dir!: FormGroupDirective | NgForm;

  slice!: string;
  model!: any;
  debounce!: number;
  clearOnDestroy!: boolean;

  private _unmounted$ = new Subject<boolean>();

  private _initialized = false;
  private _updating = false;

  private _subs = {} as any;

  constructor(
    public injector: Injector,
    public store: Store,
    public cdr: ChangeDetectorRef,
    public elRef: ElementRef,
  ) {
    this.dir = injector.get(FormGroupDirective, null) ?? injector.get(NgForm, null) as any;
  }

  ngOnInit() {
    if(typeof this.options === 'string') {
      this.slice = this.options;
      this.debounce = 25;
      this.clearOnDestroy = false;
    } else {
      this.slice = this.options.slice;
      this.debounce = this.options.debounce || 25;
      this.clearOnDestroy = this.options.clearOnDestroy || false;
    }

    if(!this.slice) {
      throw new Error("Misuse of sync directive");
    }

    if(!this.dir) {
      throw new Error("Supported form control directive not found");
    }

  this._subs.a = this.dir.valueChanges!
    .pipe(
      takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)),
      filter(() => this._initialized))
    .subscribe(value => {
      if(!this._updating) {
        this._updating = true;

        this.store.dispatch(
          new UpdateFormValue({
            path: this.slice,
            value: value
          })
        );

        this.store.dispatch(
          new UpdateFormDirty({
            path: this.slice,
            dirty: this.dir.dirty
          })
        );

        this.store.dispatch(
          new UpdateFormErrors({
            path: this.slice,
            errors: this.dir.errors
          })
        );

        this._updating = false;
      }
    });

  this._subs.b = this.dir.statusChanges!
    .pipe(
      takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)),
      filter(() => this._initialized))
    .subscribe(status => {
        if(!this._updating) {
          this._updating = true;

          this.store.dispatch(
            new UpdateFormStatus({
              path: this.slice,
              status
            }));

          this._updating = false;
        }
      });

    // check if state is present in the store and if so initialize the form
    this._subs.c = this.store.select(state => getValue(state, `${this.slice}`)).pipe(
      first(),
      filter(state => state?.model),
      tap((state) => this.dir.form.patchValue(state.model)),
      filter((state) => checkForm(this.dir.form, state.model)),
      repeat({ count: 10, delay: this.debounce }),
      takeWhile(() => !this._initialized),
    ).subscribe((state) => {
      if (!this._updating) {
        this._updating = true;
        this._initialized = true;
        this.dir.form.updateValueAndValidity();
        this.cdr.markForCheck();
        this.model = state.model;
        this._updating = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.clearOnDestroy) {
      this.store.dispatch(
        new ResetForm({ value: this.model, path: this.slice })
      );
    }

    for(const sub in this._subs) {
      this._subs[sub].unsubscribe();
    }
  }

  ngOnComponentUnmounted() {
    this._unmounted$.next(true);
    this._unmounted$.complete();
  }
}
