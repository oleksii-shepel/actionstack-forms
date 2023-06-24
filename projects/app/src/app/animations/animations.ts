import { AUTO_STYLE, animate, style, transition, trigger } from "@angular/animations";

export const occurence = trigger('occurence', [
  transition('void => *', [
    style({ opacity: 0, width: 0}),
    animate('0.5s', style({ opacity: 1, width: AUTO_STYLE })),
  ]),
  transition('* => void', [
    style({ opacity: 1, width: AUTO_STYLE }),
    animate('0.5s', style({ opacity: 0, width: 0 })),
  ]),
])

export const messenger = trigger('messenger', [
  transition('void => *', [
    style({ opacity: 0, width: 0}),
    animate('0.5s', style({ opacity: 1, width: AUTO_STYLE })),
  ]),
  transition('* => void', [
    style({ opacity: 1 }),
    animate('0.5s', style({ opacity: 0 })),
  ]),
])
