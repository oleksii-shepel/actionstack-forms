import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { StoreDirective } from './directive';

@NgModule({
  imports: [FormsModule, StoreModule],
  declarations: [StoreDirective],
  exports: [StoreDirective]
})
export class TemplateDrivenFormsModule {}
