import { Component, ViewChild, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { initialModel } from '../../models/profile';
import { Store } from '@ngrx/store';
import { ApplicationState, getModelSlice } from '../../reducers';
import { take, Observable } from 'rxjs';
import { FormSubmitted, InitForm, UpdateFormValue, deepClone, getValue } from 'ngync';
import { ModelState } from '../../reducers/standard.reducer';

@Component({
  selector: 'standard-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StandardProfileEditorComponent implements OnDestroy {
  @ViewChild('modelForm') form: NgForm | null = null;

  profile$!: Observable<ModelState>;
  model = initialModel;
  a: any;

  constructor(private store: Store<ApplicationState>) {

    this.a = this.store.select(getModelSlice).pipe(take(1)).subscribe((state) => {
      let model = getValue(state, "model") ?? initialModel;
      this.store.dispatch(new InitForm({ path: "model", value: model}));
      this.model = deepClone(model);
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
    this.model.aliases.push('');
  }

  trackById(index: number, obj: string): any {
    return index;
  }

  onSubmit() {
    if(this.form?.valid) {
      this.store.dispatch(new FormSubmitted({path: "model"}));
      alert("Form submitted successfully");
    }
  }

  ngOnDestroy() {
    this.a.unsubscribe();
  }
}
