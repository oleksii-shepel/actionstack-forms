import { Action } from '@ngrx/store';
import { HeroPage, initialHeroPage } from '../models/profile';


export function profileReducer(state = initialHeroPage, action: Action): HeroPage {
  switch (action.type) {
    default: {
      return state;
    }
  }
}
