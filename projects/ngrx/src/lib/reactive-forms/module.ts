import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { ReactiveStoreDirective } from './directive';

@NgModule({
  imports: [FormsModule, StoreModule],
  declarations: [ReactiveStoreDirective],
  exports: [ReactiveStoreDirective]
})
export class ReactiveFormsModule {}
