import { Action } from '@ngrx/store';
import { ModelPage } from '../models/profile';



export function profileReducer(state: any, action: Action): ModelPage {
  switch (action.type) {
    default: {
      return state;
    }
  }
}
