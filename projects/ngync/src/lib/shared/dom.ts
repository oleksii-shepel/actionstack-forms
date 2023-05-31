import { Injectable, OnDestroy } from "@angular/core";
import { Observable, Subject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DomObserver implements OnDestroy {
  static _unmounted = new Set<MutationObserver>();
  static _children = new Set<MutationObserver>();

  static _elementsWithChangeDetection = new Map();
  static _elementsUnderObservation = new Map();

  constructor() {}

  static unmounted(element: HTMLElement): Observable<boolean> {
    if(DomObserver._elementsUnderObservation.has(element)) {
      return DomObserver._elementsUnderObservation.get(element);
    }

    let event = new Subject<boolean>();
    DomObserver._elementsUnderObservation.set(element, event);

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

    DomObserver._unmounted.add(observer);
    return event;
  }

  static children(element: HTMLElement): Observable<number> {
    if(DomObserver._elementsWithChangeDetection.has(element)) {
      return DomObserver._elementsWithChangeDetection.get(element);
    }

    let event = new Subject<number>();
    DomObserver._elementsWithChangeDetection.set(element, event);

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
    DomObserver._children.add(observer);
    return event;
  }

  static mounted(element: HTMLElement) {
    return document.contains(element);
  }

  static disconnect(observer: MutationObserver) {
    observer.disconnect();
    DomObserver._unmounted.delete(observer);
  }

  ngOnDestroy() {
    for (const observer of DomObserver._unmounted) {
      observer.disconnect();
    }

    for (const [key, value] of DomObserver._elementsWithChangeDetection) {
      value.complete();
    }

    for (const observer of DomObserver._children) {
      observer.disconnect();
    }

    for (const [key, value] of DomObserver._elementsUnderObservation) {
      value.complete();
    }
  }
}
