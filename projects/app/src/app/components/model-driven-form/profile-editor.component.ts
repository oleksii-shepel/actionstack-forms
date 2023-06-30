import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostBinding, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { UpdateForm, UpdateProperty, deepClone, selectSlice, selectValue } from 'ngync';
import { Observable, firstValueFrom, fromEvent, merge, shareReplay } from 'rxjs';
import { occurence } from '../../animations/animations';
import { initialModel } from '../../models/profile';
import { ApplicationState } from '../../reducers';

@Component({
  selector: 'standard-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [occurence]
})
export class StandardProfileEditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('heroForm') form: NgForm | null = null;

  @Input() caption = '';
  @Output() messenger = new EventEmitter<boolean>();

  profile$!: Observable<any>;
  slice = "model";
  model = initialModel;

  a: any; b: any;

  _collapsed = true;
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

    const state = await firstValueFrom(this.store.select(selectValue(this.slice)));

    this.model = state ? deepClone(state) : initialModel;
    this.collapsed = true;

    this.profile$ = this.store.select(selectSlice(this.slice)).pipe(shareReplay());

    const scrollable = this.elementRef.nativeElement.querySelector('.scrollable');
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
    if(this.form?.valid) {
      alert("Form submitted successfully");
    }
  }

  ngOnDestroy() {
    this.b.unsubscribe();
  }
}
