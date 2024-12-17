import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { BehaviorSubject, concatMap, delay, iif, map, of, takeWhile, tap, timer } from 'rxjs';
import { messenger } from '../../animations/animations';
import { ModalService } from '../../services/modal.service';

@Component({
    selector: 'messenger',
    templateUrl: './messenger.component.html',
    styleUrls: ['./messenger.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: [messenger],
    standalone: false
})
export class MessengerComponent implements OnInit, OnDestroy {
  @Input() id = 'default-modal';
  @Input() data = {} as any;

  element: HTMLElement;

  written$ = new BehaviorSubject<boolean>(false);
  destroyed$ = new BehaviorSubject<boolean>(false);
  message$: any;

  constructor(private modalService: ModalService, private el: ElementRef) {
    this.element = el.nativeElement;
  }

  ngOnInit() {
    this.id = this.data.id;

    this.message$ = of(this.data).pipe(
      concatMap((selected) => { let str = ''; return timer(0, 90).pipe(
        tap(i => str += selected.text.charAt(i)),
        takeWhile(i => i <= selected.text.length && this.destroyed$.value === false),
        concatMap(i => iif(() => i < selected.text.length, of(i), of(i).pipe(delay(4500), tap(() => this.written())))),
        map(() => str))
      }));

    document.addEventListener('click', (el: any) => {
      if (el.target.className.includes('modal')) {
        this.modalService.close(this.element);
      }
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();

    this.written$.next(true);
    this.written$.complete();
  }

  written() {
    this.written$.next(true);
    this.written$.complete();
  }

  animationDone(e: any) {
    e.toState === 'void' && this.modalService.close(this.element);
  }
}
