import { Component, ElementRef, HostBinding, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { BehaviorSubject, concatMap, filter, from, map, mergeMap, take, tap } from 'rxjs';
import { occurence } from '../../animations/animations';
import { ModalService } from '../../services/modal.service';

export type EditorType = 'reactive' | 'template-driven' | 'standard';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [occurence],
})
export class AppComponent implements OnDestroy {
  @HostBinding('class') class ='author';
  @ViewChild('view', {read: ViewContainerRef}) viewContainerRef!: ViewContainerRef;

  editor: EditorType = 'reactive';
  selectedColor = 'rgba(255, 0, 0, 0.5)';

  text = [{
    id: 'default-modal',
    photo: 'dr_no.png',
    color: '#e03a3a',
    text: 'Mr. Bond, how do you like your tea?'
  }, {
    id: 'default-modal',
    photo: 'moneypenny.png',
    color: 'rgb(154, 192, 154)',
    text: 'A gun and a radio. Not exactly Christmas, is it?'
   }, {
    id: 'default-modal',
    photo: 'm.png',
    color: 'rgb(124, 124, 255)',
    text: 'A license to kill is also a license not to kill.'
  }, {
    id: 'default-modal',
    photo: 'honey_ryder.png',
    color: 'rgba(180, 99, 180)',
    text: 'James, where have you been? I thought you were on a plane.'
  }]

  profile = {};
  sub: any;

  constructor(public modalService: ModalService, public elementRef: ElementRef) {
  }

  get showReactiveProfileEditor() {
    return this.editor === 'reactive';
  }

  get showTemplateProfileEditor() {
    return this.editor === 'template-driven';
  }

  get showStandardProfileEditor() {
    return this.editor === 'standard';
  }

  toggleEditor(type: EditorType) {
    this.editor = type;
    switch(type) {
      case 'reactive':
        this.class = 'author';
        break;
      case 'template-driven':
        this.class = 'agent';
        break;
      case 'standard':
        this.class = 'model';
        break;
    }
  }

  ngAfterViewInit() {
    this.modalService.set(this.viewContainerRef);
  }

  shuffle(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
  }

  readMessages() {

    const updating$ = new BehaviorSubject<boolean>(false);
    this.sub = from(this.shuffle(this.text)).pipe(
      mergeMap((value) => from(updating$).pipe(filter(value => !value), take(1), map(() => value), tap(() => updating$.next(false)))),
      concatMap((value) => from(this.modalService.open(value).written$).pipe(filter((value)=> value), take(1), map(() => value))),
      tap(() => this.text.shift())
    ).subscribe();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
