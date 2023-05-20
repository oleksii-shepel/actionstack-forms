import { Component, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Profile, initialHero } from '../../models/profile';
import { Store } from '@ngrx/store';
import { HeroState, initialState } from '../../reducers/hero.reducer';
import { ApplicationState, getHeroSlice } from '../../reducers';
import { take, Observable } from 'rxjs';
import { InitForm, UpdateFormValue, deepClone } from 'ngync';

@Component({
  selector: 'template-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.css'],
})
export class TemplateProfileEditorComponent {
  @Output() formSubmitted = new EventEmitter<Profile>();
  @ViewChild('form') form: NgForm | null = null;

  profile$!: Observable<HeroState>;
  initialState = initialState;
  model = initialState.model;

  constructor(private store: Store<ApplicationState>) {

    this.store.select(getHeroSlice).pipe(take(1)).subscribe((state) => {
      this.initialState = deepClone(state? state: { model: initialHero });
      this.model = this.initialState.model;
      this.store.dispatch(new InitForm({ path: "hero", value: this.initialState}));
    });

    this.profile$ = this.store.select(getHeroSlice);
  }

  updateProfile() {
    this.store.dispatch(new UpdateFormValue({value: {
      firstName: 'Nancy',
      address: {
        street: '123 Drew Street'
      }
    }, path: "hero"}));
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
