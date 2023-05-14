import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { StoreDirective } from './store.directive';
import { FieldDirective } from './field.directive';
import { FieldArrayDirective } from './array.directive';
import { FieldGroupDirective } from './group.directive';
import { BaseControlValueAccessor, BuiltInControlValueAccessor } from './accessors';

@NgModule({
  imports: [FormsModule, StoreModule],
  declarations: [StoreDirective, FieldDirective, FieldArrayDirective, FieldGroupDirective, BaseControlValueAccessor, BuiltInControlValueAccessor],
  exports: [StoreDirective, FieldDirective, FieldArrayDirective, FieldGroupDirective]
})
export class TemplateDrivenFormsModule {}
