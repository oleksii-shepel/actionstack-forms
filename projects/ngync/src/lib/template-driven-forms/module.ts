import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseControlValueAccessor, BuiltInControlValueAccessor } from '../shared/accessors';
import { SharedModule } from '../shared/module';
import { NgModelArray, moduleFactory } from './ngmodelarray';

@NgModule({
  imports: [FormsModule, SharedModule],
  declarations: [NgModelArray, BaseControlValueAccessor, BuiltInControlValueAccessor],
  exports: [NgModelArray, SharedModule],
  providers: [{
    provide: APP_INITIALIZER,
    useFactory: () => moduleFactory,
    multi: true
  }]
})
export class NgFormsModule {}
