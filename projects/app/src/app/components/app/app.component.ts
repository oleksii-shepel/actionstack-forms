import { Component, ElementRef, HostBinding, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, filter, map, switchMap, timer } from 'rxjs';
import { occurence } from '../../animations/animations';
import { ModalService } from '../../services/modal.service';

export type EditorType = 'reactive' | 'template-driven' | 'standard';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [occurence]
})
export class AppComponent implements OnDestroy {
  @HostBinding('class') class ='author';
  editor: EditorType = 'reactive';

  text = [
    'Mr. Bond, you have just made a big mistake and you will regret it very soon. I promise you...',
    'Mr. Bond, my hackers deliberately have hacked your computer. Looking forward to your next steps...',
    'Mr. Bond, that\'s a Dom Pérignon \'55. It would be a pity not to have a drink with you...',
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
    this.modalService.open('modal');
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
