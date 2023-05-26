import { Component, ViewChild, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { initialModel } from '../../models/profile';
import { Store } from '@ngrx/store';
import { ApplicationState } from '../../reducers';
import { take, Observable } from 'rxjs';
import { UpdateSubmitted, InitForm, UpdateFormValue, deepClone, getSlice, getValue } from 'ngync';
import { ModelState } from '../../reducers/standard.reducer';

@Component({
  selector: 'standard-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StandardProfileEditorComponent implements OnDestroy {
  @ViewChild('modelForm') form: NgForm | null = null;

  slice = "model";
  profile$!: Observable<ModelState>;
  model = initialModel;
  a: any;

  constructor(private store: Store<ApplicationState>) {

    this.a = this.store.select(getSlice(this.slice)).pipe(take(1)).subscribe((state) => {
      let model = getValue(state, "model") ?? initialModel;
      this.store.dispatch(new InitForm({ path: this.slice, value: model}));
      this.model = deepClone(model);
    });

    this.profile$ = this.store.select(getSlice(this.slice));
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
      this.store.dispatch(new UpdateSubmitted({path: "model", value: true}));
      alert("Form submitted successfully");
    }
  }

  ngOnDestroy() {
    this.a.unsubscribe();
  }
}
