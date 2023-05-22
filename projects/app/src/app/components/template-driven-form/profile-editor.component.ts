import { Component, OnDestroy,Output, EventEmitter, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Profile, initialHero } from '../../models/profile';
import { Store } from '@ngrx/store';
import { HeroState } from '../../reducers/hero.reducer';
import { ApplicationState, getHeroSlice } from '../../reducers';
import { take, Observable } from 'rxjs';
import { InitForm, UpdateFormValue, deepClone, getValue } from 'ngync';

@Component({
  selector: 'template-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.css'],
})
export class TemplateProfileEditorComponent implements OnDestroy {
  @Output() formSubmitted = new EventEmitter<Profile>();
  @ViewChild('form') form: NgForm | null = null;

  profile$!: Observable<HeroState>;
  model = initialHero;
  a: any;

  constructor(private store: Store<ApplicationState>) {

    this.a = this.store.select(getHeroSlice).pipe(take(1)).subscribe((state) => {
      let model = getValue(state, "model") ?? initialHero;
      this.store.dispatch(new InitForm({ path: "hero", value: model}));
      this.model = deepClone(model);
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
    this.store.dispatch(new UpdateFormValue({value: this.model, path: "hero"}));
  }

  trackById(index: number, obj: string): any {
    return index;
  }

  onSubmit() {
    this.formSubmitted.emit(this.form!.value as Profile);
    alert("Form submitted successfully");
  }

  ngOnDestroy() {
    this.a.unsubscribe();
  }
}
