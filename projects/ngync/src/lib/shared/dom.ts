import { Injectable, OnDestroy } from "@angular/core";
import { Observable, Subject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DomObserver implements OnDestroy {
  _observers = new Set<MutationObserver>();
  _elementsUnderObservation = new Map();

  unmounted(element: HTMLElement): Observable<boolean> {
    let record = this._elementsUnderObservation.get(element);

    if(record?.unmounted) {
      return record?.unmounted;
    }

    const event = new Subject<boolean>();
    record = {...record, unmounted: event};
    this._elementsUnderObservation.set(element, record);

    const observer = new MutationObserver(elements => {
      elements.forEach(item => {
        item.removedNodes.forEach(node => {
          let treeItem = element;
          while(treeItem && node !== treeItem) {
            treeItem = treeItem.parentNode as HTMLElement;
          }
          if(node === treeItem) {
            this.disconnect(observer);
            event.next(true);
            event.complete();
          }
        });
      });
    });

    let parent = element.parentNode;
    while(parent){
      observer.observe(parent, { childList: true });
      parent = parent.parentNode as HTMLElement;
    }

    this._observers.add(observer);
    return event;
  }

  children(element: HTMLElement): Observable<number> {
    let record = this._elementsUnderObservation.get(element);

    if(record?.children) {
      return record?.children;
    }

    const event = new Subject<number>();

    record = {...record, children: event};
    this._elementsUnderObservation.set(element, record);

    const observer = new MutationObserver(elements => {
      elements.forEach(item => {
        if(item.addedNodes.length) {
          event.next(item.addedNodes.length);
        }

        if(item.removedNodes.length) {
          event.next(-item.removedNodes.length);
        }
      });
    });

    observer.observe(element, { childList: true, subtree: true });
    this._observers.add(observer);
    return event;
  }

  static mounted(element: HTMLElement) {
    return document.contains(element);
  }

  disconnect(observer: MutationObserver) {
    observer.disconnect();
    this._observers.delete(observer);
  }

  ngOnDestroy() {
    for (const observer of this._observers) {
      observer.disconnect();
    }

    for (const [key, value] of this._elementsUnderObservation) {
      value.children?.complete();
      value.unmounted?.complete();
    }
  }
}
