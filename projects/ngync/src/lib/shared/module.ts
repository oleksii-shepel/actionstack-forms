import { InjectionToken, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';

import { SyncDirective } from './core';

export const NGYNC_CONFIG_TOKEN = new InjectionToken<string>('NGYNC_CONFIG_TOKEN');
export const NGYNC_CONFIG_DEFAULT = { debounce: 100, clearOnDestroy: false, updateOn: 'change', autoSubmit: true };

@NgModule({
  imports: [FormsModule, StoreModule],
  declarations: [SyncDirective],
  exports: [SyncDirective],
  providers: [SyncDirective]
})
export class SharedModule {}
