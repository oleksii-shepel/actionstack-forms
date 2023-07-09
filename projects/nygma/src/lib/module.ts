import { InjectionToken, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';

import { NygmaConfig, SyncDirective } from './core';

export const NYGMA_CONFIG_TOKEN = new InjectionToken<string>('NYGMA_CONFIG_TOKEN');
export const NYGMA_CONFIG_DEFAULT: Omit<NygmaConfig, 'slice'> = { debounceTime: 100, updateOn: 'change', enableQueue: true };

@NgModule({
  imports: [FormsModule, StoreModule],
  declarations: [SyncDirective],
  exports: [SyncDirective],
  providers: [SyncDirective]
})
export class NgFormsModule {}
