import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { deepClone, selectForm } from 'ngync';
import { Observable, take } from 'rxjs';
import { initialHero } from '../../models/profile';
import { ApplicationState } from '../../reducers';
import { HeroState } from '../../reducers/hero.reducer';

@Component({
  selector: 'template-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateProfileEditorComponent implements OnDestroy {
  @ViewChild('heroForm') form: NgForm | null = null;

  @Input() caption = '';
  @Output() hacked = new EventEmitter<boolean>();

  slice = "hero";
  profile$!: Observable<HeroState>;
  model = initialHero;

  a: any;

  constructor(private store: Store<ApplicationState>) {

    this.a = this.store.select(selectForm(this.slice)).pipe(take(1)).subscribe((state) => {
      let model: any = state ?? initialHero;
      this.model = deepClone(model);
    });

    this.profile$ = this.store.select(selectForm(this.slice));
  }

  updateProfile() {
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
