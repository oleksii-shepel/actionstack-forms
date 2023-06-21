import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostBinding, Input, OnDestroy, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { UpdateForm, UpdateModel, buildForm, deepClone, getModel, getSlice } from 'ngync';
import { Observable, firstValueFrom, fromEvent, merge, shareReplay } from 'rxjs';
import { occurence } from '../../animations/animations';
import { initialProfile, profileOptions } from '../../models/profile';

@Component({
  selector: 'reactive-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [occurence]
})
export class ReactiveProfileEditorComponent implements AfterViewInit, OnDestroy {
  @Input() caption = '';
  @Output() hacked = new EventEmitter<boolean>();

  profile$!: Observable<any>;
  initialized = false;
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
    if(this.initialized) {
      this.store.dispatch(UpdateModel({value: value, path: `${this.slice}::collapsed`}));
    }
  }

  get collapsed() {
    return this._collapsed;
  }

  constructor(private fb: FormBuilder, private store: Store, private elementRef: ElementRef) {
  }

  async ngAfterViewInit() {

    let state = await firstValueFrom(this.store.select(getModel(this.slice)));

    let model = Object.assign(deepClone(state || {}), initialProfile);
    this.initialized = true;

    this.profile$ = this.store.select(getSlice(this.slice)).pipe(shareReplay());

    let scrollable = this.elementRef.nativeElement.querySelector('.scrollable');
    this.b = merge(fromEvent(window, 'resize'), fromEvent(scrollable, 'scroll')).subscribe((e: any) => {
      scrollable.style.height = window.innerHeight - scrollable.offsetTop - 60 + 'px';
    });

    window.dispatchEvent(new Event('resize'));
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
    this.b.unsubscribe();
  }
}
