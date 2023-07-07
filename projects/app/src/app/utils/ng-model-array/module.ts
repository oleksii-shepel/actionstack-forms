import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgModelArray, moduleFactory } from './ngmodelarray';

@NgModule({
  imports: [FormsModule],
  declarations: [NgModelArray],
  exports: [NgModelArray],
  providers: [{
    provide: APP_INITIALIZER,
    useFactory: () => moduleFactory,
    multi: true
  }]
})
export class NgModelArrayModule {}
