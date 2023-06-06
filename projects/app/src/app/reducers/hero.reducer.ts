import { Action } from '@ngrx/store';
import { FormState } from 'ngync';
import { initialHero } from '../models/profile';



export interface HeroState extends FormState {}



export const initialState: HeroState = {
  model: initialHero,
};



export function profileReducer(state = initialState, action: Action): HeroState {
  switch (action.type) {
    default: {
      return state;
    }
  }
}
