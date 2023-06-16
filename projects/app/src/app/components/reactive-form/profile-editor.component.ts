import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostBinding, Input, OnDestroy, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { UpdateValue, buildForm, getModel, getSlice, getValue } from 'ngync';
import { Observable, firstValueFrom, fromEvent, take } from 'rxjs';
import { initialProfile, profileOptions } from '../../models/profile';

@Component({
  selector: 'reactive-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReactiveProfileEditorComponent implements AfterViewInit, OnDestroy {
  @Input() caption = '';
  @Output() hacked = new EventEmitter<boolean>();

  profile$: Observable<any>;

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
    (async () => {
      let slice = await firstValueFrom(this.store.select(getModel(this.slice)));
      this.store.dispatch(UpdateValue({value: {...slice, collapsed : value}, path: this.slice}));
    })();
  }

  get collapsed() {
    return this._collapsed;
  }

  constructor(private fb: FormBuilder, private store: Store, private elementRef: ElementRef) {

    this.a = this.store.select(getSlice(this.slice)).pipe(take(1)).subscribe((state) => {
      let model: any = getValue(state, "model") ?? initialProfile;
      this.collapsed = model.collapsed;
    });


    this.profile$ = this.store.select(getSlice(this.slice));
  }

  ngAfterViewInit() {
    let scrollable = this.elementRef.nativeElement.querySelector('.scrollable');
    let pre = this.elementRef.nativeElement.querySelector('pre');
    let footer = this.elementRef.nativeElement.querySelector('footer');
    scrollable.style.height = window.innerHeight - scrollable.offsetTop - 60 + 'px';
    pre.style.height = scrollable.clientHeight + 'px';

    this.b = fromEvent(scrollable, 'scroll').subscribe((e: any) => {
      pre.style.height = Math.min(scrollable.clientHeight, scrollable.scrollHeight - footer.scrollHeight - e.target.scrollTop) + 'px';
      pre.scrollTop = e.target.scrollTop * ( pre.scrollHeight / scrollable.scrollHeight);
    });
  }

  updateProfile() {
    this.store.dispatch(UpdateValue({value: {
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
