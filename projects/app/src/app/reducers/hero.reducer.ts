import { Action } from '@ngrx/store';
import { FormCast } from 'ngync';
import { initialHero } from '../models/profile';



export interface HeroState extends FormCast {}



export const initialState: HeroState = {
  value: initialHero,
};



export function profileReducer(state = initialState, action: Action): HeroState {
  switch (action.type) {
    default: {
      return state;
    }
  }
}
