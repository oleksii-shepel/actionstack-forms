import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseControlValueAccessor, BuiltInControlValueAccessor } from '../shared/accessors';
import { SharedModule } from '../shared/module';
import { NgModelArray } from './ngmodelarray';

@NgModule({
  imports: [FormsModule, SharedModule],
  declarations: [NgModelArray, BaseControlValueAccessor, BuiltInControlValueAccessor],
  exports: [NgModelArray, SharedModule]
})
export class TemplateDrivenFormsModule {}
