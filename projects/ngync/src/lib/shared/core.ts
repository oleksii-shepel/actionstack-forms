import { Directive, Input, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef, Inject, ElementRef, Injector, Optional, SkipSelf } from '@angular/core';
import { FormGroupDirective, NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, filter, takeWhile, repeat, first, tap } from 'rxjs';
import { UpdateFormStatus, UpdateFormValue, UpdateFormDirty, UpdateFormErrors, ResetForm } from './actions';
import { DomObserver, getValue } from '.';
import { checkForm } from '../shared';

export interface SyncDirectiveOptions {
  slice: string;
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
  model!: any;
  debounce!: number;
  clearOnDestroy!: boolean;

  private _unmounted$ = new Subject<boolean>();

  private _initialized = false;
  private _updating = false;
  private _observer!: MutationObserver;
  private _viewInitialized = false;

  a: any; b: any; c: any; d: any; e: any;

  constructor(
    @Inject('form') public dir: NgForm | FormGroupDirective,
    public store: Store,
    public cdr: ChangeDetectorRef,
    public elRef: ElementRef,
  ) {
  }

  ngOnInit() {
    if(typeof this.options === 'string') {
      this.path = this.options;
      this.debounce = 0;
      this.clearOnDestroy = false;
    } else {
      this.path = this.options.slice;
      this.debounce = this.options.debounce || 0;
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
      takeWhile(()=> DomObserver.mounted(this.elRef.nativeElement)),
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
      takeWhile(()=> DomObserver.mounted(this.elRef.nativeElement)),
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
      .pipe(takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)))
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
      .pipe(takeWhile(() => DomObserver.mounted(this.elRef.nativeElement)))
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

    // check if state is present in the store and if so initialize the form
    this.e = this.store.select(state => getValue(state, `${this.path}`)).pipe(
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

        if(this.dir instanceof NgForm) {
          this.formInitialized();
        }
      }
    });

    this._observer = DomObserver.unmounted(this.elRef.nativeElement, this.componentUnmounted.bind(this));
  }

  ngAfterViewInit() {
    this._viewInitialized = true;
    if(this.dir instanceof FormGroupDirective) {
      this.formInitialized();
    }
  }

  formInitialized() {
    let directives = (this.dir instanceof FormGroupDirective) ?
    this.dir.directives : (this.dir as any)._directives;

    for(const directive of directives) {
      let nativeElement = directive.valueAccessor?._elementRef?.nativeElement;
      console.log(nativeElement);
    }
  }

  ngOnDestroy() {
    if (this.clearOnDestroy) {
      this.store.dispatch(
        new ResetForm({ value: this.model })
      );
    }
  }

  componentUnmounted() {
    this._unmounted$.next(true);
    this._unmounted$.complete();
  }

}
