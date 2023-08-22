import { InjectionToken, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';

import { SyncDirective, SyncOptions } from './core';

export const SYNC_OPTIONS_TOKEN = new InjectionToken<string>('NYGMA_CONFIG_TOKEN');
export const SYNC_OPTIONS_DEFAULT: Omit<SyncOptions, 'slice'> = { debounceTime: 200, updateOn: 'change' };

@NgModule({
  imports: [FormsModule, StoreModule],
  declarations: [SyncDirective],
  exports: [SyncDirective],
  providers: [SyncDirective]
})
export class NgFormsModule {}
