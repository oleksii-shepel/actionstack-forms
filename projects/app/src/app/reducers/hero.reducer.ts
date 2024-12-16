import { Action } from '@actionstack/angular';
import { HeroPage, initialHeroPage } from '../models/profile';


export function profileReducer(state: any = initialHeroPage, action: Action): HeroPage {
  switch (action.type) {
    default: {
      return state;
    }
  }
}
