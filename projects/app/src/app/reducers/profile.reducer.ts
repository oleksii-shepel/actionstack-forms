import { Action } from '@ngrx/store';
import { FormCast } from 'ngync';
import { initialProfile } from '../models/profile';



export interface ProfileState extends FormCast {}



export const initialState: ProfileState = {
  value: initialProfile,
};



export function profileReducer(state = initialState, action: Action): ProfileState {
  switch (action.type) {
    default: {
      return state;
    }
  }
}
