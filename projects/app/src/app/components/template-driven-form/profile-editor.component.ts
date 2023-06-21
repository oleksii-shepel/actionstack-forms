import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostBinding, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { InitForm, UpdateForm, UpdateModel, deepClone, getModel, getSlice } from 'ngync';
import { Observable, asapScheduler, firstValueFrom, fromEvent, merge, shareReplay } from 'rxjs';
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
  @Output() hacked = new EventEmitter<boolean>();

  profile$!: Observable<any>;
  initialized = false;
  slice = "hero";
  model = initialHero;
  a: any; b: any;

  _collapsed: boolean = true;
  @HostBinding('class.collapsed') set collapsed(value: boolean) {
    this._collapsed = value;
    if(this.initialized) {
      this.store.dispatch(UpdateModel({value: value, path: `${this.slice}::collapsed`}));
    }
  }

  get collapsed() {
    return this._collapsed;
  }

  constructor(private store: Store<ApplicationState>, private elementRef: ElementRef) {
  }

  async ngAfterViewInit() {
    let state = await firstValueFrom(this.store.select(getModel(this.slice)));

    if(!state) {
      asapScheduler.schedule(() => {
        this.store.dispatch(InitForm({value: deepClone(initialHero), path: this.slice}))
        this.model = Object.assign(deepClone(state || {}), initialHero);
        this.collapsed = this.model.collapsed;
        this.initialized = true;
      });
    }

    this.profile$ = this.store.select(getSlice(this.slice)).pipe(shareReplay());

    let scrollable = this.elementRef.nativeElement.querySelector('.scrollable');
    this.b = merge(fromEvent(window, 'resize'), fromEvent(scrollable, 'scroll')).subscribe((e: any) => {
      scrollable.style.height = window.innerHeight - scrollable.offsetTop - 60 + 'px';
    });

    window.dispatchEvent(new Event('resize'));
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

/** This code will not work properly because such an action remains invisible to the actionsSubject's subscription
 * async init(obj: any) {
 *   let state = await firstValueFrom(this.store.select(getModel(this.slice)));
 *   this.store.dispatch(InitForm({value: obj, path: this.slice}));
 * }
 */

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
