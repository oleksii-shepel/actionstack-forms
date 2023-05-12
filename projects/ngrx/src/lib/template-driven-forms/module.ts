import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { TemplateFormDirective } from './directive';

@NgModule({
  imports: [FormsModule, StoreModule],
  declarations: [TemplateFormDirective],
  exports: [TemplateFormDirective]
})
export class TemplateDrivenFormsModule {}
