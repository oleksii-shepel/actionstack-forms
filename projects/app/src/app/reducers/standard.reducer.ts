import { Action } from '@ngrx/store';
import { FormCast } from 'ngync';
import { initialModel } from '../models/profile';



export interface ModelState extends FormCast {}



export const initialState: ModelState = {
  value: initialModel,
};



export function profileReducer(state = initialState, action: Action): ModelState {
  switch (action.type) {
    default: {
      return state;
    }
  }
}
