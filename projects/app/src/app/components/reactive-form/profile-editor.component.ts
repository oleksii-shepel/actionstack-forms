import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, NgZone, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { buildForm } from 'nygma-forms';
import { Observable, fromEvent, merge, shareReplay } from 'rxjs';
import { occurence } from '../../animations/animations';
import { initialProfilePage, profileOptions } from '../../models/profile';
import { UpdateProperty, selectSlice } from '../../reducers';


@Component({
  selector: 'reactive-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [occurence]
})
export class ReactiveProfileEditorComponent implements AfterViewInit, OnDestroy {
  @Input() caption = '';

  profile$!: Observable<any>;
  slice = "profile";
  formCast = "profile.form";
  profileForm = buildForm(initialProfilePage.form, profileOptions) as FormGroup;
  form = this.profileForm;

  a: any; b: any;

  get books() {
    return initialProfilePage.books;
  }

  get aliases() {
    return (this.profileForm.controls['aliases'] as FormArray).controls;
  }

  _collapsed = true;
  @HostBinding('class.collapsed') set collapsed(value: boolean) {
    this._collapsed = value;
    this.store.dispatch(UpdateProperty({value: value, path: this.slice, property: 'collapsed'}));
  }

  get collapsed() {
    return this._collapsed;
  }

  constructor(private fb: FormBuilder, private store: Store, private elementRef: ElementRef, private ngZone: NgZone) {
  }

  ngAfterViewInit() {
    this.collapsed = true;
    this.profile$ = this.store.select(selectSlice(this.slice)).pipe(shareReplay());

    const scrollable = this.elementRef.nativeElement.querySelector('.scrollable');
    this.b = merge(fromEvent(window, 'resize'), fromEvent(scrollable, 'scroll')).subscribe((e: any) => {
      scrollable.style.height = window.innerHeight - scrollable.offsetTop - 60 + 'px';
    });

    window.dispatchEvent(new Event('resize'));
  }

  addAlias() {
    this.aliases.push(this.fb.control(''));
  }

  addToBookmark(target: EventTarget | null) {
    const element = target as HTMLInputElement;
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
