import { Injectable } from '@angular/core';

export class ModalWindow {
  id: string | undefined;
  isOpen: boolean;

  constructor() {
    this.id = undefined;
    this.isOpen = false;
  }

  open() {}

  close() {}
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private modals: ModalWindow[] = [];

  add(modal: ModalWindow) {
    if (!modal.id || this.modals.find((x) => x.id === modal.id)) {
      throw new Error('modal must have a unique id attribute');
    }

    this.modals.push(modal);
  }

  remove(modal: ModalWindow) {
    this.modals = this.modals.filter((x) => x === modal);
  }

  open(id: string) {
    const modal = this.modals.find((x) => x.id === id);

    if (!modal) {
      throw new Error(`modal '${id}' not found`);
    }

    modal.open();
  }

  close() {
    const modal = this.modals.find((x) => x.isOpen);
    modal?.close();
  }
}
