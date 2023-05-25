import { Action } from '@ngrx/store';
import { FormState } from 'ngync';
import { Profile, initialProfile } from '../models/profile';



export interface HeroState extends FormState<Profile> {}



export const initialState: HeroState = {
  model: initialProfile,
};



export function profileReducer(state = initialState, action: Action): HeroState {
  switch (action.type) {
    default: {
      return state;
    }
  }
}
