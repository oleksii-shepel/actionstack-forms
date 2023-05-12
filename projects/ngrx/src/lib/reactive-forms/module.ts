import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { FormDirective } from './directive';

@NgModule({
  imports: [FormsModule, StoreModule],
  declarations: [FormDirective],
  exports: [FormDirective]
})
export class ReactiveFormsModule {}
