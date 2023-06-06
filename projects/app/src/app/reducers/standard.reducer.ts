import { Action } from '@ngrx/store';
import { FormState } from 'ngync';
import { initialModel } from '../models/profile';



export interface ModelState extends FormState {}



export const initialState: ModelState = {
  model: initialModel,
};



export function profileReducer(state = initialState, action: Action): ModelState {
  switch (action.type) {
    default: {
      return state;
    }
  }
}
