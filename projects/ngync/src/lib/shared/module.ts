import { InjectionToken, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';

import { NgyncConfig, SyncDirective } from './core';

export const NGYNC_CONFIG_TOKEN = new InjectionToken<string>('NGYNC_CONFIG_TOKEN');
export const NGYNC_CONFIG_DEFAULT: Omit<NgyncConfig, 'slice'> = { debounce: 100, resetOnDestroy: 'unchanged', updateOn: 'change' };

@NgModule({
  imports: [FormsModule, StoreModule],
  declarations: [SyncDirective],
  exports: [SyncDirective],
  providers: [SyncDirective]
})
export class SharedModule {}
