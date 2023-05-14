import { Component, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Profile, initialProfile } from '../../models/profile';
import { Store } from '@ngrx/store';
import { HeroState } from '../../reducers/hero.reducer';
import { getHero } from '../../reducers';
import { Observable } from 'rxjs';
import { UpdateFormValue } from '@ngrx/forms';

@Component({
  selector: 'template-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.css']
})
export class TemplateProfileEditorComponent {
  @Output() formSubmitted = new EventEmitter<Profile>();
  @ViewChild('form') form: NgForm | null = null;

  profile$: Observable<HeroState>;
  model = initialProfile;

  constructor(private store: Store<HeroState>) {
    this.profile$ = this.store.select(getHero);
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
    this.model.aliases.push('');
  }

  trackById(index: number, obj: string): any {
    return index;
  }

  onSubmit() {
    this.formSubmitted.emit(this.form!.value as Profile);
    alert("Form submitted successfully");
  }

  formChanged(event: any) {
    console.log(event);
  }
}
