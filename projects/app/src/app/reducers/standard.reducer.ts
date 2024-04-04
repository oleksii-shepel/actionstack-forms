import { Action } from '@actioncrew/actionstack';
import { ModelPage, initialModelPage } from '../models/profile';



export function profileReducer(state: any = initialModelPage, action: Action): ModelPage {
  switch (action.type) {
    default: {
      return state;
    }
  }
}
