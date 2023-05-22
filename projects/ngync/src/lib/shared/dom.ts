import { Injectable } from "@angular/core";
import { SharedModule } from "./module";

@Injectable({
  providedIn: SharedModule,
})
export class DOMObserver {
  constructor() {}

  observe(element: HTMLElement, callback: (mutations: MutationRecord[]) => void) {
    const observer = new MutationObserver(callback);
    observer.observe(element, { attributes: true, childList: true, subtree: true });
    return observer;
  }

  disconnect(observer: MutationObserver) {
    observer.disconnect();
  }
}
