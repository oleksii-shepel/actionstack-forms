import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { InitForm, UpdateSubmitted, UpdateValue, buildForm, getSlice, getValue } from 'ngync';
import { Observable, take } from 'rxjs';
import { initialProfile, profileOptions } from '../../models/profile';
import { ApplicationState } from '../../reducers';
import { ProfileState } from '../../reducers/profile.reducer';

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
      this.store.dispatch(InitForm({ path: this.slice, value: model}));
    });

    this.profile$ = this.store.select(getSlice(this.slice));
  }

  updateProfile() {
    this.store.dispatch(UpdateValue({value: {
      firstName: 'Dr. Julius No',
      lastName: '',
      address: {
        street: '',
        city: '',
        state: 'Jamaica',
        zip: ''
      }
    }, path: "profile"}));
  }

  addAlias() {
    this.aliases.push(this.fb.control('', Validators.required));
  }

  onSubmit() {
    if(this.form?.valid) {
      this.store.dispatch(UpdateSubmitted({path: "profile", value: true}));
      alert("Form submitted successfully");
    }
  }

  ngOnDestroy() {
    this.a.unsubscribe();
  }
}
