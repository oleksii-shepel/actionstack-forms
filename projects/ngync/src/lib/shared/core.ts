import { Directive, Input, OnInit, OnDestroy, ChangeDetectorRef, Inject, ElementRef, Injector, Optional, SkipSelf, AfterViewInit } from '@angular/core';
import { FormGroupDirective, NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, filter, takeWhile, repeat, first } from 'rxjs';
import { UpdateFormStatus, UpdateFormValue, UpdateFormDirty, UpdateFormErrors, ResetForm } from './actions';
import { getValue, patchValue } from '.';
import { checkFormGroup } from '../shared';

export interface SyncDirectiveOptions {
  slice: string;
  state?: any;
  debounce?: number;
  clearOnDestroy?: boolean;
}

@Directive({
  selector: 'form:not([ngNoForm]):not([formGroup])[ngync],ng-form[ngync],[ngForm][ngync],[formGroup][ngync]',
  providers: [{
    provide: 'form',
    useFactory: (injector: Injector) => injector.get(FormGroupDirective, null) ?? injector.get(NgForm, null),
    deps: [ Injector, [ new Optional(), new SkipSelf(), NgForm ], [ new Optional(), new SkipSelf(), FormGroupDirective ]],
  }]
})
export class SyncDirective implements OnInit, OnDestroy, AfterViewInit {
  @Input('ngync') options!: string | SyncDirectiveOptions;

  path!: string;
  state!: any;
  debounce!: number;
  clearOnDestroy!: boolean;

  private _destroyed$ = new Subject<boolean>();

  private _initialized = false;
  private _updating = false;

  a: any; b: any; c: any; d: any; e: any;

  constructor(
    @Inject('form') public dir: NgForm | FormGroupDirective,
    public store: Store,
    public cdr: ChangeDetectorRef,
    public elRef: ElementRef
  ) {
    if(dir instanceof NgForm) {
      Object.assign(dir.form, {
        patchValue: (value: any, options?: any) => {
          patchValue(dir, value, options);
        }
      });
    }
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

    if(!this.dir) {
      throw new Error("Supported form control directive not found");
    }

  this.a = this.dir.valueChanges!
    .pipe(
      takeWhile(()=> document.contains(this.elRef.nativeElement)),
      takeUntil(this._destroyed$),
      filter(() => this._initialized))
    .subscribe(value => {
      if(!this._updating) {
        this._updating = true;

        this.store.dispatch(
          new UpdateFormValue({
            path: this.path,
            value: value
          })
        );

        this.store.dispatch(
          new UpdateFormDirty({
            path: this.path,
            dirty: this.dir.dirty
          })
        );

        this.store.dispatch(
          new UpdateFormErrors({
            path: this.path,
            errors: this.dir.errors
          })
        );

        this._updating = false;
      }
    });

  this.b = this.dir.statusChanges!
    .pipe(
      takeWhile(()=> document.contains(this.elRef.nativeElement)),
      takeUntil(this._destroyed$),
      filter(() => this._initialized))
    .subscribe(status => {
        if(!this._updating) {
          this._updating = true;

          this.store.dispatch(
            new UpdateFormStatus({
              path: this.path,
              status
            }));

          this._updating = false;
        }
      });

    this.c = this.store
      .select(state => getValue(state, `${this.path}.dirty`))
      .pipe(takeUntil(this._destroyed$))
      .subscribe(dirty => {
        if (this.dir.form.dirty !== dirty) {
          if (dirty === true) {
            this.dir.form.markAsDirty();
            this.cdr.markForCheck();
          } else if (dirty === false) {
            this.dir.form.markAsPristine();
            this.cdr.markForCheck();
          }
        }
      });

    this.d = this.store
      .select(state => getValue(state, `${this.path}.disabled`))
      .pipe(takeUntil(this._destroyed$))
      .subscribe(disabled => {
        if (this.dir.form.disabled !== disabled) {
          if (disabled === true) {
            this.dir.form.disable();
            this.cdr.markForCheck();
          } else if (disabled === false) {
            this.dir.form.enable();
            this.cdr.markForCheck();
          }
        }
      });

    // we need to replace patchValue method if two-way binding for ngModels directives is used
    // if(this.dir instanceof NgForm) {
    //   patchValue(this.dir, state?.model);
    // }
    // check if state is present in the store and if so initialize the form
    this.e = this.store.select(state => getValue(state, `${this.path}`)).pipe(
      first(),
      repeat({ count: 5, delay: this.debounce }),
      filter(state => checkFormGroup(this.dir.form, state?.model)),
      takeWhile(() => !this._initialized),
    ).subscribe((state) => {
      if (!this._updating) {
        this._updating = true;
        if(!!state?.model) {
          this._initialized = true;
          this.dir.form.patchValue(state.model);
        }
        this._updating = false;
        this.dir.control.updateValueAndValidity();
        this.cdr.markForCheck();
      }
    });
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy() {
    if (this.clearOnDestroy) {
      this.store.dispatch(
        new ResetForm({value: this.state })
      );
    }

    this._destroyed$.next(true);
    this._destroyed$.complete();
  }
}
