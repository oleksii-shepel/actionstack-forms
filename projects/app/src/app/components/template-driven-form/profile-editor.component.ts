import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { UpdateForm, deepClone, selectFormState } from 'nygma-forms';
import { Observable, firstValueFrom, fromEvent, merge, shareReplay } from 'rxjs';
import { occurence } from '../../animations/animations';
import { initialHeroPage } from '../../models/profile';
import { ApplicationState, UpdateProperty, selectSlice } from '../../reducers';

@Component({
  selector: 'template-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [occurence]
})
export class TemplateProfileEditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('heroForm') form: NgForm | null = null;

  @Input() caption = '';

  profile$!: Observable<any>;
  slice = "hero";
  formCast = "hero::form";
  model = initialHeroPage.form;
  a: any; b: any;

  _collapsed = true;
  @HostBinding('class.collapsed') set collapsed(value: boolean) {
    this._collapsed = value;
    this.store.dispatch(UpdateProperty({value: value, path: this.slice, property: 'collapsed'}));
  }

  get collapsed() {
    return this._collapsed;
  }

  constructor(private store: Store<ApplicationState>, private elementRef: ElementRef) {
  }

  async ngAfterViewInit() {
    const state: any = await firstValueFrom(this.store.select(selectFormState(this.formCast)));

    if(!state) {
      this.store.dispatch(UpdateForm({value: initialHeroPage.form, split: this.formCast}));
      this.collapsed = true;
    }

    this.model = state ? deepClone(state) : initialHeroPage.form;
    this.profile$ = this.store.select(selectSlice(this.slice)).pipe(shareReplay());

    const scrollable = this.elementRef.nativeElement.querySelector('.scrollable');
    this.b = merge(fromEvent(window, 'resize'), fromEvent(scrollable, 'scroll')).subscribe((e: any) => {
      scrollable.style.height = window.innerHeight - scrollable.offsetTop - 60 + 'px';
    });

    window.dispatchEvent(new Event('resize'));
  }

  addAlias() {
    this.model.aliases.push('');
  }

  trackById(index: number, obj: string): any {
    return index;
  }

  onSubmit() {
    Function.prototype
  }

  ngOnDestroy() {
    Function.prototype
  }
}
