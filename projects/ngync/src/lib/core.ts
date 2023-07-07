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
import { FormControlStatus, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  asyncScheduler,
  sampleTime,
  scan,
  startWith,
  take, takeWhile, tap
} from 'rxjs';
import { UpdateForm } from './actions';
import { selectForm } from './reducer';
import { setValue } from './utils';


@Directive({
  selector:
    'form:not([ngNoForm]):not([formGroup])[ngync],ng-form[ngync],[ngForm][ngync],[formGroup][ngync]',
  exportAs: 'ngync',
})
export class SyncDirective implements OnInit, AfterContentInit, OnDestroy {
  @Input('ngync') slice!: string;
  @ContentChildren(NgControl, {descendants: true}) controls!: QueryList<NgControl>;

  dir: NgForm | FormGroupDirective;
  debounceTime = 100;

  _subs = {} as any;

  inputCallback = (control: NgControl) => (value : any) => {
    if(control.path) {
      this.dir.form.patchValue(setValue(this.dir.form.value, control.path.join('.'), value));
    }
  }

  constructor(
    @Optional() @Self() @Inject(ChangeDetectorRef) public cdr: ChangeDetectorRef,
    @Optional() @Self() @Inject(ElementRef) public elRef: ElementRef<any>,
    @Inject(Injector) public injector: Injector,
    @Inject(Store) public store: Store
  ) {
    this.dir = injector.get(FormGroupDirective, null) ?? (injector.get(NgForm, null) as any);
  }

  ngOnInit() {
    if (!this.slice) {
      throw new Error('Misuse of sync directive');
    }

    if (!this.dir) {
      throw new Error('Supported form control directive not found');
    }

    this._subs.a = this.store.select(selectForm(this.slice)).pipe(
      take(1),
      tap((value) => {
        if(value) { this.dir.form.patchValue(value); this.cdr.detectChanges(); }
        else { this.store.dispatch(UpdateForm({ path: this.slice, value: this.dir.form.value })); }
      })
    ).subscribe();

    this._subs.b = this.dir.form.valueChanges.pipe(
      sampleTime(this.debounceTime),
      takeWhile(() => document.contains(this.elRef.nativeElement)),
      tap((value) => this.store.dispatch(UpdateForm({ path: this.slice, value: value })))
    ).subscribe();
  }

  ngAfterContentInit() {
    asyncScheduler.schedule(() => {
      this._subs.c = this.controls.changes.pipe(startWith(this.controls)).pipe(
        scan((acc, _) => acc + 1, 0),
        tap(() => {
          this.controls.forEach((control: NgControl) => {
            if(control.valueAccessor) {
              control.valueAccessor.registerOnChange(this.inputCallback(control));
            }
          });
        }),
        tap((value) => { if (value > 1) { this.dir.form.patchValue(this.formValue); this.cdr.detectChanges(); } }),
      ).subscribe();
    })
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

  get formStatus(): FormControlStatus {
    return this.dir.form.status;
  }

  ngOnDestroy() {
    for (const sub in this._subs) {
      this._subs[sub].unsubscribe();
    }
  }
}
