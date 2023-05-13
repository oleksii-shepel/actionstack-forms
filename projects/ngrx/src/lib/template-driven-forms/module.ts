import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { StoreDirective } from './store.directive';
import { NgField } from './field.directive';

@NgModule({
  imports: [FormsModule, StoreModule],
  declarations: [StoreDirective, NgField],
  exports: [StoreDirective, NgField]
})
export class TemplateDrivenFormsModule {}
