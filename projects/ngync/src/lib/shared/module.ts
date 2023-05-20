import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { SyncDirective } from './core';

@NgModule({
  imports: [FormsModule, StoreModule],
  declarations: [SyncDirective],
  exports: [SyncDirective]
})
export class SharedModule {}
