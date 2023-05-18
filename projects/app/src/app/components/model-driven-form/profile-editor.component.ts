import { Component, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Profile, initialModel, initialProfile } from '../../models/profile';
import { Store } from '@ngrx/store';
import { ApplicationState, getModelSlice } from '../../reducers';
import { take, Observable } from 'rxjs';
import { UpdateFormValue, deepClone } from '@ngrx/forms';
import { ModelState } from '../../reducers/standard.reducer';
import { initialState } from '../../reducers/hero.reducer';

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

  get model() {
    return this.initialState.model;
  }

  set model(value: any) {
    this.initialState.model = value;
  }

  firstName(event: any) {
    console.log(this.model, event);
  }

  constructor(private store: Store<ApplicationState>) {
    this.store.select(getModelSlice).pipe(take(1)).subscribe((state) => {
      // we need to deep clone the state to prevent the storeFreeze from throwing an error
      this.initialState = state? deepClone(state) : { model: initialModel };
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
    this.model.aliases.push("")
  }

  trackById(index: number, obj: string): any {
    return index;
  }

  onSubmit() {
    this.formSubmitted.emit(this.form!.value as Profile);
    alert("Form submitted successfully");
  }
}
