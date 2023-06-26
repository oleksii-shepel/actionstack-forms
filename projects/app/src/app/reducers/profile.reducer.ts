import { Action } from '@ngrx/store';
import { FormState } from 'ngync';
import { initialProfile } from '../models/profile';



export interface ProfileState extends FormState {}



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
