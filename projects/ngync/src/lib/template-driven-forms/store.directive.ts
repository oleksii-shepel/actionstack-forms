import { ChangeDetectorRef, Directive, OnDestroy, OnInit, ViewChildren, ViewContainerRef } from "@angular/core";
import { NgForm, NgModel } from "@angular/forms";
import { SyncDirective } from "../shared/core";
import { Store } from "@ngrx/store";

@Directive({
  selector: 'form:not([ngNoForm]):not([formGroup])[ngync],ng-form[ngync],[ngForm][ngync]',
  providers: [{provide: 'form', useExisting: NgForm}],
})
export class DynamicStoreDirective extends SyncDirective implements OnInit, OnDestroy {

  override ngOnInit() {
    super.ngOnInit();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }
}
