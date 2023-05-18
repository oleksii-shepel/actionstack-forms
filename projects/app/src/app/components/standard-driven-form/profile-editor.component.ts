import { Component, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Profile, initialModel, initialProfile } from '../../models/profile';
import { Store } from '@ngrx/store';
import { ApplicationState, getModelSlice } from '../../reducers';
import { take, Observable } from 'rxjs';
import { InitForm, UpdateFormValue } from '@ngrx/forms';
import { ModelState } from '../../reducers/standard.reducer';

@Component({
  selector: 'standard-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.css'],
})
export class StandardProfileEditorComponent {
  @Output() formSubmitted = new EventEmitter<Profile>();
  @ViewChild('form') form: NgForm | null = null;

  profile$!: Observable<ModelState>;

  model = initialProfile;

  constructor(private store: Store<ApplicationState>) {
    this.store.select(getModelSlice).pipe(take(1)).subscribe((state) => {
      let value = state?.model ? state : initialModel;
      this.store.dispatch(new InitForm({ path: "model", value: value }));
    });

    this.profile$ = this.store.select(getModelSlice);
    this.profile$.subscribe((state) => {
      console.log('profile$', state);
    });
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
    this.model.aliases.push("")
    // let index = Math.max(...Object.keys(this.model.aliases)
    //   .map(key => parseInt(key))
    //   .filter((key) => !isNaN(key)));
    // (this.model.aliases as any)[(index + 1).toString()]= "";
  }

  trackById(index: number, obj: string): any {
    return index;
  }

  onSubmit() {
    this.formSubmitted.emit(this.form!.value as Profile);
    alert("Form submitted successfully");
  }
}
