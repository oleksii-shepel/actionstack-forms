import { ChangeDetectorRef, Directive, OnDestroy, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { SyncDirective } from "../shared/core";
import { Store } from "@ngrx/store";

@Directive({
  selector: 'form:not([ngNoForm]):not([formGroup])[ngStore],ng-form[ngStore],[ngForm][ngStore]',
  providers: [{provide: 'form', useExisting: NgForm}],
})
export class DynamicStoreDirective extends SyncDirective implements OnInit, OnDestroy {
  constructor(f: NgForm, store: Store, cdr: ChangeDetectorRef) {
    super(f, store, cdr);
  }

  override ngOnInit() {
    super.ngOnInit();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }
}
