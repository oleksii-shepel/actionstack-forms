import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { NgFormsModule, forms } from 'ngync';
import { AppComponent } from './components/app/app.component';
import { HackedBannerComponent } from './components/hacked-banner/hacked-banner.component';
import { StandardProfileEditorComponent } from './components/model-driven-form/profile-editor.component';
import { ReactiveProfileEditorComponent } from './components/reactive-form/profile-editor.component';
import { TemplateProfileEditorComponent } from './components/template-driven-form/profile-editor.component';
import { FieldArrayDirective } from './directives/array.directive';
import { FieldDirective } from './directives/field.directive';
import { FieldGroupDirective } from './directives/group.directive';
import { initialState, reducer } from './reducers';
import { NgModelArrayModule } from './utils';

@NgModule({
  declarations: [
    AppComponent,
    ReactiveProfileEditorComponent,
    TemplateProfileEditorComponent,
    StandardProfileEditorComponent,
    HackedBannerComponent,
    FieldDirective,
    FieldArrayDirective,
    FieldGroupDirective,
    HackedBannerComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    NgModelArrayModule,
    StoreModule.forRoot(reducer, {
      metaReducers: [forms(initialState)]
    }),

    NgFormsModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
