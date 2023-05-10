import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './components/app/app.component';
import { ProfileEditorComponent } from './components/profile-editor/profile-editor.component';
import { StoreModule } from '@ngrx/store';
import { form, NgrxFormModule } from '@ngrx/reactive-forms';
import { reducer } from './reducers';

@NgModule({
  declarations: [
    AppComponent,
    ProfileEditorComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    StoreModule.forRoot(reducer, {
      metaReducers: [form]
    }),
    NgrxFormModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
