import { InjectionToken, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';

import { EffectsModule } from '@ngrx/effects';
import { SyncDirective } from './core';

export const NGYNC_CONFIG_TOKEN = new InjectionToken<string>('NGYNC_CONFIG_TOKEN');
export const NGYNC_CONFIG_DEFAULT = { debounce: 25, clearOnDestroy: false, updateOn: 'blur' };

@NgModule({
  imports: [FormsModule, StoreModule, EffectsModule],
  declarations: [SyncDirective],
  exports: [SyncDirective]
})
export class SharedModule {}
