import { Component, ElementRef, HostBinding, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, filter, map, switchMap, timer } from 'rxjs';
import { occurence } from '../../animations/animations';
import { ModalService } from '../../services/modal.service';

export type EditorType = 'reactive' | 'template-driven' | 'standard';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [occurence]
})
export class AppComponent implements OnDestroy {
  @HostBinding('class') class ='author';
  @ViewChild('template') templateRef!: TemplateRef<any>;

  editor: EditorType = 'reactive';

  text = [
    'Mr. Bond, life without foe is just as bad as listening to the Beatles without earmuffs!',
    'Mr. Bond, this is indeed a pleasure to look after all your attempts to master the computer.',
    'Mr. Bond, I want to offer you a deal. I\'ll give you the access codes to the missile control system, and you\'ll give me the password to the computer system. Agreed?',
    'Mr. Bond, despite the fact that we are enemies, I offer you my delightful disruptive services',
    'Mr. Bond, sometimes I think you\'re the only one who understands me.',
  ]

  message: Observable<string>;

  profile = {};

  hackedReactive = false;
  hackedTemplateDriven = false;
  hackedModelDriven = false;

  hacked$ = new BehaviorSubject<boolean>(false);

  sub: any;

  constructor(public modalService: ModalService, public elementRef: ElementRef) {

    this.message = this.hacked$.pipe(
      filter(value => value),
      switchMap(() => {let str = '', index = Math.floor(this.text.length * Math.random()); return timer(0, 80).pipe(
        map((i) => {
          if(i < this.text[index].length) {
            str += this.text[index].charAt(i);
          }
          return str;
        })
      )}
    ));
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

  getCaption(type: string) {
    switch(type) {
      case 'reactive':
        return !this.hackedReactive ? 'Author' : 'Villain';
      case 'template-driven':
        return !this.hackedTemplateDriven ? 'Agent' : 'Villain';
      case 'standard':
        return !this.hackedModelDriven ? 'Model' : 'Villain';
    }

    return '';
  }

  showModal(type: string) {
    switch(type) {
      case 'reactive':
        this.hackedReactive = true;
        break;
      case 'template-driven':
        this.hackedTemplateDriven = true;
        break;
      case 'standard':
        this.hackedModelDriven = true;
        break;
    }

    this.hacked$.next(true);
    this.modalService.open(this.templateRef);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
