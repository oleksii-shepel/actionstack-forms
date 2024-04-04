import { StoreModule, StoreSettings } from '@actioncrew/actionstack';
import { NgModule } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgFormsModule, forms } from 'nygma-forms';
import { logger } from 'redux-logger';
import { environment } from '../environments/environment';
import { AppComponent } from './components/app/app.component';
import { JsonEditorComponent, SanitizedHtmlPipe } from './components/json-editor/json-editor.component';
import { MessengerComponent } from './components/messenger/messenger.component';
import { StandardProfileEditorComponent } from './components/model-driven-form/profile-editor.component';
import { ReactiveProfileEditorComponent } from './components/reactive-form/profile-editor.component';
import { ShootingGroundComponent } from './components/shooting-ground/shooting-round.component';
import { TemplateProfileEditorComponent } from './components/template-driven-form/profile-editor.component';
import { FieldArrayDirective } from './directives/array.directive';
import { FieldDirective } from './directives/field.directive';
import { FieldGroupDirective } from './directives/group.directive';
import { global, initialState, reducers } from './reducers';
import { NgModelArrayModule } from './utils';
@NgModule({
  providers: [
    {provide: StoreSettings, useValue: {
      dispatchSystemActions: true,
      awaitStatePropagation: true,
      enableMetaReducers: true,
      enableAsyncReducers: false
    }}
  ],
  declarations: [
    SanitizedHtmlPipe,
    AppComponent,
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
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    NgFormsModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    StoreModule.forRoot({
      slice: "root",
      middleware: [logger],
      reducer: reducers,
      metaReducers: [forms(initialState), global()]
    }),

    NgModelArrayModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
