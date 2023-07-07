import { Action } from '@ngrx/store';
import { Profile, initialProfile } from '../models/profile';



export type ProfileState = Profile



export const initialState: ProfileState = initialProfile;



export function profileReducer(state = initialState, action: Action): ProfileState {
  switch (action.type) {
    default: {
      return state;
    }
  }
}
