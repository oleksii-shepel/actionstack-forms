import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  Inject,
  Injector,
  Input,
  OnDestroy,
  Optional,
  Self
} from '@angular/core';
import { FormGroupDirective, NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  sampleTime,
  take, takeWhile
} from 'rxjs';
import { UpdateForm } from './actions';
import { selectForm } from './reducer';


@Directive({
  selector:
    'form:not([ngNoForm]):not([formGroup])[ngync],ng-form[ngync],[ngForm][ngync],[formGroup][ngync]',
  exportAs: 'ngync',
})
export class SyncDirective implements AfterViewInit, OnDestroy {
  @Input('ngync') slice!: string;

  dir: NgForm | FormGroupDirective;
  debounceTime = 100;

  _subs = {} as any;

  constructor(
    @Optional() @Self() @Inject(ChangeDetectorRef) public cdr: ChangeDetectorRef,
    @Optional() @Self() @Inject(ElementRef) public elRef: ElementRef<any>,
    @Inject(Injector) public injector: Injector,
    @Inject(Store) public store: Store
  ) {
    this.dir = injector.get(FormGroupDirective, null) ?? (injector.get(NgForm, null) as any);
  }

  ngAfterViewInit() {
    if (!this.slice) {
      throw new Error('Misuse of sync directive');
    }

    if (!this.dir) {
      throw new Error('Supported form control directive not found');
    }

    this._subs.a = this.store.select(selectForm(this.slice)).pipe(take(1)).subscribe((value: any) => {
      if(value) {
        this.dir.form.patchValue(value);
        this.cdr.detectChanges();
      } else {
        this.store.dispatch(UpdateForm({ path: this.slice, value: this.dir.form.value }));
      }
    });

    this._subs.b = this.dir.form.valueChanges.pipe(
      sampleTime(this.debounceTime),
      takeWhile(() => document.contains(this.elRef.nativeElement)),
    ).subscribe((value: any) => {
      this.store.dispatch(UpdateForm({ path: this.slice, value: value }));
    });
  }

  ngOnDestroy() {
    for (let sub in this._subs) {
      this._subs[sub].unsubscribe();
    }
  }
}
