import { ChangeDetectorRef, Directive, OnDestroy, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { FormGroupDirective } from "@angular/forms";
import { SyncDirective } from "../shared/core";

@Directive({
  selector: '[formGroup][ngStore]',
  providers: [{provide: 'form', useExisting: FormGroupDirective}]
})
export class ReactiveStoreDirective extends SyncDirective implements OnInit, OnDestroy {
  constructor(f: FormGroupDirective, store: Store, cdr: ChangeDetectorRef) {
    super(f, store, cdr);
  }

  override ngOnInit() {
    super.ngOnInit();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }
}
