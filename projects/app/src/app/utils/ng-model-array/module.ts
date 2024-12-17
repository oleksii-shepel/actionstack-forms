import { NgModule, provideAppInitializer } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgModelArray, moduleFactory } from './ngmodelarray';

@NgModule({
  imports: [FormsModule],
  declarations: [NgModelArray],
  exports: [NgModelArray],
  providers: [provideAppInitializer(() => {
        const initializerFn = (() => moduleFactory)();
        return initializerFn();
      })]
})
export class NgModelArrayModule {}
