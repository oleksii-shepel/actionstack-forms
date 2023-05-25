import { Action } from '@ngrx/store';
import { FormState } from 'ngync';
import { Profile, initialProfile } from '../models/profile';



export interface ProfileState extends FormState<Profile> {}



export const initialState: ProfileState = {
  model: initialProfile,
};



export function profileReducer(state = initialState, action: Action): ProfileState {
  switch (action.type) {
    default: {
      return state;
    }
  }
}
