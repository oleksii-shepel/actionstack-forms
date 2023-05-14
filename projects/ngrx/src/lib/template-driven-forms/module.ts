import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { StoreDirective } from './store.directive';
import { FieldDirective } from './field.directive';
import { ArrayDirective } from './array.directive';
import { GroupDirective } from './group.directive';

@NgModule({
  imports: [FormsModule, StoreModule],
  declarations: [StoreDirective, FieldDirective, ArrayDirective, GroupDirective],
  exports: [StoreDirective, FieldDirective, ArrayDirective, GroupDirective]
})
export class TemplateDrivenFormsModule {}
