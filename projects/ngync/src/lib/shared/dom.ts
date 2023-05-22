import { Injectable, OnDestroy } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class DomObserver implements OnDestroy {
  static observers = new Set<MutationObserver>();

  constructor() {}

  static unmounted(element: HTMLElement, callback: () => void) {
    const observer = new MutationObserver(elements => {
      elements.forEach(item => {
        item.removedNodes.forEach(node => {
          let treeItem = element;
          while(treeItem && node !== treeItem) {
            treeItem = treeItem.parentNode as HTMLElement;
          }
          if(node === treeItem) {
            callback();
          }
        });
      });
    });

    let parent = element.parentNode;
    while(parent){
      observer.observe(parent, { childList: true });
      parent = parent.parentNode as HTMLElement;
    }

    DomObserver.observers.add(observer);
    return observer;
  }

  static disconnect(observer: MutationObserver) {
    observer.disconnect();
    DomObserver.observers.delete(observer);
  }

  ngOnDestroy() {
    for (const observer of DomObserver.observers) {
      observer.disconnect();
    }
  }
}
