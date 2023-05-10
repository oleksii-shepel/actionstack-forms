import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import { FormArray } from '@angular/forms';
import { Profile } from '../../models/profile';
import { Store } from '@ngrx/store';
import { ProfileState } from '../../reducers/profile.reducer';
import { getProfile } from '../../reducers';
import { Observable } from 'rxjs';
import { UpdateForm, UpdateFormValue } from '@ngrx/reactive-forms';

@Component({
  selector: 'app-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.css']
})
export class ProfileEditorComponent {
  @Output() formSubmitted = new EventEmitter<Profile>();

  profile$: Observable<ProfileState>;

  profileForm = this.fb.group({
    firstName: [''],
    lastName: [''],
    address: this.fb.group({
      street: [''],
      city: [''],
      state: [''],
      zip: ['']
    }),
    aliases: this.fb.array([''])
  });

  get aliases() {
    return this.profileForm.get('aliases') as FormArray;
  }

  constructor(private fb: FormBuilder, private store: Store<ProfileState>) {
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
