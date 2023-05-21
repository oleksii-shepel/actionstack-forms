import { Component, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Profile, initialModel } from '../../models/profile';
import { Store } from '@ngrx/store';
import { ApplicationState, getModelSlice } from '../../reducers';
import { take, Observable } from 'rxjs';
import { InitForm, UpdateFormValue, deepClone, deepCloneJSON } from 'ngync';
import { ModelState, initialState } from '../../reducers/standard.reducer';

@Component({
  selector: 'standard-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.css'],
})
export class StandardProfileEditorComponent {
  @Output() formSubmitted = new EventEmitter<Profile>();
  @ViewChild('form') form: NgForm | null = null;

  profile$!: Observable<ModelState>;
  initialState = initialState;
  model = initialState.model;

  a: any;

  constructor(private store: Store<ApplicationState>) {

    this.a = this.store.select(getModelSlice).pipe(take(1)).subscribe((state) => {
      this.initialState = state ? state : { model: initialModel };
      this.store.dispatch(new InitForm({ path: "model", value: this.initialState}));
      this.model = deepClone(this.initialState.model);
    });

    this.profile$ = this.store.select(getModelSlice);
  }

  updateProfile() {
    this.store.dispatch(new UpdateFormValue({value: {
      firstName: 'Nancy',
      address: {
        street: '123 Drew Street'
      }
    }, path: "model"}));
  }

  addAlias() {
    // you cannot modify separate properties of the model directly
    // replace the entire model with a new one
    this.model = deepClone(this.model);
    this.model.aliases.push('');
  }

  trackById(index: number, obj: string): any {
    return index;
  }

  onSubmit() {
    this.formSubmitted.emit(this.form!.value as Profile);
    alert("Form submitted successfully");
  }
}
