import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';
import { Validators } from '@angular/forms';
import { FormArray } from '@angular/forms';
import { Profile, initialProfile } from '../../models/profile';
import { Store } from '@ngrx/store';
import { ProfileState, initialState } from '../../reducers/profile.reducer';
import { ApplicationState, getProfile, getProfileSlice } from '../../reducers';
import { Observable, take } from 'rxjs';
import { UpdateFormValue, buildFormGroup } from '@ngrx/forms';

@Component({
  selector: 'reactive-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.css']
})
export class ReactiveProfileEditorComponent {
  @Output() formSubmitted = new EventEmitter<Profile>();

  profile$: Observable<ProfileState>;

  profileForm = buildFormGroup(initialProfile) as FormGroup;
  initialState = initialState;

  get aliases() {
    return this.profileForm.get('aliases') as FormArray;
  }

  get model() {
    return this.initialState.model;
  }

  set model(value: any) {
    this.initialState.model = value;
  }

  constructor(private fb: FormBuilder, private store: Store<ApplicationState>) {

    this.store.select(getProfileSlice).pipe(take(1)).subscribe((state) => {
      this.initialState = state? state : { model: initialProfile };
    });

    this.profile$ = this.store.select(getProfile);
  }

  updateProfile() {
    this.store.dispatch(new UpdateFormValue({value: {
      firstName: 'Nancy',
      address: {
        street: '123 Drew Street'
      }
    }, path: "profile"}));
  }

  addAlias() {
    this.aliases.push(this.fb.control('', Validators.required));
  }

  onSubmit() {
    this.formSubmitted.emit(this.profileForm.value as Profile);
    alert("Form submitted successfully");
  }
}
