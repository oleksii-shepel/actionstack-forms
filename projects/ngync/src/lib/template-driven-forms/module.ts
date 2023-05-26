import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { NgModelArray } from './ngmodelarray';
import { BaseControlValueAccessor, BuiltInControlValueAccessor } from '../shared/accessors';
import { SharedModule } from '../shared/module';

@NgModule({
  imports: [FormsModule, StoreModule, SharedModule],
  declarations: [NgModelArray, BaseControlValueAccessor, BuiltInControlValueAccessor],
  exports: [NgModelArray, SharedModule]
})
export class TemplateDrivenFormsModule {}
