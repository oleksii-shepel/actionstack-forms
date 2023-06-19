import { AUTO_STYLE, animate, state, style, transition, trigger } from "@angular/animations";

export const occurence = trigger('occurence', [
  state('false', style({
    height: AUTO_STYLE,
    opacity: 1,
  })),
  state('true', style({
    height: AUTO_STYLE,
    opacity: 0,
  })),
  transition('* => true', [
    animate('0.5s')
  ]),
  transition('* => false', [
    animate('0.5s')
  ]),
])
