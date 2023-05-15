import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { DynamicStoreDirective } from './store.directive';
import { FieldDirective } from './field.directive';
import { FieldArrayDirective } from './array.directive';
import { FieldGroupDirective } from './group.directive';
import { BaseControlValueAccessor, BuiltInControlValueAccessor } from './accessors';

@NgModule({
  imports: [FormsModule, StoreModule],
  declarations: [DynamicStoreDirective, FieldDirective, FieldArrayDirective, FieldGroupDirective, BaseControlValueAccessor, BuiltInControlValueAccessor],
  exports: [DynamicStoreDirective, FieldDirective, FieldArrayDirective, FieldGroupDirective]
})
export class TemplateDrivenFormsModule {}
