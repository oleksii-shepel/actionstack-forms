import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { NGYNC_CONFIG_TOKEN, SharedModule, TemplateDrivenFormsModule, forms, logger } from 'ngync';
import { AppComponent } from './components/app/app.component';
import { StandardProfileEditorComponent } from './components/model-driven-form/profile-editor.component';
import { ReactiveProfileEditorComponent } from './components/reactive-form/profile-editor.component';
import { TemplateProfileEditorComponent } from './components/template-driven-form/profile-editor.component';
import { FieldArrayDirective } from './directives/array.directive';
import { FieldDirective } from './directives/field.directive';
import { FieldGroupDirective } from './directives/group.directive';
import { reducer } from './reducers';


export const NGYNC_CONFIG = { debounce: 75, clearOnDestroy: false, updateOn: 'submit' };
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
  providers: [{ provide: NGYNC_CONFIG_TOKEN, useValue: NGYNC_CONFIG }],
  bootstrap: [AppComponent]
})
export class AppModule { }
