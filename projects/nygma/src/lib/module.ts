import { InjectionToken, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';

import { NgyncConfig, SyncDirective } from './core';

export const NGYNC_CONFIG_TOKEN = new InjectionToken<string>('NGYNC_CONFIG_TOKEN');
export const NGYNC_CONFIG_DEFAULT: Omit<NgyncConfig, 'slice'> = { debounceTime: 100, updateOn: 'change', enableQueue: true };

@NgModule({
  imports: [FormsModule, StoreModule],
  declarations: [SyncDirective],
  exports: [SyncDirective],
  providers: [SyncDirective]
})
export class NgFormsModule {}
