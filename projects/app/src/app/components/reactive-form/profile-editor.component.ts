import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { UpdateValue, buildForm, getSlice, getValue } from 'ngync';
import { Observable, take } from 'rxjs';
import { initialProfile, profileOptions } from '../../models/profile';
import { ProfileState } from '../../reducers/profile.reducer';

@Component({
  selector: 'reactive-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReactiveProfileEditorComponent implements OnDestroy {
  @Input() caption = '';
  @Output() hacked = new EventEmitter<boolean>();

  slice = "profile";
  profile$: Observable<ProfileState>;
  profileForm = buildForm(initialProfile, profileOptions) as FormGroup;
  form = this.profileForm;

  a: any;

  get books() {
    return (this.profileForm.get('books') as FormArray)!.controls;
  }

  get aliases() {
    return (this.profileForm.get('aliases') as FormArray)!.controls;
  }

  constructor(private fb: FormBuilder, private store: Store) {

    this.a = this.store.select(getSlice(this.slice)).pipe(take(1)).subscribe((state) => {
      let model: any = getValue(state, "model") ?? initialProfile;
    });

    this.profile$ = this.store.select(getSlice(this.slice));
  }

  updateProfile() {
    this.store.dispatch(UpdateValue({value: {
      bookmark: true,
      firstName: 'Dr. Julius No',
      lastName: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      address: {
        street: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        city: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        state: 'Jamaica',
        zip: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
      },
      books: ['Reading is prohibited, burn all the books...'],
      selected: 0,
      quotes: `Unfortunately I misjudged you. You are just a stupid policeman whose luck has run out.`,
      aliases: ['❗❗❗❗❗❗ Executive for Counterintelligence, Revenge and Extortion ❗❗❗❗❗❗']
    }, path: "profile"}));

    this.hacked.emit(true);
  }

  addAlias() {
    this.aliases.push(this.fb.control('', Validators.required));
  }

  addToBookmark(target: EventTarget | null) {
    let element = target as HTMLInputElement;
    element.checked = !element.checked;

    const value = element.checked;
    this.profileForm.get('bookmark')?.setValue(value);
  }

  onSelectChange(event: Event) {
    const value = +(event.target as HTMLSelectElement).value;
    this.profileForm.get('selected')?.setValue(value);
  }

  onSubmit() {
    if(this.form?.valid) {
      alert("Form submitted successfully");
    }
  }

  ngOnDestroy() {
    this.a.unsubscribe();
  }
}
