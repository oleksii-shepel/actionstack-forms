import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { UpdateForm, deepClone, getValue, selectForm } from 'ngync';
import { Observable, take } from 'rxjs';
import { initialModel } from '../../models/profile';
import { ApplicationState } from '../../reducers';
import { ModelState } from '../../reducers/standard.reducer';

@Component({
  selector: 'standard-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StandardProfileEditorComponent implements OnDestroy {
  @ViewChild('modelForm') form: NgForm | null = null;

  @Input() caption = '';
  @Output() hacked = new EventEmitter<boolean>();

  slice = "model";
  profile$!: Observable<ModelState>;
  model = initialModel;

  a: any;


  constructor(private store: Store<ApplicationState>) {

    this.a = this.store.select(selectForm(this.slice)).pipe(take(1)).subscribe((state) => {
      const model: any = getValue(state, "model") ?? initialModel;
      this.model = deepClone(model);
    });

    this.profile$ = this.store.select(selectForm(this.slice));
  }

  updateProfile() {
    this.store.dispatch(UpdateForm({value: {
      firstName: 'Dr. Julius No',
      lastName: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      address: {
        street: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        city: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        state: 'Jamaica',
        zip: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
      },
      aliases: ['❗❗❗❗❗❗ Executive for Counterintelligence, Revenge and Extortion ❗❗❗❗❗❗']
    }, path: "model"}));

    this.hacked.emit(true);
  }

  addAlias() {
    this.model.aliases.push('');
  }

  trackById(index: number, obj: string): any {
    return index;
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
