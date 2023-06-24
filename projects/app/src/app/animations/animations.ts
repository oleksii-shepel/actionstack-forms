import { AUTO_STYLE, animate, style, transition, trigger } from "@angular/animations";

export const occurence = trigger('occurence', [
  transition('void => *', [
    style({ display: 'block', opacity: 0, width: 0}),
    animate('0.5s', style({ display: 'block', opacity: 1, width: AUTO_STYLE })),
    style({ display: 'block'}),
  ]),
  transition('* => void', [
    style({ display: 'block', opacity: 1, width: AUTO_STYLE }),
    animate('0.5s', style({ display: 'block', opacity: 0, width: 0 })),
    style({ display: 'none' }),
  ]),
])
