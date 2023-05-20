import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { FieldDirective } from './field.directive';
import { FieldArrayDirective } from './array.directive';
import { FieldGroupDirective } from './group.directive';
import { BaseControlValueAccessor, BuiltInControlValueAccessor } from '../shared/accessors';
import { NgModelArray } from './ngmodelarray';
import { SharedModule } from '../shared/module';

@NgModule({
  imports: [FormsModule, StoreModule, SharedModule],
  declarations: [FieldDirective, FieldArrayDirective, FieldGroupDirective, NgModelArray, BaseControlValueAccessor, BuiltInControlValueAccessor],
  exports: [FieldDirective, FieldArrayDirective, FieldGroupDirective, NgModelArray, SharedModule]
})
export class TemplateDrivenFormsModule {}
