import { Action } from '@ngrx/store';
import { Profile, initialProfile } from '../models/profile';



export interface ProfileState extends Profile {}
export const initialState: ProfileState = initialProfile;



export function profileReducer(state = initialState, action: Action): ProfileState {
  switch (action.type) {
    default: {
      return state;
    }
  }
}
