import { Action } from '@ngrx/store';
import { ModelPage, initialModelPage } from '../models/profile';



export function profileReducer(state = initialModelPage, action: Action): ModelPage {
  switch (action.type) {
    default: {
      return state;
    }
  }
}
