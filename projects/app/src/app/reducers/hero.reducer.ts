import { Action } from '@actioncrew/actionstack';
import { HeroPage, initialHeroPage } from '../models/profile';


export function profileReducer(state: any = initialHeroPage, action: Action): HeroPage {
  switch (action.type) {
    default: {
      return state;
    }
  }
}
