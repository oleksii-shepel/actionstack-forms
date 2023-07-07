import { Action } from '@ngrx/store';
import { Hero, initialHero } from '../models/profile';



export type HeroState = Hero



export const initialState: HeroState = initialHero;



export function profileReducer(state = initialState, action: Action): HeroState {
  switch (action.type) {
    default: {
      return state;
    }
  }
}
