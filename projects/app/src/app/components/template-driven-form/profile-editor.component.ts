import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { UpdateForm, UpdateProperty, deepClone, selectSlice, selectValue } from 'ngync';
import { Observable, firstValueFrom, fromEvent, merge, shareReplay } from 'rxjs';
import { occurence } from '../../animations/animations';
import { initialHero } from '../../models/profile';
import { ApplicationState } from '../../reducers';

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
  model = initialHero;
  a: any; b: any;

  _collapsed: boolean = true;
  @HostBinding('class.collapsed') set collapsed(value: boolean) {
    this._collapsed = value;
    this.store.dispatch(UpdateProperty({value: value, path: `${this.slice}::collapsed`}));
  }

  get collapsed() {
    return this._collapsed;
  }

  constructor(private store: Store<ApplicationState>, private elementRef: ElementRef) {
  }

  async ngAfterViewInit() {
    let state = await firstValueFrom(this.store.select(selectValue(this.slice)));

    if(!state) {
        this.store.dispatch(UpdateForm({value: initialHero, path: this.slice}));
        this.model = state ? deepClone(state) : initialHero;
        this.collapsed = true;
    }

    this.profile$ = this.store.select(selectSlice(this.slice)).pipe(shareReplay());

    let scrollable = this.elementRef.nativeElement.querySelector('.scrollable');
    this.b = merge(fromEvent(window, 'resize'), fromEvent(scrollable, 'scroll')).subscribe((e: any) => {
      scrollable.style.height = window.innerHeight - scrollable.offsetTop - 60 + 'px';
    });

    window.dispatchEvent(new Event('resize'));
  }

  addAlias() {
    this.model.aliases.push('');
    this.store.dispatch(UpdateForm({value: this.model, path: "hero"}));
  }

  trackById(index: number, obj: string): any {
    return index;
  }

  onSubmit() {
  }

  ngOnDestroy() {
    this.b.unsubscribe();
  }
}
