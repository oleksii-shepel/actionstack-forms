import { appConfig } from './app/app.module';

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/components/app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
