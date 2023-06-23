import { EmbeddedViewRef, Injectable, ViewContainerRef } from '@angular/core';
import { MessengerComponent } from '../components/messenger/messenger.component';

@Injectable({ providedIn: 'root' })
export class ModalService {
  viewContainerRef!: ViewContainerRef;

  set(value: ViewContainerRef) {
    this.viewContainerRef = value;
  }

  open(data: any) {
    const componentRef = this.viewContainerRef.createComponent(MessengerComponent);
    componentRef.instance.data = data;
    this.viewContainerRef.insert(componentRef.hostView);
    return componentRef.instance;
  }

  pop() {
    if(this.viewContainerRef.length === 0) { return; }
    this.viewContainerRef.remove(0);
  }

  close(modal: HTMLElement) {
    for(let i = 0; i < this.viewContainerRef.length; i++) {
      let viewRef = this.viewContainerRef.get(i)! as EmbeddedViewRef<any>;
      if(viewRef.rootNodes.some(node => node === modal)) {
        this.viewContainerRef.remove(i);
        break;
      }
    }
  }
}
