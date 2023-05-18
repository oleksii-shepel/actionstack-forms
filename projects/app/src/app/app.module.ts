import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './components/app/app.component';
import { ReactiveProfileEditorComponent } from './components/reactive-form/profile-editor.component';
import { StoreModule } from '@ngrx/store';
import { reducer } from './reducers';
import { ReactiveFormsModule as ReactiveModule, form, TemplateDrivenFormsModule, logger } from '@ngrx/forms';
import { TemplateProfileEditorComponent } from './components/template-driven-form/profile-editor.component';
import { StandardProfileEditorComponent } from './components/model-driven-form/profile-editor.component';

@NgModule({
  declarations: [
    AppComponent,
    ReactiveProfileEditorComponent,
    TemplateProfileEditorComponent,
    StandardProfileEditorComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    StoreModule.forRoot(reducer, {
      metaReducers: [form, logger]
    }),
    ReactiveModule,
    TemplateDrivenFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
