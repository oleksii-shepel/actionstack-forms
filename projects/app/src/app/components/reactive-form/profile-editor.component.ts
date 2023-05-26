import { Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { FormArray } from '@angular/forms';
import { initialProfile, profileOptions } from '../../models/profile';
import { Store } from '@ngrx/store';
import { ProfileState } from '../../reducers/profile.reducer';
import { ApplicationState } from '../../reducers';
import { Observable, take } from 'rxjs';
import { UpdateSubmitted, InitForm, UpdateFormValue, buildForm, getSlice, getValue } from 'ngync';

@Component({
  selector: 'reactive-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReactiveProfileEditorComponent implements OnDestroy {

  slice = "profile";
  profile$: Observable<ProfileState>;
  profileForm = buildForm(initialProfile, profileOptions) as FormGroup;
  form = this.profileForm;

  a: any;

  get aliases() {
    return this.profileForm.get('aliases') as FormArray;
  }

  constructor(private fb: FormBuilder, private store: Store<ApplicationState>) {

    this.a = this.store.select(getSlice(this.slice)).pipe(take(1)).subscribe((state) => {
      let model = getValue(state, "model") ?? initialProfile;
      this.store.dispatch(new InitForm({ path: this.slice, value: model}));
    });

    this.profile$ = this.store.select(getSlice(this.slice));
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
    if(this.form?.valid) {
      this.store.dispatch(new UpdateSubmitted({path: "profile", value: true}));
      alert("Form submitted successfully");
    }
  }

  ngOnDestroy() {
    this.a.unsubscribe();
  }
}
