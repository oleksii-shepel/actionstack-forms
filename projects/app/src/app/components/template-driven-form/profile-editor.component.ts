import { Component, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Profile, initialHero } from '../../models/profile';
import { Store } from '@ngrx/store';
import { HeroState } from '../../reducers/hero.reducer';
import { ApplicationState, getHeroSlice, getModelSlice } from '../../reducers';
import { take, Observable } from 'rxjs';
import { UpdateFormValue } from '@ngrx/forms';
import { initialState } from '../../reducers/standard.reducer';

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

  get model() {
    return this.initialState.model;
  }

  set model(value: any) {
    this.initialState.model = value;
  }

  constructor(private store: Store<ApplicationState>) {
    this.store.select(getModelSlice).pipe(take(1)).subscribe((state) => {
      this.initialState = state? state : { model: initialHero };
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
