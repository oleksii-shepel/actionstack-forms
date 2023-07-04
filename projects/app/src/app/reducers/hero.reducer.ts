import { Action } from '@ngrx/store';
import { Hero, initialHero } from '../models/profile';



export interface HeroState extends Hero {}
export const initialState: HeroState = initialHero;



export function profileReducer(state = initialState, action: Action): HeroState {
  switch (action.type) {
    default: {
      return state;
    }
  }
}
