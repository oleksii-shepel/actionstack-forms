import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { ModalService, ModalWindow } from '../../services/modal.service';

@Component({
  selector: 'hacked-modal',
  templateUrl: './hacked-banner.component.html',
  styleUrls: ['./hacked-banner.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HackedBannerComponent extends ModalWindow implements OnInit, OnDestroy {
  @Input() override id = 'default-modal';
  override isOpen = false;
  element: HTMLElement;

  constructor(private modalService: ModalService, private el: ElementRef) {
    super();
    this.element = el.nativeElement;
  }

  ngOnInit() {
    this.modalService.add(this);
    document.body.appendChild(this.element);

    this.element.addEventListener('click', (el: any) => {
      if (el.target.className === 'modal') {
        this.close();
      }
    });
  }

  ngOnDestroy() {
    this.modalService.remove(this);
    this.element.remove();
  }

  override open() {
    this.element.style.display = 'flex';
    document.body.classList.add('modal-open');
    this.isOpen = true;
  }

  override close() {
    this.element.style.display = 'none';
    document.body.classList.remove('modal-open');
    this.isOpen = false;
  }
}
