import { Action } from '@actionstack/angular';
import { ModelPage, initialModelPage } from '../models/profile';



export function profileReducer(state: any = initialModelPage, action: Action): ModelPage {
  switch (action.type) {
    default: {
      return state;
    }
  }
}
