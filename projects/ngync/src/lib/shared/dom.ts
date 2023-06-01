import { Injectable, OnDestroy } from "@angular/core";
import { Observable, Subject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DomObserver implements OnDestroy {
  static _observers = new Set<MutationObserver>();
  static _elementsUnderObservation = new Map();

  constructor() {}

  static unmounted(element: HTMLElement): Observable<boolean> {
    let record = DomObserver._elementsUnderObservation.get(element);

    if(record?.unmounted) {
      return record?.unmounted;
    }

    let event = new Subject<boolean>();
    record.unmounted = event;
    DomObserver._elementsUnderObservation.set(element, record);

    const observer = new MutationObserver(elements => {
      elements.forEach(item => {
        item.removedNodes.forEach(node => {
          let treeItem = element;
          while(treeItem && node !== treeItem) {
            treeItem = treeItem.parentNode as HTMLElement;
          }
          if(node === treeItem) {
            DomObserver.disconnect(observer);
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

    DomObserver._observers.add(observer);
    return event;
  }

  static children(element: HTMLElement): Observable<number> {
    let record = DomObserver._elementsUnderObservation.get(element);

    if(record?.children) {
      return record?.children;
    }

    let event = new Subject<number>();

    record.children = event;
    DomObserver._elementsUnderObservation.set(element, record);

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
    DomObserver._observers.add(observer);
    return event;
  }

  static mounted(element: HTMLElement) {
    return document.contains(element);
  }

  static disconnect(observer: MutationObserver) {
    observer.disconnect();
    DomObserver._observers.delete(observer);
  }

  ngOnDestroy() {
    for (const observer of DomObserver._observers) {
      observer.disconnect();
    }

    for (const [key, value] of DomObserver._elementsUnderObservation) {
      value.children?.complete();
      value.unmounted?.complete();
    }
  }
}
