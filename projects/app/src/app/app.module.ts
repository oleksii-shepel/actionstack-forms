import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './components/app/app.component';
import { ReactiveProfileEditorComponent } from './components/reactive-form/profile-editor.component';
import { StoreModule } from '@ngrx/store';
import { reducer } from './reducers';
import { SharedModule, forms, TemplateDrivenFormsModule, logger } from 'ngync';
import { TemplateProfileEditorComponent } from './components/template-driven-form/profile-editor.component';
import { StandardProfileEditorComponent } from './components/model-driven-form/profile-editor.component';
import { FieldDirective } from './directives/field.directive';
import { FieldArrayDirective } from './directives/array.directive';
import { FieldGroupDirective } from './directives/group.directive';

@NgModule({
  declarations: [
    AppComponent,
    ReactiveProfileEditorComponent,
    TemplateProfileEditorComponent,
    StandardProfileEditorComponent,
    FieldDirective,
    FieldArrayDirective,
    FieldGroupDirective
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    StoreModule.forRoot(reducer, {
      metaReducers: [forms, logger]
    }),
    SharedModule,
    TemplateDrivenFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
