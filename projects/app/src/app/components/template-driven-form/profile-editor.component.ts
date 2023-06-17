import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostBinding, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { UpdateForm, UpdateModel, deepClone, getSlice, getValue } from 'ngync';
import { Observable, fromEvent, merge, shareReplay, take } from 'rxjs';
import { initialHero } from '../../models/profile';
import { ApplicationState } from '../../reducers';

@Component({
  selector: 'template-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateProfileEditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('heroForm') form: NgForm | null = null;

  @Input() caption = '';
  @Output() hacked = new EventEmitter<boolean>();
  profile$!: Observable<any>;

  slice = "hero";
  model = initialHero;

  a: any; b: any;

  _collapsed: boolean = true;
  @HostBinding('class.collapsed') set collapsed(value: boolean) {
    this._collapsed = value;
    this.store.dispatch(UpdateModel({value: value, path: `${this.slice}::collapsed`}));
  }

  get collapsed() {
    return this._collapsed;
  }

  constructor(private store: Store<ApplicationState>, private elementRef: ElementRef) {
  }

  ngAfterViewInit() {
    this.a = this.store.select(getSlice(this.slice)).pipe(take(1)).subscribe((state) => {
      let model: any = getValue(state, "model") ?? initialHero;
      this.model = deepClone(model);
      this.collapsed = this.model.collapsed;
    });

    this.profile$ = this.store.select(getSlice(this.slice)).pipe(shareReplay());

    let scrollable = this.elementRef.nativeElement.querySelector('.scrollable');
    let pre = this.elementRef.nativeElement.querySelector('pre');
    let footer = this.elementRef.nativeElement.querySelector('footer');
    scrollable.style.height = window.innerHeight - scrollable.offsetTop - 60 + 'px';
    pre.style.height = scrollable.clientHeight + 'px';

    this.b = merge(fromEvent(window, 'resize'), fromEvent(scrollable, 'scroll')).subscribe((e: any) => {
      scrollable.style.height = window.innerHeight - scrollable.offsetTop - 60 + 'px';
      pre.style.height = Math.min(scrollable.clientHeight, scrollable.scrollHeight - footer.scrollHeight - (e.target.scrollTop || 0)) + 'px';
      pre.scrollTop = e.target.scrollTop * ( pre.scrollHeight / scrollable.scrollHeight);
    });
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
    }, path: "hero"}));

    this.hacked.emit(true);
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
    this.a.unsubscribe();
    this.b.unsubscribe();
  }
}
