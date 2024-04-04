import { InjectionToken, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SyncDirective, SyncOptions } from './core';

export const SYNC_OPTIONS_TOKEN = new InjectionToken<string>('SYNC_CONFIG_TOKEN');
export const SYNC_OPTIONS_DEFAULT: Omit<SyncOptions, 'slice'> = { debounceTime: 200, updateOn: 'change', priority: 'store' };

@NgModule({
  imports: [FormsModule],
  declarations: [SyncDirective],
  exports: [SyncDirective],
  providers: [SyncDirective]
})
export class NgFormsModule {}
