import { Action } from '@ngrx/store';
import { HeroPage } from '../models/profile';


export function profileReducer(state: any, action: Action): HeroPage {
  switch (action.type) {
    default: {
      return state;
    }
  }
}
