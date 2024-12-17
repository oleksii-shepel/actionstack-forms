import { applyMiddleware, combineReducers, provideStore, STORE_ENHANCER, StoreSettings } from '@actionstack/angular';
import { epics } from '@actionstack/angular/epics';
import { perfmon } from '@actionstack/tools';
import { ApplicationConfig, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { forms, NgFormsModule } from 'nygma-forms';
import { environment } from '../environments/environment';
import { JsonEditorComponent, SanitizedHtmlPipe } from './components/json-editor/json-editor.component';
import { MessengerComponent } from './components/messenger/messenger.component';
import { StandardProfileEditorComponent } from './components/model-driven-form/profile-editor.component';
import { ReactiveProfileEditorComponent } from './components/reactive-form/profile-editor.component';
import { ShootingGroundComponent } from './components/shooting-ground/shooting-round.component';
import { TemplateProfileEditorComponent } from './components/template-driven-form/profile-editor.component';
import { FieldArrayDirective } from './directives/array.directive';
import { FieldDirective } from './directives/field.directive';
import { FieldGroupDirective } from './directives/group.directive';
import { global, reducers } from './reducers';
import { NgModelArrayModule } from './utils';

import { CommonModule } from '@angular/common';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore({
      slice: "main",
      reducer: combineReducers(reducers),
      metaReducers: [forms(), global()]
    }),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
  ]
};

@NgModule({
  declarations: [
    SanitizedHtmlPipe,
    ReactiveProfileEditorComponent,
    TemplateProfileEditorComponent,
    StandardProfileEditorComponent,
    FieldDirective,
    FieldArrayDirective,
    FieldGroupDirective,
    MessengerComponent,
    JsonEditorComponent,
    ShootingGroundComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgFormsModule,
    NgModelArrayModule
  ],
  exports: [
    ReactiveProfileEditorComponent,
    TemplateProfileEditorComponent,
    StandardProfileEditorComponent
  ],
  providers: [
    { provide: StoreSettings, useValue: {
                              dispatchSystemActions: true,
                              awaitStatePropagation: true,
                              enableMetaReducers: true,
                              enableAsyncReducers: false
                            }
    },
    { provide: STORE_ENHANCER, useValue: applyMiddleware(perfmon, epics) }
  ]
})
export class AppModule { }
