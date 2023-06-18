import { AUTO_STYLE, animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostBinding, Input, OnDestroy, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { UpdateForm, UpdateModel, buildForm, getSlice, getValue } from 'ngync';
import { Observable, fromEvent, merge, shareReplay, take } from 'rxjs';
import { initialProfile, profileOptions } from '../../models/profile';

@Component({
  selector: 'reactive-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('occurence', [
      state('false', style({
        height: AUTO_STYLE,
        opacity: 1,
      })),
      state('true', style({
        height: AUTO_STYLE,
        opacity: 0,
      })),
      transition('* => true', [
        animate('0.5s')
      ]),
      transition('* => false', [
        animate('0.5s')
      ]),
  ])]
})
export class ReactiveProfileEditorComponent implements AfterViewInit, OnDestroy {
  @Input() caption = '';
  @Output() hacked = new EventEmitter<boolean>();

  profile$!: Observable<any>;

  slice = "profile";

  profileForm = buildForm(initialProfile, profileOptions) as FormGroup;
  form = this.profileForm;

  a: any; b: any;

  get books() {
    return (this.profileForm.get('books') as FormArray)!.controls;
  }

  get aliases() {
    return (this.profileForm.get('aliases') as FormArray)!.controls;
  }

  _collapsed: boolean = true;
  @HostBinding('class.collapsed') set collapsed(value: boolean) {
    this._collapsed = value;
    this.store.dispatch(UpdateModel({value: value, path: `${this.slice}::collapsed`}));
  }

  get collapsed() {
    return this._collapsed;
  }

  constructor(private fb: FormBuilder, private store: Store, private elementRef: ElementRef) {
  }

  ngAfterViewInit() {

    this.a = this.store.select(getSlice(this.slice)).pipe(take(1)).subscribe((state) => {
      let model: any = getValue(state, "model") ?? initialProfile;
      this.collapsed = model.collapsed;
    });

    this.profile$ = this.store.select(getSlice(this.slice)).pipe(shareReplay());

    let scrollable = this.elementRef.nativeElement.querySelector('.scrollable');
    this.b = merge(fromEvent(window, 'resize'), fromEvent(scrollable, 'scroll')).subscribe((e: any) => {
      scrollable.style.height = window.innerHeight - scrollable.offsetTop - 60 + 'px';
    });

    let timeout = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      clearTimeout(timeout);
    }, 0);

  }

  updateProfile() {
    this.store.dispatch(UpdateForm({value: {
      bookmark: true,
      firstName: 'Dr. Julius No',
      lastName: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      address: {
        street: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        city: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        state: 'Jamaica',
        zip: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
      },
      selected: 5,
      quotes: `Unfortunately I misjudged you. You are just a stupid policeman whose luck has run out.`,
      aliases: ['❗❗❗❗❗❗ Executive for Counterintelligence, Revenge and Extortion ❗❗❗❗❗❗']
    }, path: "profile"}));

    this.hacked.emit(true);
  }

  addAlias() {
    this.aliases.push(this.fb.control('', Validators.required));
  }

  addToBookmark(target: EventTarget | null) {
    let element = target as HTMLInputElement;
    element.checked = !element.checked;

    const value = element.checked;
    this.profileForm.get('bookmark')?.setValue(value);
  }

  onSelectChange(event: Event) {
    const value = +(event.target as HTMLSelectElement).value;
    this.profileForm.get('selected')?.setValue(value);
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
